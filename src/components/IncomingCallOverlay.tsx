import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { callApi, type IncomingCallData } from '@/services/callApi';
import { authStorage } from '@/services/authStorage';
import { rtmChatService } from '@/services/rtmChatService';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

export function IncomingCallOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  // Pulsing animation for avatar
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (incomingCall) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // Trigger vibration pattern: wait 400ms, vibrate 600ms, wait 1000ms...
      if (Platform.OS !== 'web') {
        try {
          Vibration.vibrate([400, 600, 1000], true);
        } catch {}
      }

      return () => {
        pulseLoop.stop();
        if (Platform.OS !== 'web') {
          try {
            Vibration.cancel();
          } catch {}
        }
      };
    } else {
      pulseAnim.setValue(1);
      if (Platform.OS !== 'web') {
        try {
          Vibration.cancel();
        } catch {}
      }
    }
  }, [incomingCall]);

  // Instant Incoming Call Detection via Agora RTM (<100ms)
  useEffect(() => {
    let isMounted = true;

    // Ensure RTM client is initialized for current user
    authStorage.getUserId().then((myId) => {
      if (myId && isMounted) {
        void rtmChatService.init(myId);
      }
    });

    const unsubscribe = rtmChatService.onMessage((msg) => {
      if (msg.metadata?.event === 'INCOMING_CALL') {
        if (pathname && pathname.startsWith('/call')) {
          return;
        }

        setIncomingCall({
          id: msg.metadata.callId,
          callerId: msg.senderId,
          receiverId: msg.receiverId || '',
          channelName: msg.metadata.channelName,
          callType: msg.metadata.callType || 'video',
          status: 'ringing',
          callerName: msg.metadata.callerName || 'Match',
          callerAvatar: msg.metadata.callerAvatar || null,
        });
      } else if (
        msg.metadata?.event === 'CALL_ENDED' ||
        msg.metadata?.event === 'CALL_CANCELLED' ||
        msg.metadata?.event === 'CALL_REJECTED'
      ) {
        setIncomingCall((curr) => (curr?.id === msg.metadata?.callId ? null : curr));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [pathname]);

  // Global Polling for incoming calls (Fallback & State Sync)
  useEffect(() => {
    let isMounted = true;

    const checkIncoming = async () => {
      // Don't poll if already inside a call screen
      if (pathname && pathname.startsWith('/call')) {
        return;
      }

      try {
        const token = await authStorage.getToken();
        if (!token) return;

        const call = await callApi.getIncomingCall();
        if (!isMounted) return;

        if (call && (call.status === 'ringing' || call.status === 'initiated')) {
          setIncomingCall((prev) => (prev?.id === call.id ? prev : call));
        } else {
          // If caller ended or timed out, clear current incoming call
          setIncomingCall(null);
        }
      } catch {
        // network or auth error, silent fail
      }
    };

    // Poll every 2500ms for quick incoming call detection
    const interval = setInterval(checkIncoming, 2500);
    checkIncoming();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  const handleAccept = async () => {
    if (!incomingCall || isResponding) return;
    try {
      setIsResponding(true);
      if (Platform.OS !== 'web') {
        try {
          Vibration.cancel();
        } catch {}
      }
      const callData = incomingCall;
      const res = await callApi.acceptCall(callData.id);
      setIncomingCall(null);

      router.push({
        pathname: '/call/[callId]',
        params: {
          callId: res.callId,
          channelName: res.channelName,
          token: res.token,
          appId: res.appId,
          uid: String(res.uid),
          callType: res.callType,
          matchName: callData.callerName,
          matchAvatar: callData.callerAvatar ?? undefined,
          isCaller: 'false',
        },
      });
    } catch (err: any) {
      console.warn('Accept call error:', err);
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async () => {
    if (!incomingCall || isResponding) return;
    try {
      setIsResponding(true);
      if (Platform.OS !== 'web') {
        try {
          Vibration.cancel();
        } catch {}
      }
      await callApi.rejectCall(incomingCall.id);
    } catch (err) {
      console.warn('Reject call error:', err);
    } finally {
      setIncomingCall(null);
      setIsResponding(false);
    }
  };

  if (!incomingCall) return null;

  const isVideo = incomingCall.callType === 'video';

  return (
    <Modal
      visible={!!incomingCall}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Pulsing Avatar Container */}
          <View style={styles.avatarWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
                isVideo ? styles.videoRing : styles.audioRing,
              ]}
            />
            <Image
              source={{ uri: incomingCall.callerAvatar || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <View
              style={[
                styles.callTypeBadge,
                isVideo ? styles.videoBadge : styles.audioBadge,
              ]}
            >
              <Ionicons
                name={isVideo ? 'videocam' : 'call'}
                size={16}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* Caller Details */}
          <Text style={styles.callerName} numberOfLines={1}>
            {incomingCall.callerName}
          </Text>
          <Text style={styles.callTypeLabel}>
            Incoming {isVideo ? 'Video' : 'Audio'} Call...
          </Text>

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            {/* Decline Button */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={[styles.btn, styles.declineBtn]}
                onPress={handleReject}
                disabled={isResponding}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={30} color="#FFFFFF" style={styles.declineIcon} />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Decline</Text>
            </View>

            {/* Accept Button */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={[styles.btn, isVideo ? styles.acceptVideoBtn : styles.acceptAudioBtn]}
                onPress={handleAccept}
                disabled={isResponding}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isVideo ? 'videocam' : 'call'}
                  size={30}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Accept</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    opacity: 0.7,
  },
  videoRing: {
    borderColor: '#EC4899',
  },
  audioRing: {
    borderColor: '#10B981',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E293B',
  },
  callTypeBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  videoBadge: {
    backgroundColor: '#EC4899',
  },
  audioBadge: {
    backgroundColor: '#10B981',
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  callTypeLabel: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
  },
  actionCol: {
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  declineBtn: {
    backgroundColor: '#EF4444',
  },
  declineIcon: {
    transform: [{ rotate: '135deg' }],
  },
  acceptVideoBtn: {
    backgroundColor: '#EC4899',
  },
  acceptAudioBtn: {
    backgroundColor: '#10B981',
  },
  actionLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default IncomingCallOverlay;
