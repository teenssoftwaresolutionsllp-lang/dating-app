import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Platform } from 'react-native';

import { OptionButton } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function LanguageScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Set Your Display Language</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            తెలుగులో యాప్‌ను ఉపయోగించడానికి మీ భాషను ఎంచుకోండి
          </Text>
          <View style={styles.options}>
            <OptionButton onPress={() => router.push('/login')}>English</OptionButton>
            <OptionButton onPress={() => router.push('/login')}>తెలుగు</OptionButton>
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
    paddingTop: Platform.OS === 'web' ? 48 : 88,
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
  options: {
    width: '100%',
    maxWidth: 280,
    gap: 24,
    marginTop: 60,
  },
});
