import React, { useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { useTheme } from '@/hooks/use-theme';
import { uploadPhotos, validatePhotoApi } from '@/services/profileApi';
import { updateStoredUserProfile } from '@/constants/userProfile';

export default function AddPhotosScreen() {
  const router = useRouter();
  const theme = useTheme();

  // photo state (index 0 is main profile photo, 1..3 are additional photos)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validatingSlot, setValidatingSlot] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPhotosComplete = Boolean(photos[0] || photos.some((p) => p !== null));
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const verifyAndSetSlot = async (slotIndex: number, uri: string, webFile?: File) => {
    if (slotIndex !== 0) {
      // Remaining photos (Slots 1, 2, 3): no face/selfie requirement
      setPhotos((prev) => {
        const next = [...prev];
        next[slotIndex] = uri;
        return next;
      });
      return;
    }

    // Main Profile Photo (Slot 0): Enforce face presence & KYC selfie matching
    setValidatingSlot(0);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('isPrimary', 'true');

      if (Platform.OS === 'web') {
        if (webFile) {
          formData.append('photo', webFile);
        } else if (uri.startsWith('blob:') || uri.startsWith('data:')) {
          const res = await fetch(uri);
          const blob = await res.blob();
          formData.append('photo', blob, 'main_profile.jpg');
        } else {
          const res = await fetch(uri);
          const blob = await res.blob();
          formData.append('photo', blob, 'main_profile.jpg');
        }
      } else {
        const cleanUri = uri;
        const rawFilename = cleanUri.split('/').pop() || 'main_profile.jpg';
        const filename = rawFilename.includes('.') ? rawFilename : 'main_profile.jpg';
        const extMatch = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const type = `image/${extMatch === 'jpg' ? 'jpeg' : extMatch}`;

        formData.append('photo', {
          uri: cleanUri,
          name: filename,
          type,
        } as any);
      }

      await validatePhotoApi(formData);

      // Successfully verified face & selfie match!
      setPhotos((prev) => {
        const next = [...prev];
        next[0] = uri;
        return next;
      });
    } catch (err: any) {
      console.warn('Slot 0 selfie verification error:', err);
      setPhotos((prev) => {
        const next = [...prev];
        next[0] = null;
        return next;
      });
      setErrorMessage(
        err?.message ||
          'Face mismatch: Your main profile photo must match your verified selfie.'
      );
      triggerShake();
    } finally {
      setValidatingSlot(null);
    }
  };

  const pickImageForSlot = async (slotIndex: number, useCamera = false) => {
    setErrorMessage(null);
    setShowUploadModal(false);
    setActiveSlot(null);

    // 1. Web Platform File Input
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp,image/jpg';
      input.style.position = 'fixed';
      input.style.top = '-9999px';
      input.style.left = '-9999px';

      if (useCamera) {
        input.setAttribute('capture', slotIndex === 0 ? 'user' : 'environment');
      }

      document.body.appendChild(input);

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const objectUrl = URL.createObjectURL(file);
          verifyAndSetSlot(slotIndex, objectUrl, file);
        }
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };

      input.click();
      return;
    }

    // 2. Native Platform (iOS / Android)
    try {
      if (useCamera) {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          setErrorMessage('Camera permission is required to take photos');
          triggerShake();
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          verifyAndSetSlot(slotIndex, uri);
        }
      } else {
        const libraryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPerm.granted) {
          setErrorMessage('Photo library permission is required to upload images');
          triggerShake();
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          verifyAndSetSlot(slotIndex, uri);
        }
      }
    } catch (err: any) {
      console.warn('Image picker error:', err);
    }
  };

  const handleSlotPress = (index: number) => {
    setActiveSlot(index);
    setShowUploadModal(true);
  };


  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    if (showUploadModal) {
      setShowUploadModal(false);
      setActiveSlot(null);
    }
  };

  const handleNext = async () => {
    const selectedPhotos = photos.filter((p): p is string => Boolean(p));

    if (selectedPhotos.length === 0) {
      setErrorMessage('Please add at least 1 profile photo to continue');
      triggerShake();
      return;
    }

    if (isUploading) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();

      for (let i = 0; i < selectedPhotos.length; i++) {
        const photoUri = selectedPhotos[i];

        if (Platform.OS === 'web') {
          // On Web, convert blob URL to File/Blob
          if (photoUri.startsWith('blob:') || photoUri.startsWith('data:')) {
            const res = await fetch(photoUri);
            const blob = await res.blob();
            formData.append('photo', blob, `photo_${i}.jpg`);
          } else {
            // Already a remote URL
            const res = await fetch(photoUri);
            const blob = await res.blob();
            formData.append('photo', blob, `photo_${i}.jpg`);
          }
        } else {
          // On React Native (iOS & Android)
          const cleanUri = photoUri;
          const rawFilename = cleanUri.split('/').pop() || `photo_${i}.jpg`;
          const filename = rawFilename.includes('.') ? rawFilename : `photo_${i}.jpg`;
          const extMatch = filename.split('.').pop()?.toLowerCase() || 'jpg';
          const type = `image/${extMatch === 'jpg' ? 'jpeg' : extMatch}`;

          formData.append('photo', {
            uri: cleanUri,
            name: filename,
            type,
          } as any);
        }
      }

      const res = await uploadPhotos(formData);
      if (selectedPhotos[0]) {
        updateStoredUserProfile({ avatarUri: selectedPhotos[0] });
      }

      router.push('/(onboarding)/interests' as any);
    } catch (err: any) {
      console.warn('Photo upload error:', err);
      setErrorMessage(err?.message || 'Failed to upload photos. Please check your connection and try again.');
      triggerShake();
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/verification');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.65} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title & Subtitle */}
          <Text style={styles.title}>Add your photos</Text>
          <Text style={styles.subtitle}>
            Show your personality and help people get to know you. Add up to 4 photos.
          </Text>

          {/* Photos Area */}
          <View style={styles.photosContainer}>
            {/* Main Profile Photo Card */}
            <TouchableOpacity
              style={[
                styles.mainPhotoCard,
                photos[0] ? styles.photoCardFilled : styles.dashedCardBorder,
              ]}
              onPress={() => !validatingSlot && handleSlotPress(0)}
              activeOpacity={0.8}
            >
              {validatingSlot === 0 ? (
                <View style={styles.cardInnerContent}>
                  <ActivityIndicator size="small" color="#00B49F" />
                  <Text style={[styles.mainCardText, { marginTop: 8, color: '#00B49F' }]}>
                    Verifying face with selfie...
                  </Text>
                </View>
              ) : photos[0] ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: photos[0] }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removeBadge}
                    onPress={() => handleRemovePhoto(0)}
                    hitSlop={8}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Main Profile (Selfie Matched)</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.cardInnerContent}>
                  <View style={styles.cameraIconCircle}>
                    <Ionicons name="camera-outline" size={24} color="#00B49F" />
                    <Ionicons name="add" size={12} color="#00B49F" style={styles.plusOverlay} />
                  </View>
                  <Text style={styles.mainCardText}>Add Your Main Profile Photo</Text>
                  <Text style={styles.cardHintText}>Must match your verified selfie</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Sub Photos Row (Photo 1, Photo 2, Photo 3) */}
            <View style={styles.subPhotosRow}>
              {[1, 2, 3].map((slotIndex) => {
                const photoUri = photos[slotIndex];
                return (
                  <TouchableOpacity
                    key={slotIndex}
                    style={[
                      styles.subPhotoCard,
                      photoUri ? styles.photoCardFilled : styles.dashedCardBorder,
                    ]}
                    onPress={() => handleSlotPress(slotIndex)}
                    activeOpacity={0.8}
                  >
                    {photoUri ? (
                      <View style={styles.imageWrapper}>
                        <Image source={{ uri: photoUri }} style={styles.photoImage} />
                        <TouchableOpacity
                          style={styles.removeBadge}
                          onPress={() => handleRemovePhoto(slotIndex)}
                          hitSlop={8}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.cardInnerContent}>
                        <View style={styles.plusIconCircle}>
                          <Ionicons name="add" size={20} color="#00B49F" />
                        </View>
                        <Text style={styles.subCardText}>{`Photo ${slotIndex}`}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Error Message */}
          {errorMessage && (
            <Animated.View
              style={[
                styles.errorContainer,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </Animated.View>
          )}

          {/* Warning Banner */}
          <View style={styles.warningRow}>
            <Ionicons name="information-circle-outline" size={18} color="#9CA3AF" style={styles.warningIcon} />
            <Text style={styles.warningText}>
              Real photos only. AI-generated or misleading images aren&apos;t allowed.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextText={isUploading ? 'Uploading...' : 'Next'}
          nextButtonStyle={{
            backgroundColor: isPhotosComplete && !isUploading
              ? theme.primaryButton
              : '#BDFFF9',
          }}
        />
      </View>

      {/* Modal / Options Sheet for Uploading Photo */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowUploadModal(false);
          setActiveSlot(null);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowUploadModal(false);
            setActiveSlot(null);
          }}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalSheetContainer}>
                <View style={styles.grabHandle} />
                <Text style={styles.modalTitle}>
                  {activeSlot === 0 ? 'Main Profile Photo' : `Photo ${activeSlot}`}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose an image to upload to your profile
                </Text>

                <View style={styles.modalOptionsList}>
                  {/* Gallery Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={() => activeSlot !== null && pickImageForSlot(activeSlot, false)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons name="images-outline" size={22} color="#0F766E" />
                    </View>
                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>Photo Library</Text>
                      <Text style={styles.modalOptionDesc}>Choose from device photo gallery</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  {/* Camera Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={() => activeSlot !== null && pickImageForSlot(activeSlot, true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons name="camera-outline" size={22} color="#0F766E" />
                    </View>
                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>Take Photo</Text>
                      <Text style={styles.modalOptionDesc}>Use camera to snap a new photo</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  {/* Remove Photo Option if slot is filled */}
                  {activeSlot !== null && photos[activeSlot] !== null && (
                    <TouchableOpacity
                      style={[styles.modalOptionCard, styles.modalOptionCardDanger]}
                      onPress={() => handleRemovePhoto(activeSlot)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.modalOptionIconCircle, styles.modalOptionIconCircleDanger]}>
                        <Ionicons name="trash-outline" size={20} color="#DC2626" />
                      </View>
                      <View style={styles.modalOptionTextWrap}>
                        <Text style={[styles.modalOptionTitle, styles.modalOptionTitleDanger]}>
                          Remove Photo
                        </Text>
                        <Text style={styles.modalOptionDesc}>Remove current photo from this slot</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowUploadModal(false);
                    setActiveSlot(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'DM_Sans_700Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 18,
    paddingHorizontal: 12,
    fontFamily: 'DM_Sans_400Regular',
  },
  photosContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  mainPhotoCard: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    backgroundColor: '#E0FDFD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  subPhotosRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  subPhotoCard: {
    flex: 1,
    height: 130,
    borderRadius: 18,
    backgroundColor: '#E0FDFD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dashedCardBorder: {
    borderWidth: 1.5,
    borderColor: '#70F3E7',
    borderStyle: 'dashed',
  },
  photoCardFilled: {
    borderWidth: 0,
    backgroundColor: '#F3F4F6',
  },
  cardInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  cameraIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C5FBF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  plusOverlay: {
    position: 'absolute',
    right: 14,
    top: 12,
    fontWeight: 'bold',
  },
  plusIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C5FBF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mainCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'DM_Sans_500Medium',
  },
  cardHintText: {
    fontSize: 11,
    color: '#0D9488',
    marginTop: 2,
    fontWeight: '500',
    fontFamily: 'DM_Sans_500Medium',
  },
  subCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'DM_Sans_500Medium',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'DM_Sans_700Bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    fontFamily: 'DM_Sans_500Medium',
    flex: 1,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingRight: 16,
    marginTop: 4,
  },
  warningIcon: {
    marginTop: 1,
  },
  warningText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    lineHeight: 16,
    flex: 1,
    fontFamily: 'DM_Sans_500Medium',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheetContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'DM_Sans_700Bold',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    fontFamily: 'DM_Sans_400Regular',
  },
  modalOptionsList: {
    gap: 12,
    marginBottom: 16,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOptionCardDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  modalOptionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalOptionIconCircleDanger: {
    backgroundColor: '#FEE2E2',
  },
  modalOptionTextWrap: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'DM_Sans_700Bold',
  },
  modalOptionTitleDanger: {
    color: '#DC2626',
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DM_Sans_400Regular',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'DM_Sans_500Medium',
  },
});
