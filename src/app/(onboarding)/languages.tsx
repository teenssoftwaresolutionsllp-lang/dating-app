import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { updateStoredUserProfile } from '@/constants/userProfile';

export default function ChooseLanguagesScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';

  const languages = [
    'English',
    'Hindi',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Bengali',
  ];

  const [selected, setSelected] = useState<string[]>([]);
  const [languageError, setLanguageError] = useState(false);

  const languageShakeAnim = useRef(new Animated.Value(0)).current;

  const triggerLanguageShake = () => {
    languageShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(languageShakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(languageShakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(languageShakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(languageShakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(languageShakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(languageShakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(languageShakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleLanguage = (lang: string) => {
    if (selected.includes(lang)) {
      setSelected(selected.filter((item) => item !== lang));
    } else {
      setSelected([...selected, lang]);
      if (languageError) {
        setLanguageError(false);
      }
    }
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setLanguageError(true);
      triggerLanguageShake();
      return;
    }
    updateStoredUserProfile({ languages: selected.join(', ') });
    router.push('/(onboarding)/qualification');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/relationship');
    }
  };

  const activeColor = theme.primaryButton;
  const inactiveColor = isDark ? theme.backgroundElement : '#E0F7FA';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        <OnboardingHeader progress={0.3} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: theme.text }]}>Choose your languages</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Select the languages you speak or prefer to chat in.
            </Text>

            {languageError && (
              <Animated.Text
                style={[
                  styles.errorMessage,
                  {
                    transform: [{ translateX: languageShakeAnim }],
                  },
                ]}
              >
                Please choose a language
              </Animated.Text>
            )}
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {languages.map((lang) => {
              const isSelected = selected.includes(lang);
              return (
                <Pressable
                  key={lang}
                  onPress={() => toggleLanguage(lang)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected ? activeColor : inactiveColor,
                      shadowColor: '#000000',
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? '#000000' : theme.text,
                        fontFamily: isSelected ? 'DM_Sans_700Bold' : 'DM_Sans_500Medium',
                      },
                    ]}
                  >
                    {lang}
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
            backgroundColor: selected.length > 0
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
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
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
    maxWidth: 280,
  },
  optionsList: {
    width: '100%',
    maxWidth: 340,
    gap: 16,
    marginTop: 36,
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: 15,
  },
  errorMessage: {
    position: 'absolute',
    bottom: -22,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    textAlign: 'center',
    fontFamily: 'DM_Sans_500Medium',
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
});
