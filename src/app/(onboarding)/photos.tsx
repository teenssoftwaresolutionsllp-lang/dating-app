import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';

// Demo sample avatars for user interaction testing
const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
];

export default function AddPhotosScreen() {
  const router = useRouter();

  // photo state (index 0 is main profile photo, 1..3 are additional photos)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);

  const handleTogglePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = null;
      } else {
        next[index] = DEMO_PHOTOS[index % DEMO_PHOTOS.length];
      }
      return next;
    });
  };

  const handleNext = () => {
    router.push('/relationship' as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.90} />

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
              onPress={() => handleTogglePhoto(0)}
              activeOpacity={0.8}
            >
              {photos[0] ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: photos[0] }} style={styles.photoImage} />
                  <View style={styles.removeBadge}>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </View>
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
                    onPress={() => handleTogglePhoto(slotIndex)}
                    activeOpacity={0.8}
                  >
                    {photoUri ? (
                      <View style={styles.imageWrapper}>
                        <Image source={{ uri: photoUri }} style={styles.photoImage} />
                        <View style={styles.removeBadge}>
                          <Ionicons name="close" size={12} color="#FFFFFF" />
                        </View>
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
            <Ionicons name="information-circle-outline" size={18} color="#FF3B30" style={styles.warningIcon} />
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
        />
      </View>
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
    maxWidth: 500,
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
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 18,
    paddingHorizontal: 12,
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
  },
  subCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
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
    color: '#FF3B30',
    fontWeight: '500',
    lineHeight: 16,
    flex: 1,
  },
});
