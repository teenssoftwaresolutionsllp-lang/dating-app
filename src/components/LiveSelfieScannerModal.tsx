import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Defs, Ellipse, Mask, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

interface LiveSelfieScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export function LiveSelfieScannerModal({
  visible,
  onClose,
  onCapture,
}: LiveSelfieScannerModalProps) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (visible) {
      setCaptureError(null);
      setIsCapturing(false);
      if (permission && !permission.granted && permission.canAskAgain) {
        void requestPermission();
      }
    } else {
      setCameraReady(false);
    }
  }, [visible, permission, requestPermission]);

  const ovalRx = Math.min(width * 0.36, 145);
  const ovalRy = Math.min(height * 0.23, 195);
  const centerX = width / 2;
  const centerY = height * 0.46;

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || !cameraReady) return;
    setIsCapturing(true);
    setCaptureError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onCapture(photo.uri);
        onClose();
      } else {
        setCaptureError('Could not capture photo. Please try again.');
      }
    } catch (err: any) {
      console.warn('[LiveSelfieScanner] Capture error:', err);
      setCaptureError('Failed to capture selfie. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const hasPermission = Boolean(permission?.granted);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {hasPermission ? (
          <View style={styles.cameraContainer}>
            {/* Strictly locked to front camera: no camera-switch option */}
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="front"
              mirror
              onCameraReady={() => setCameraReady(true)}
            />

            {/* Darkened surround with transparent oval cutout */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width={width} height={height}>
                <Defs>
                  <Mask id="ovalMask">
                    <Rect x="0" y="0" width={width} height={height} fill="white" />
                    <Ellipse
                      cx={centerX}
                      cy={centerY}
                      rx={ovalRx}
                      ry={ovalRy}
                      fill="black"
                    />
                  </Mask>
                </Defs>
                <Rect
                  x="0"
                  y="0"
                  width={width}
                  height={height}
                  fill="rgba(10, 15, 28, 0.72)"
                  mask="url(#ovalMask)"
                />
                <Ellipse
                  cx={centerX}
                  cy={centerY}
                  rx={ovalRx}
                  ry={ovalRy}
                  fill="none"
                  stroke="#00E4E8"
                  strokeWidth={3}
                  strokeDasharray="10 6"
                />
              </Svg>
            </View>

            {/* Top Bar */}
            <SafeAreaView style={styles.overlaySafeArea} edges={['top', 'bottom']}>
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                  accessibilityLabel="Close live selfie scanner"
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={13} color="#00E4E8" />
                  <Text style={styles.lockedBadgeText}>Front Camera Locked</Text>
                </View>

                <View style={styles.topBarSpacer} />
              </View>

              {/* Instruction Header */}
              <View style={styles.headerTextWrap}>
                <Text style={styles.titleText}>Live Selfie Verification</Text>
                <Text style={styles.subtitleText}>
                  Position your face inside the oval frame
                </Text>
              </View>

              <View style={styles.spacer} />

              {/* Bottom Guidance & Capture Button */}
              <View style={styles.bottomControls}>
                {captureError && (
                  <View style={styles.errorPill}>
                    <Ionicons name="alert-circle" size={16} color="#FCA5A5" />
                    <Text style={styles.errorPillText}>{captureError}</Text>
                  </View>
                )}

                <View style={styles.tipsRow}>
                  <Ionicons name="sunny-outline" size={15} color="#A5F3FC" />
                  <Text style={styles.tipsText}>
                    Good lighting • Look straight • No screen or glasses
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.shutterOuter,
                    (!cameraReady || isCapturing) && styles.shutterDisabled,
                  ]}
                  onPress={() => void handleCapture()}
                  disabled={!cameraReady || isCapturing}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Capture live selfie"
                >
                  <View style={styles.shutterInner}>
                    {isCapturing ? (
                      <ActivityIndicator size="small" color="#0F172A" />
                    ) : (
                      <Ionicons name="camera" size={28} color="#0F172A" />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.captureLabel}>
                  {isCapturing ? 'Capturing...' : 'Tap to Take Live Selfie'}
                </Text>
              </View>
            </SafeAreaView>
          </View>
        ) : (
          <SafeAreaView style={styles.permissionContainer} edges={['top', 'bottom']}>
            <TouchableOpacity
              style={[styles.closeBtn, styles.permissionCloseBtn]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.permissionCard}>
              <View style={styles.permissionIconCircle}>
                <Ionicons name="camera-outline" size={34} color="#00E4E8" />
              </View>
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionSubtitle}>
                To prevent fake profiles, selfie verification requires live front camera access.
              </Text>
              <TouchableOpacity
                style={styles.allowBtn}
                onPress={() => void requestPermission()}
                activeOpacity={0.85}
              >
                <Text style={styles.allowBtnText}>Allow Front Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlaySafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  topBarSpacer: {
    width: 40,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 228, 232, 0.35)',
  },
  lockedBadgeText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
  },
  headerTextWrap: {
    alignItems: 'center',
    marginTop: 12,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    marginBottom: 4,
  },
  subtitleText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  bottomControls: {
    alignItems: 'center',
    gap: 12,
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(127, 29, 29, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  errorPillText: {
    color: '#FEE2E2',
    fontSize: 12,
    fontFamily: 'DM_Sans_500Medium',
  },
  tipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  tipsText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontFamily: 'DM_Sans_500Medium',
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#00E4E8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 228, 232, 0.18)',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#00E4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0A0F1C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCloseBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  permissionIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 228, 232, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    fontFamily: 'DM_Sans_400Regular',
  },
  allowBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00E4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  allowBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
  cancelBtn: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
  },
});

export default LiveSelfieScannerModal;
