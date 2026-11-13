import React from 'react';
import { Platform, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OptionButton } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSelectionScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const handleSelectLanguage = async (selected: 'en' | 'te') => {
    await changeLanguage(selected, false);
    router.push('/login' as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Pressable 
          onPress={() => {
            router.replace('/verified-profiles' as any);
          }} 
          style={[styles.backButton, { top: 8, left: 16 }]}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="chevron-back-outline" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('onboarding.languageSelection.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {language === 'te'
              ? 'యాప్‌ను ఉపయోగించడానికి మీ ప్రాధాన్య భాషను ఎంచుకోండి'
              : 'తెలుగులో యాప్‌ను ఉపయోగించడానికి మీ భాషను ఎంచుకోండి'}
          </Text>
          <View style={styles.options}>
            <OptionButton 
              onPress={() => handleSelectLanguage('en')}
              style={language === 'en' ? { borderWidth: 1.5, borderColor: '#00E4E8' } : undefined}
            >
              English
            </OptionButton>
            <OptionButton 
              onPress={() => handleSelectLanguage('te')}
              style={language === 'te' ? { borderWidth: 1.5, borderColor: '#00E4E8' } : undefined}
            >
              తెలుగు
            </OptionButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 88,
  },
  title: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 280,
    marginTop: 14,
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
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
  options: {
    width: '100%',
    maxWidth: 280,
    gap: 24,
    marginTop: 60,
  },
});
