import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function VerifiedProfilesScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // Clamped width matching responsiveContainer (maxWidth: 440)
  const containerWidth = Math.min(screenWidth, 440);

  // The artwork is 1024 x 1536 (Aspect ratio 2:3).
  // In the 1024x1536 artwork:
  // - Top shield badge is at Y = 90..300 (height fraction: 0.058..0.195)
  // - Blank text area starts at Y = 330 (height fraction: 0.215)
  // Since rendered image height is containerWidth * 1.5:
  // Text top offset is containerWidth * 1.5 * 0.22 = containerWidth * 0.33
  const textTopOffset = Math.round(containerWidth * 0.33);

  const handleNext = () => {
    router.push('/select-language' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.responsiveContainer}>
        {/* Back Button */}
        <Pressable
          onPress={handleBack}
          style={[
            styles.backButton,
            { top: insets.top + (Platform.OS === 'web' ? 16 : 8), left: 16 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back-outline" size={24} color="#ffffff" />
        </Pressable>

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Main Visual Content Section */}
          <View style={styles.artworkArea}>
            {/* Background Artwork - Anchored to top-center so shield stays at consistent position */}
            <Image
              source={require('@/assets/images/verified_profiles.png')}
              style={styles.artworkImage}
              contentFit="contain"
              contentPosition="top center"
              priority="high"
            />

            {/* Title Text Section - Dynamically positioned based on container width so it's always right below the shield */}
            <View style={[styles.headerSection, { top: textTopOffset }]}>
              <Text style={styles.titleLine1}>Verified profiles,</Text>
              <Text style={styles.titleLine2}>
                <Text style={styles.tealText}>Real</Text>
                <Text style={styles.blackText}> people</Text>
              </Text>
            </View>
          </View>

          {/* Bottom Section with Pagination Hearts & Next Button */}
          <View style={styles.bottomSection}>
            {/* 3 Pagination Hearts Indicator */}
            <View style={styles.paginationRow}>
              <Ionicons name="heart" size={13} color="#FE3562" style={styles.heartIcon} />
              <Ionicons name="heart" size={13} color="#FFA0B5" style={styles.heartIcon} />
              <Ionicons name="heart" size={13} color="#FFCCD7" style={styles.heartIcon} />
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
              accessibilityLabel="Next"
            
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </SafeAreaView>
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
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    position: 'relative',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
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
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  artworkArea: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  artworkImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  headerSection: {
    position: 'absolute',
    left: 24,
    right: 24,
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
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 24 : 16,
    alignItems: 'center',
    gap: 16,
    bottom:30,

  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex:1
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




