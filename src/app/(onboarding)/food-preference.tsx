import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { updateStoredUserProfile } from '@/constants/userProfile';
import { updateCurrentProfile } from '@/services/profileApi';

const FOOD_OPTIONS = [
  'Vegetarian',
  'Non-Vegetarian',
  'Vegan',
  'Eggetarian',
  'Pescatarian',
  'Jain',
  'Foodie / Anything',
];

export default function FoodPreferenceScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

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

  const handleSelect = (option: string) => {
    setSelectedFood(option);
    if (error) {
      setError(false);
    }
  };

  const handleNext = async () => {
    if (!selectedFood) {
      setError(true);
      triggerShake();
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      updateStoredUserProfile({ foodPreference: selectedFood });
      await updateCurrentProfile({ foodPreference: selectedFood }).catch((e: unknown) => {
        console.warn('Backend sync warning on food preference update:', e);
      });
      router.push('/(onboarding)/lifestyle' as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/interests' as any);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.responsiveContainer}>
        {/* Onboarding Progress Header */}
        <OnboardingHeader progress={0.72} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Title & Subtitle */}
          <Text style={[styles.title, { color: theme.text }]}>What are you into?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tell us a little about yourself so we can help you find better matches.
          </Text>

          {/* Section Header with Shake Error */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Food Preference</Text>
            {error && (
              <Animated.Text
                style={[
                  styles.errorMessage,
                  {
                    transform: [{ translateX: shakeAnim }],
                  },
                ]}
              >
                Please choose any one option
              </Animated.Text>
            )}
          </View>

          {/* Radio list options */}
          <View style={styles.optionsList}>
            {FOOD_OPTIONS.map((option) => {
              const isSelected = selectedFood === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => handleSelect(option)}
                  style={[styles.radioContainer, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  {/* Radio Circle */}
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: isSelected ? theme.primaryButton : isDark ? '#4B5563' : '#D1D5DB' },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInnerCircle,
                          { backgroundColor: theme.primaryButton },
                        ]}
                      />
                    )}
                  </View>

                  {/* Option Text */}
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.text,
                        fontFamily: isSelected ? 'DM_Sans_700Bold' : 'DM_Sans_500Medium',
                      },
                    ]}
                  >
                    {option}
                  </Text>
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
            backgroundColor: selectedFood ? theme.primaryButton : '#BDFFF9',
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
    position: 'relative',
    marginTop: 34,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
  },
  errorMessage: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'DM_Sans_500Medium',
  },
  optionsList: {
    width: '100%',
    gap: 22,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 15,
  },
});
