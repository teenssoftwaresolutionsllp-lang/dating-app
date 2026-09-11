import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';

export default function InterestsScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';

  const interestsList = [
    'Music',
    'Movies',
    'Travel',
    'Concerts',
    'Nature',
    'Dance',
    'Food',
    'Fitness',
    'Gaming',
    'Books',
    'Sports',
    'Cooking',
    'Photography',
    'Art',
    'Pets',
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      const updated = [...selectedInterests, interest];
      setSelectedInterests(updated);
      if (error && updated.length >= 3) {
        setError(false);
      }
    }
  };

  const handleNext = () => {
    if (selectedInterests.length < 3) {
      setError(true);
      triggerShake();
      return;
    }
    router.push({
      pathname: '/(onboarding)/religion',
      params: { interests: JSON.stringify(selectedInterests) },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/photos');
    }
  };

  const isNextEnabled = selectedInterests.length >= 3;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Progress Bar */}
        <OnboardingHeader progress={0.7} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text }]}>What are you into?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tell us a little about yourself so we can help you find better matches.
          </Text>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Interests</Text>
            {error && (
              <Animated.Text
                style={[
                  styles.errorMessage,
                  {
                    transform: [{ translateX: shakeAnim }],
                  },
                ]}
              >
                Please select at least 3 interests
              </Animated.Text>
            )}
          </View>

          {/* Interests Chips Grid */}
          <View style={styles.chipsContainer}>
            {interestsList.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.primaryButton : isDark ? theme.backgroundElement : '#FFFFFF',
                      borderColor: isSelected ? theme.primaryButton : isDark ? '#333333' : '#B9B9B9',
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#000000' : theme.text,
                        fontFamily: isSelected ? 'DM_Sans_700Bold' : 'DM_Sans_500Medium',
                      },
                    ]}
                  >
                    {interest}
                  </Text>
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'add'}
                    size={16}
                    color={isSelected ? '#000000' : theme.textSecondary}
                    style={styles.chipIcon}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Navigation */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextButtonStyle={{
            backgroundColor: isNextEnabled
              ? theme.primaryButton
              : '#BDFFF9',
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    alignSelf: 'center',
    maxWidth: 290,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
  },
  sectionSubtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  chipIcon: {
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    color: '#000000',
  },
  errorMessage: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'DM_Sans_500Medium',
  },
});
