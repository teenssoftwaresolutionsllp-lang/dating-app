import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import {
  getOnboardingProfileDraft,
  updateOnboardingProfileDraft,
} from '@/constants/userProfile';

const QUALIFICATION_KEYS: Record<string, string> = {
  'High School': 'onboarding.steps.career.highSchool',
  Bachelors: 'onboarding.steps.career.bachelors',
  Masters: 'onboarding.steps.career.masters',
  PhD: 'onboarding.steps.career.phd',
  Others: 'onboarding.steps.career.others',
};

export default function QualificationScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isDark = theme.text === '#ffffff';
  const qualifications = [
    'High School',
    'Bachelors',
    'Masters',
    'PhD',
    'Others',
  ];

  const initialDraft = getOnboardingProfileDraft();
  const [selected, setSelected] = useState<string | null>(
    initialDraft.qualification || null,
  );

  const handleSelect = (qual: string) => {
    setSelected(qual);
    updateOnboardingProfileDraft({ qualification: qual });
    router.push({
      pathname: '/study',
      params: { qualification: qual },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/languages');
    }
  };

  const activeColor = theme.primaryButton;
  const inactiveColor = isDark ? theme.backgroundElement : '#E0F7FA';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Top Bar with Back Button */}
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            style={[
              styles.backButton,
              { backgroundColor: theme.primaryButton },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
            hitSlop={12}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#000000" />
          </Pressable>
        </View>

        <OnboardingHeader progress={0.35} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text }]}>{t('onboarding.steps.career.mainTitle')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('onboarding.steps.career.mainSubtitle')}
          </Text>

          {/* Section Title */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('onboarding.steps.career.qualificationTitle')}
          </Text>

          {/* Options list with chevrons */}
          <View style={styles.optionsList}>
            {qualifications.map((qual) => {
              const isSelected = selected === qual;
              return (
                <Pressable
                  key={qual}
                  onPress={() => handleSelect(qual)}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: isSelected ? activeColor : inactiveColor,
                      borderColor: isSelected ? theme.primaryButton : 'transparent',
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
                    {QUALIFICATION_KEYS[qual] ? t(QUALIFICATION_KEYS[qual] as any) : qual}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isSelected ? '#000000' : theme.textSecondary}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
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
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  title: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 6,
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
  sectionTitle: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 16,
    marginTop: 28,
    marginBottom: 16,
  },
  optionsList: {
    width: '100%',
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 15,
  },
});
