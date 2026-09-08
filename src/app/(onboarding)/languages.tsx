import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';


export default function ChooseLanguagesScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();

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

  const toggleLanguage = (lang: string) => {
    if (selected.includes(lang)) {
      setSelected(selected.filter((item) => item !== lang));
    } else {
      setSelected([...selected, lang]);
    }
  };

  const handleNext = () => {
    router.push('/(onboarding)/qualification');
  };

    const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/relationship' as any);
    }
  };

  const activeColor = theme.primaryButton;
  const inactiveColor = isDark ? theme.backgroundElement : '#E0F7FA';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Progress Bar */}
       <OnboardingHeader progress={0.3} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text }]}>Choose your languages</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select the languages you speak or prefer to chat in.
          </Text>

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
          disabled={!selected}
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
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
