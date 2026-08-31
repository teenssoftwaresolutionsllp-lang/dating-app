import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

import { OptionButton } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function LanguageScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Set Your Display Language</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>తెలుగులో యాప్‌ను ఉపయోగించడానికి మీ భాషను ఎంచుకోండి</Text>
        <View style={styles.options}>
          <OptionButton onPress={() => router.push('/login')}>English</OptionButton>
          <OptionButton onPress={() => router.push('/login')}>తెలుగు</OptionButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 34, paddingTop: 88 },
  title: { fontFamily: 'DM_Sans_700Bold', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { maxWidth: 250, marginTop: 14, fontFamily: 'DM_Sans_500Medium', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  options: { width: '100%', maxWidth: 260, gap: 26, marginTop: 62 },
});
