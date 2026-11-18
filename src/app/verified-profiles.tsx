import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import slide1 from '@/assets/images/verified_profiles.jpg';
import slide2 from '@/assets/images/verified_profiles_2.jpg';
import slide3 from '@/assets/images/verified_profiles_3.jpg';


const SLIDES = [slide1, slide2, slide3];

export default function VerifiedProfilesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically advance to the next slide (1 → 2 → 3)
  useEffect(() => {
    if (currentIndex < SLIDES.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Clamped width matching responsiveContainer (maxWidth: 480)
  const containerWidth = Math.min(screenWidth, 480);

  // The artwork is 1024 x 1536 (Aspect ratio 2:3).
  // With contentFit="cover" and contentPosition="top center":
  // The image scale factor covers the container
  const imageScale = Math.max(containerWidth / 1024, screenHeight / 1536);
  // Shield bottom is at Y ≈ 276 in the 1536 artwork, blank text area starts around Y ≈ 330
  const textTopOffset = Math.round(330 * imageScale) - 15;

  const handleNext = () => {
    router.push('/select-language' as any);
  };

  const handleBack = () => {
    router.replace('/' as any);
  }



  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.responsiveContainer}>
        {/* Background Artwork - Slide 1 full-cover; Slides 2 & 3 anchored to bottom behind next button */}
        {/* <Image
          key={currentIndex}
          source={SLIDES[currentIndex]}
          style={styles.artworkImage}
          contentFit={currentIndex === 0 ? 'cover' : 'contain'}
          contentPosition={currentIndex === 0 ? 'top center' : 'bottom center'}
          priority="high"
        /> */}


        <Image
          key={currentIndex}
          source={SLIDES[currentIndex]}
          style={styles.artworkImage}
          contentFit={
            currentIndex === 0
              ? 'cover'
              : currentIndex === 2
                ? 'fill'
                : 'contain'
          }
          contentPosition={
            currentIndex === 0
              ? 'top center'
              : 'bottom center'
          }
          priority="high"
        />

        {/* Back Button - Navigates to previous screen and does not change images */}
        <Pressable
          onPress={handleBack}
          style={[
            styles.backButton,
            { top: insets.top + 8, left: 16 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back-outline" size={24} color="#ffffff" />
        </Pressable>

        {/* Title Text Section - Only for slide 1 where text is overlaid below the shield */}
        {currentIndex === 0 && (
          <View style={[styles.headerSection, { top: textTopOffset }]}>
            <Text style={styles.titleLine1}>{t('onboarding.verifiedProfiles.slide1Line1')}</Text>
            <Text style={styles.titleLine2}>
              <Text style={styles.tealText}>{t('onboarding.verifiedProfiles.slide1Teal')}</Text>
              <Text style={styles.blackText}>{t('onboarding.verifiedProfiles.slide1Black')}</Text>
            </Text>
          </View>
        )}

        {currentIndex === 1 && (
          <View style={[styles.headerSection, { top: 100 }]}>
            <Text style={styles.titleLine1}>{t('onboarding.verifiedProfiles.slide2Line1')}</Text>
            <Text style={styles.titleLine1}>{t('onboarding.verifiedProfiles.slide2Line2')}</Text>
            <Text style={styles.titleLine2}>
              <Text style={styles.tealText}>{t('onboarding.verifiedProfiles.slide2Teal')}</Text>
            </Text>
          </View>
        )}

        {currentIndex === 2 && (
          <View style={[styles.headerSection, { bottom: Math.min(250, Math.round(screenHeight * 0.32)) }]}>
            <Text style={[styles.titleLine1, { textAlign: 'left' }]}>
              {t('onboarding.verifiedProfiles.slide3Line1')}
            </Text>

            <Text style={[styles.titleLine2]}>
              <Text style={styles.redText}>{t('onboarding.verifiedProfiles.slide3Red')}</Text>
              <Text style={styles.blackText}>{t('onboarding.verifiedProfiles.slide3Black')}</Text>
            </Text>
          </View>
        )}

        {/* Bottom Section with Pagination Hearts & Next Button */}
        <View
          style={[
            styles.bottomSection,
            { bottom: insets.bottom + 54 },
          ]}
        >          
        {/* 3 Pagination Hearts Indicator - Synced with current image */}
          <View style={styles.paginationRow}>
            <Pressable
              onPress={() => setCurrentIndex(0)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Slide 1"
            >
              <Ionicons
                name="heart"
                size={13}
                color={currentIndex === 0 ? '#FE3562' : '#FFA0B5'}
                style={styles.heartIcon}
              />
            </Pressable>
            <Pressable
              onPress={() => setCurrentIndex(1)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Slide 2"
            >
              <Ionicons
                name="heart"
                size={13}
                color={currentIndex === 1 ? '#FE3562' : '#FFA0B5'}
                style={styles.heartIcon}
              />
            </Pressable>
            <Pressable
              onPress={() => setCurrentIndex(2)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Slide 3"
            >
              <Ionicons
                name="heart"
                size={13}
                color={currentIndex === 2 ? '#FE3562' : '#FFA0B5'}
                style={styles.heartIcon}
              />
            </Pressable>
          </View>

          {/* Next Button */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.buttonPressed,
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.verifiedProfiles.next')}
          >
            <Text style={styles.nextButtonText}>{t('onboarding.verifiedProfiles.next')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  redText: {
    color: '#FE3562',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    position: 'relative',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  artworkImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  headerSection: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 5,
  },
  titleLine1: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  titleLine2: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  tealText: {
    color: '#088389',
  },
  blackText: {
    color: '#000000',
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 1,
  },
  heartIcon: {
    marginHorizontal: 1,
  },
  nextButton: {
    backgroundColor: '#00F5FF',
    height: 52,
    borderRadius: 26,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.2,
  },
});