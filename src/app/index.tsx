import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const handleGetStart = () => {
    router.push('/verified-profiles' as any);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.responsiveContainer}>
        {/* Background Couple Artwork */}
        <Image
          source={require('@/assets/images/find_perfect_match.png')}
          style={styles.backgroundImage}
          contentFit="contain"
          contentPosition="bottom center"
          priority="high"
        />

        {/* Overlay container with safe area insets */}
        <SafeAreaView style={styles.overlayContainer} edges={['top', 'bottom']}>
          {/* Header Text Section */}
          <View style={styles.headerSection}>
            <Text style={styles.titleLine1}>Find your</Text>
            <Text style={styles.titleLine2}>
              <Text style={styles.pinkText}>Perfect</Text>
              <Text style={styles.blackText}> match</Text>
            </Text>
          </View>

          {/* Spacer to push button to bottom */}
          <View style={styles.spacer} />

          {/* Bottom Action Button */}
          <View style={styles.bottomSection}>
            <Pressable
              onPress={handleGetStart}
              style={({ pressed }) => [
                styles.getStartButton,
                pressed && styles.buttonPressed,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}
              accessibilityRole="button"
              accessibilityLabel="Get Start"
            >
              <Text style={styles.getStartButtonText}>Get Start</Text>
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
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%'
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerSection: {
    paddingTop: Platform.OS === 'web' ? 44 : 20,
    paddingHorizontal: 4,
    transform: [{ translateY: 170 }],
  },
  titleLine1: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  titleLine2: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  pinkText: {
    color: '#FE3562',
  },
  blackText: {
    color: '#000000',
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'web' ? 28 : 16,
    width: '100%',
    alignItems: 'center',
    bottom:30,
  },
  getStartButton: {
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
  getStartButtonText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.2,
  },
});
