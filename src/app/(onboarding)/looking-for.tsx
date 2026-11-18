import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import {
  getOnboardingProfileDraft,
  updateOnboardingProfileDraft,
} from '@/constants/userProfile';
import { updateDatingPreferences } from '@/services/profileApi';

const LOOKING_FOR_KEY_MAP: Record<string, string> = {
  'Something casual': 'onboarding.steps.lookingFor.casual',
  'A serious relationship': 'onboarding.steps.lookingFor.serious',
  'Long – term relationship': 'onboarding.steps.lookingFor.longTerm',
  'Marriage': 'onboarding.steps.lookingFor.marriage',
  'Still figuring it out': 'onboarding.steps.lookingFor.figuringOut',
};

export default function LookingForScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const options = [
    'Something casual',
    'A serious relationship',
    'Long – term relationship',
    'Marriage',
    'Still figuring it out',
  ];

  const initialDraft = getOnboardingProfileDraft();
  const [selected, setSelected] = useState<string | null>(
    Array.isArray(initialDraft.lookingFor) && initialDraft.lookingFor[0]
      ? initialDraft.lookingFor[0]
      : null,
  );
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shakeAnim] = useState(() => new Animated.Value(0));

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

  const handleNext = async () => {
    if (!selected) {
      setError(true);
      triggerShake();
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      updateOnboardingProfileDraft({ lookingFor: [selected] });
      await updateDatingPreferences({
        relationshipIntentions: [selected],
      }).catch((e) => {
        console.warn('Backend sync warning on preferences update:', e);
      });

      router.push({
        pathname: '/(onboarding)/ideal-match',
        params: { lookingFor: selected },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/religion');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        <OnboardingHeader progress={0.8} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text }]}>{t('onboarding.steps.lookingFor.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('onboarding.steps.lookingFor.subtitle')}
          </Text>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('onboarding.steps.lookingFor.sectionTitle')}
            </Text>
            {error && (
              <Animated.Text
                style={[
                  styles.errorMessage,
                  {
                    transform: [{ translateX: shakeAnim }],
                  },
                ]}
              >
                {t('onboarding.steps.lookingFor.errorSelect')}
              </Animated.Text>
            )}
          </View>

          {/* Radio list options */}
          <View style={styles.optionsList}>
            {options.map((option) => {
              const isSelected = selected === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setSelected(option);
                    updateOnboardingProfileDraft({ lookingFor: [option] });
                    if (error) {
                      setError(false);
                    }
                  }}
                  style={[styles.radioContainer, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                >
                  {/* Radio Circle */}
                  <View
                    style={[
                      styles.radioCircle,
                      { borderColor: isSelected ? theme.primaryButton : theme.border },
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
                  <Text style={[styles.optionText, { color: theme.text }]}>
                    {LOOKING_FOR_KEY_MAP[option] ? t(LOOKING_FOR_KEY_MAP[option]) : option}
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
            backgroundColor: selected
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
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 15,
  },
});
