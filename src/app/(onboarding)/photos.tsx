import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { useTheme } from '@/hooks/use-theme';

// Demo sample avatars for user interaction testing
const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
];

export default function AddPhotosScreen() {
  const router = useRouter();
  const theme = useTheme();

  // photo state (index 0 is main profile photo, 1..3 are additional photos)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isPhotosComplete = Boolean(photos[0] || photos.some((p) => p !== null));

  const pickImageForSlot = async (slotIndex: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotos((prev) => {
          const next = [...prev];
          next[slotIndex] = uri;
          return next;
        });
      }
    } catch {
      // Return safely to Photos screen on cancel/reject
    }
  };

  const handleSlotPress = (index: number) => {
    pickImageForSlot(index);
  };

  const handleUploadPhoto = () => {
    if (activeSlot !== null) {
      const slot = activeSlot;
      setShowUploadModal(false);
      setActiveSlot(null);
      pickImageForSlot(slot);
    } else {
      setShowUploadModal(false);
    }
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

  const handleNext = () => {
    router.push('/(onboarding)/interests' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/verification' as any);
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
              onPress={() => handleSlotPress(0)}
              activeOpacity={0.8}
            >
              {photos[0] ? (
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
                </View>
              ) : (
                <View style={styles.cardInnerContent}>
                  <View style={styles.cameraIconCircle}>
                    <Ionicons name="camera-outline" size={24} color="#00B49F" />
                    <Ionicons name="add" size={12} color="#00B49F" style={styles.plusOverlay} />
                  </View>
                  <Text style={styles.mainCardText}>Add Your Profile Photo</Text>
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

          {/* Warning Banner */}
          <View style={styles.warningRow}>
            <Ionicons name="information-circle-outline" size={18} color="#9CA3AF" style={styles.warningIcon} />
            <Text style={styles.warningText}>
              Real photos only. AI-generated or misleading images aren't allowed.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextButtonStyle={{
            backgroundColor: isPhotosComplete
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
                  {activeSlot === 0 ? 'Profile Photo' : `Photo ${activeSlot}`}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose an image to upload to your profile
                </Text>

                <View style={styles.modalOptionsList}>
                  {/* Upload Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={handleUploadPhoto}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons name="cloud-upload-outline" size={22} color="#0F766E" />
                    </View>
                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>Upload</Text>
                      <Text style={styles.modalOptionDesc}>Upload an image from your device</Text>
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
    marginBottom: 24,
  },
  mainPhotoCard: {
    width: '100%',
    height: 140,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C5FBF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  plusOverlay: {
    position: 'absolute',
    right: 12,
    top: 10,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
