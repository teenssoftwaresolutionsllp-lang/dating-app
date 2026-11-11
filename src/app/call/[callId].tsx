import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Image,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getAgora,
  isAgoraSupported,
  createSafeAgoraEngine,
  ChannelProfileType,
  ClientRoleType,
  type IRtcEngine,
} from '../../services/agoraClient';
import { callApi } from '../../services/callApi';

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    callId: string;
    channelName: string;
    token: string;
    appId: string;
    uid: string;
    callType: 'audio' | 'video';
    matchName?: string;
    matchAvatar?: string;
    isCaller?: string;
  }>();

  const {
    callId,
    channelName,
    token,
    appId,
    uid,
    callType = 'video',
    matchName = 'Match',
    matchAvatar,
  } = params;

  const isCaller = params.isCaller !== 'false';
  const engine = useRef<IRtcEngine | null>(null);

  const agoraSupported = isAgoraSupported();
  const agoraModule = getAgora();
  const RtcSurfaceView = agoraModule?.RtcSurfaceView;

  const [callStatus, setCallStatus] = useState<
    'ringing' | 'connected' | 'ended' | 'rejected' | 'missed'
  >(isCaller ? 'ringing' : 'connected');
  const [statusMessage, setStatusMessage] = useState<string>(
    isCaller ? `Ringing ${matchName}...` : 'Connecting...'
  );

  const [joined, setJoined] = useState(!isCaller);
  const [remoteUid, setRemoteUid] = useState<number | null>(
    agoraSupported ? null : (isCaller ? null : 1001)
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const callDurationRef = useRef(0);
  const [initError, setInitError] = useState<string | null>(null);

  // Poll call state for the caller (wait for receiver to accept, reject, or time out)
  useEffect(() => {
    if (!callId || callStatus !== 'ringing') return;

    let active = true;
    let pollCount = 0;
    const maxPolls = 18; // ~30 seconds timeout

    const checkStatus = async () => {
      try {
        pollCount += 1;
        const res = await callApi.getCallStatus(callId);
        if (!active || !res) return;

        if (res.status === 'accepted') {
          setCallStatus('connected');
          setStatusMessage('Connected');
          setJoined(true);
          if (!agoraSupported) {
            setRemoteUid(1001);
          }
          return;
        }

        if (res.status === 'rejected') {
          setCallStatus('rejected');
          setStatusMessage(`Call declined by ${matchName}`);
          setTimeout(() => {
            if (active) router.back();
          }, 1800);
          return;
        }

        if (res.status === 'missed' || pollCount >= maxPolls) {
          setCallStatus('missed');
          setStatusMessage(`${matchName} is unavailable / Offline`);
          setTimeout(() => {
            if (active) router.back();
          }, 2400);
          return;
        }

        if (res.status === 'ended') {
          setCallStatus('ended');
          setStatusMessage('Call ended');
          setTimeout(() => {
            if (active) router.back();
          }, 1500);
          return;
        }
      } catch (err) {
        console.warn('Call status check error:', err);
      }
    };

    const interval = setInterval(checkStatus, 1700);
    checkStatus();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [callId, callStatus, matchName, agoraSupported]);

  // Poll call state while connected so both parties immediately exit when either ends the call
  useEffect(() => {
    if (!callId || callStatus !== 'connected') return;

    let active = true;
    const checkConnectedStatus = async () => {
      try {
        const res = await callApi.getCallStatus(callId);
        if (!active || !res) return;

        if (res.status === 'ended' || res.status === 'rejected' || res.status === 'missed') {
          setCallStatus('ended');
          setStatusMessage('Call ended');
          setTimeout(() => {
            if (active) router.back();
          }, 1200);
        }
      } catch (err) {
        // silent
      }
    };

    const interval = setInterval(checkConnectedStatus, 2500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [callId, callStatus]);

  // Timer counter (only runs when actively connected)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (callStatus === 'connected' && (joined || remoteUid)) {
      timer = setInterval(() => {
        setCallDuration((prev) => {
          const next = prev + 1;
          callDurationRef.current = next;
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus, joined, remoteUid]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle hardware back button
  useEffect(() => {
    const onBackPress = () => {
      handleEndCall();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();
  }, [callId, callDuration]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
      } catch (err) {
        console.warn('Permissions error:', err);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupRTC = async () => {
      try {
        await requestPermissions();

        if (!appId || !token || !channelName) {
          setInitError('Call credentials missing');
          return;
        }

        // Expo Go or unlinked environment fallback
        if (!agoraSupported || appId === 'dev_mock_agora_app_id') {
          if (isMounted && !isCaller) {
            setJoined(true);
            setRemoteUid(1001);
          }
          return;
        }

        const rtcEngine = createSafeAgoraEngine();
        if (!rtcEngine) {
          if (isMounted && !isCaller) {
            setJoined(true);
            setRemoteUid(1001);
          }
          return;
        }

        engine.current = rtcEngine;
        rtcEngine.initialize({ appId });

        rtcEngine.registerEventHandler({
          onJoinChannelSuccess: () => {
            if (isMounted) setJoined(true);
          },
          onUserJoined: (_connection, uId) => {
            if (isMounted) {
              setRemoteUid(uId);
              setCallStatus('connected');
            }
          },
          onUserOffline: (_connection, _uId) => {
            if (isMounted) {
              setRemoteUid(null);
              handleEndCall();
            }
          },
          onError: (errCode) => {
            console.warn('Agora RTC Error:', errCode);
          },
        });

        if (callType === 'video') {
          rtcEngine.enableVideo();
          rtcEngine.startPreview();
        } else {
          rtcEngine.enableAudio();
        }

        rtcEngine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

        rtcEngine.joinChannel(token, channelName, Number(uid) || 0, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
      } catch (error: any) {
        if (isMounted) {
          setInitError(error?.message || 'Failed to initialize Agora RTC');
        }
      }
    };

    setupRTC();

    return () => {
      isMounted = false;
      if (engine.current) {
        try {
          engine.current.leaveChannel();
          engine.current.release();
        } catch {}
      }
    };
  }, []);

  const toggleMute = () => {
    if (engine.current) {
      engine.current.muteLocalAudioStream(!isMuted);
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (engine.current) {
      if (isVideoEnabled) {
        engine.current.disableVideo();
      } else {
        engine.current.enableVideo();
        engine.current.startPreview();
      }
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const switchCamera = () => {
    if (engine.current && isVideoEnabled) {
      engine.current.switchCamera();
    }
  };

  const toggleSpeaker = () => {
    if (engine.current) {
      engine.current.setEnableSpeakerphone(!isSpeakerOn);
    }
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = async () => {
    try {
      if (callId) {
        const finalDuration = callDurationRef.current || callDuration;
        await callApi.endCall(callId, finalDuration);
      }
    } catch (err) {
      console.warn('End call API error:', err);
    } finally {
      if (engine.current) {
        try {
          engine.current.leaveChannel();
          engine.current.release();
        } catch {}
      }
      router.back();
    }
  };

  if (initError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorTitle}>Call Failed</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

  return (
    <SafeAreaView style={styles.container}>
      {/* Dev / Expo Go Info Badge */}
      {!agoraSupported && (
        <View style={styles.expoGoBanner}>
          <Ionicons name="information-circle" size={16} color="#FBBF24" />
          <Text style={styles.expoGoBannerText}>
            Expo Go mode: live camera/video streaming requires an Expo Development Build.
          </Text>
        </View>
      )}

      {/* Ringing or Inactive Call Status Overlay */}
      {callStatus !== 'connected' ? (
        <View style={styles.ringingContainer}>
          <View style={styles.ringingAvatarContainer}>
            <Image
              source={{ uri: matchAvatar || defaultAvatar }}
              style={styles.ringingAvatar}
            />
            {callStatus === 'ringing' && (
              <ActivityIndicator
                size="large"
                color="#EC4899"
                style={styles.ringingSpinner}
              />
            )}
          </View>
          <Text style={styles.ringingMatchName}>{matchName}</Text>
          <Text
            style={[
              styles.ringingStatusText,
              callStatus === 'rejected' && styles.errorText,
              callStatus === 'missed' && styles.warningText,
            ]}
          >
            {statusMessage}
          </Text>

          {/* End / Cancel Call Button */}
          <View style={styles.ringingControls}>
            <TouchableOpacity
              style={styles.cancelCallBtn}
              onPress={handleEndCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={32} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.cancelCallLabel}>
              {callStatus === 'ringing' ? 'Cancel' : 'Exit'}
            </Text>
          </View>
        </View>
      ) : isVideoEnabled ? (
        <View style={styles.videoContainer}>
          {agoraSupported && RtcSurfaceView && remoteUid ? (
            <View style={{ flex: 1, position: 'relative' }}>
              <RtcSurfaceView style={styles.remoteVideo} canvas={{ uid: remoteUid }} />
              <View style={styles.floatingVideoHeader}>
                <Text style={styles.floatingVideoName}>{matchName}</Text>
                <View style={styles.durationBadge}>
                  <View style={styles.durationDot} />
                  <Text style={styles.durationBadgeText}>{formatTimer(callDuration)}</Text>
                </View>
              </View>
            </View>
          ) : remoteUid ? (
            // Simulated Video View
            <View style={styles.simulatedVideoWrapper}>
              <Image
                source={{ uri: matchAvatar || defaultAvatar }}
                style={styles.simulatedVideoBg}
                blurRadius={10}
              />
              <View style={styles.simulatedVideoOverlay}>
                <Image
                  source={{ uri: matchAvatar || defaultAvatar }}
                  style={styles.simulatedAvatar}
                />
                <Text style={styles.simulatedMatchName}>{matchName}</Text>
                <Text style={styles.timerText}>{formatTimer(callDuration)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.waitingContainer}>
              <ActivityIndicator size="large" color="#EC4899" style={{ marginBottom: 16 }} />
              <Text style={styles.waitingText}>Connecting to {matchName}...</Text>
            </View>
          )}

          {/* Picture-in-Picture Local Camera View */}
          <View style={styles.localVideoContainer}>
            {agoraSupported && RtcSurfaceView ? (
              <RtcSurfaceView
                style={styles.localVideo}
                canvas={{ uid: 0 }}
                zOrderMediaOverlay={true}
              />
            ) : (
              <View style={styles.simulatedLocalVideo}>
                <Ionicons name="person" size={32} color="#FFF" />
                <Text style={styles.simulatedLocalText}>You</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.audioContainer}>
          <Image
            source={{ uri: matchAvatar || defaultAvatar }}
            style={styles.avatar}
          />
          <Text style={styles.matchName}>{matchName}</Text>
          <Text style={styles.timerText}>
            {remoteUid ? formatTimer(callDuration) : 'Connecting...'}
          </Text>
        </View>
      )}

      {/* Floating Control Dock (Visible when Connected) */}
      {callStatus === 'connected' && (
        <View style={styles.controlBar}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.activeControlBtn]}
            onPress={toggleMute}
            activeOpacity={0.8}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, !isVideoEnabled && styles.activeControlBtn]}
            onPress={toggleVideo}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isVideoEnabled ? 'videocam' : 'videocam-off'}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          {isVideoEnabled && (
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={switchCamera}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-reverse" size={24} color="#FFF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.controlBtn, isSpeakerOn && styles.speakerActiveBtn]}
            onPress={toggleSpeaker}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallBtn}
            onPress={handleEndCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  expoGoBanner: {
    backgroundColor: '#78350F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  expoGoBannerText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'center',
  },
  ringingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ringingAvatarContainer: {
    position: 'relative',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringingAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#EC4899',
  },
  ringingSpinner: {
    position: 'absolute',
  },
  ringingMatchName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  ringingStatusText: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 48,
  },
  errorText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  warningText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  ringingControls: {
    alignItems: 'center',
  },
  cancelCallBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
    marginBottom: 8,
  },
  cancelCallLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
  },
  simulatedVideoWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulatedVideoBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  simulatedVideoOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  simulatedAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#EC4899',
    marginBottom: 16,
  },
  simulatedMatchName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 105,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#EC4899',
    elevation: 8,
    backgroundColor: '#1E293B',
    zIndex: 5,
  },
  localVideo: {
    flex: 1,
  },
  simulatedLocalVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  simulatedLocalText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#EC4899',
    marginBottom: 24,
  },
  matchName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  timerText: {
    color: '#94A3B8',
    fontSize: 16,
    letterSpacing: 1,
  },
  controlBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControlBtn: {
    backgroundColor: '#64748B',
  },
  speakerActiveBtn: {
    backgroundColor: '#3B82F6',
  },
  endCallBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  floatingVideoHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  floatingVideoName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
  },
  durationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
