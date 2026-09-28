import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { getStoredUserProfile, updateStoredUserProfile } from '@/constants/userProfile';
import { updateCurrentProfile } from '@/services/profileApi';

interface NatureOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export const NATURE_OPTIONS: NatureOption[] = [
  { id: 'Caring', label: 'Caring', iconName: 'heart' },
  { id: 'Fun & Funny', label: 'Fun & Funny', iconName: 'happy' },
  { id: 'Peaceful', label: 'Peaceful', iconName: 'leaf' },
  { id: 'Deep Talks', label: 'Deep Talks', iconName: 'chatbubbles' },
  { id: 'Romantic', label: 'Romantic', iconName: 'rose' },
  { id: 'Adventurous', label: 'Adventurous', iconName: 'compass' },
  { id: 'Classy', label: 'Classy', iconName: 'sparkles' },
  { id: 'Chill', label: 'Chill', iconName: 'cafe' },
  { id: 'Positive', label: 'Positive', iconName: 'sunny' },
  { id: 'Creative', label: 'Creative', iconName: 'color-palette' },
];

export default function NatureScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const profile = getStoredUserProfile();

  const initialSelected =
    profile.nature && profile.nature.length > 0
      ? profile.nature
      : profile.vibes && profile.vibes.length > 0
      ? profile.vibes
      : ['Caring', 'Fun & Funny', 'Peaceful'];

  const [selectedTraits, setSelectedTraits] = useState<string[]>(initialSelected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

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

  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== traitId));
    } else {
      if (selectedTraits.length < 5) {
        const updated = [...selectedTraits, traitId];
        setSelectedTraits(updated);
        if (error) setError(false);
      } else {
        triggerShake();
      }
    }
  };

  const handleNext = async () => {
    if (selectedTraits.length < 1) {
      setError(true);
      triggerShake();
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      updateStoredUserProfile({ nature: selectedTraits, vibes: selectedTraits });
      await updateCurrentProfile({
        vibes: selectedTraits,
        nature: selectedTraits,
      } as any).catch((e: unknown) => {
        console.warn('Backend sync warning on nature update:', e);
      });
      router.push('/(onboarding)/religion' as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/lifestyle' as any);
    }
  };

  const isNextEnabled = selectedTraits.length >= 1;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.responsiveContainer}>
        {/* Onboarding Progress Header */}
        <OnboardingHeader progress={0.8} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Title & Subtitle */}
          <Text style={[styles.title, { color: theme.text }]}>What are you into?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tell us a little about yourself so we can help you find better matches.
          </Text>

          {/* Section Header with dynamic count & Shake Error */}
          <View style={styles.sectionHeader}>
            <View style={styles.titleCountRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Nature</Text>
              <Text style={[styles.counterText, { color: theme.textSecondary }]}>
                {selectedTraits.length} / 5 selected
              </Text>
            </View>
            {error && (
              <Animated.Text
                style={[
                  styles.errorMessage,
                  {
                    transform: [{ translateX: shakeAnim }],
                  },
                ]}
              >
                Please select at least 1 nature trait
              </Animated.Text>
            )}
          </View>

          {/* Chips Grid matching standard onboarding system */}
          <View style={styles.chipsContainer}>
            {NATURE_OPTIONS.map((item) => {
              const isSelected = selectedTraits.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleTrait(item.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? theme.primaryButton
                        : isDark
                        ? theme.backgroundElement
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? theme.primaryButton
                        : isDark
                        ? '#333333'
                        : '#B9B9B9',
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Ionicons
                    name={item.iconName}
                    size={16}
                    color={isSelected ? '#000000' : theme.textSecondary}
                    style={styles.chipLeadingIcon}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#000000' : theme.text,
                        fontFamily: isSelected ? 'DM_Sans_700Bold' : 'DM_Sans_500Medium',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'add'}
                    size={16}
                    color={isSelected ? '#000000' : theme.textSecondary}
                    style={styles.chipTrailingIcon}
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
            backgroundColor: isNextEnabled ? theme.primaryButton : '#BDFFF9',
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
    marginTop: 32,
    marginBottom: 18,
  },
  titleCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
  },
  counterText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
  },
  chipLeadingIcon: {
    marginRight: 6,
  },
  chipTrailingIcon: {
    marginLeft: 6,
  },
  chipText: {
    fontSize: 14,
  },
});
