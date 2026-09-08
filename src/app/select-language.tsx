import React from 'react';
import { Platform, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView,useSafeAreaInsets } from 'react-native-safe-area-context';
import { OptionButton } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
export default function LanguageSelectionScreen() {
  const theme = useTheme();
   const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Pressable 
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/verified-profiles' as any);
                  }
                }} 
                style={[styles.backButton, { top: insets.top + 8, left: 16 }]}
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back-outline" size={24} color="#ffffff" />
              </Pressable>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Set Your Display Language</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            తెలుగులో యాప్‌ను ఉపయోగించడానికి మీ భాషను ఎంచుకోండి
          </Text>
          <View style={styles.options}>
            <OptionButton onPress={() => router.push('/login' as any)}>English</OptionButton>
            <OptionButton onPress={() => router.push('/login' as any)}>తెలుగు</OptionButton>
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
