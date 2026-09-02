import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LegalFooter, PrimaryButton, RelationshipArtwork } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [code, setCode] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);
  const complete = code.every(Boolean);
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  function updateCode(value: string, index: number) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === 'Backspace') {
      if (!code[index] && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  }

  function resend() {
    if (seconds === 0) {
      setCode(['', '', '', '']);
      setSeconds(30);
      inputs.current[0]?.focus();
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: Math.max(insets.top, 16) + 4, left: 16 }]}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </Pressable>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.responsiveWrapper}>
            <RelationshipArtwork variant="otp" />

            <SafeAreaView style={styles.contentSafeArea} edges={['bottom', 'left', 'right']}>
              <View style={styles.content}>
                <View style={styles.headingRow}>
                  <Text style={[styles.heading, { color: theme.text }]}>Enter OTP to Verify</Text>
                  <Pressable
                    onPress={resend}
                    disabled={seconds > 0}
                    style={Platform.OS === 'web' ? ({ cursor: seconds === 0 ? 'pointer' : 'default' } as any) : {}}
                  >
                    <Text
                      style={[
                        styles.resend,
                        { color: isDark ? '#538DFF' : '#1769FF' },
                        seconds > 0 && styles.disabled,
                      ]}
                    >
                      Resend in 00:{String(seconds).padStart(2, '0')}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.otpRow}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(input) => {
                        inputs.current[index] = input;
                      }}
                      value={digit}
                      onChangeText={(value) => updateCode(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      style={[
                        styles.otpInput,
                        {
                          color: theme.text,
                          borderColor: theme.border,
                          backgroundColor: isDark ? theme.backgroundElement : '#ffffff',
                        },
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                      ]}
                      textAlign="center"
                    />
                  ))}
                </View>

                <View style={styles.sentRow}>
                  <Text style={[styles.sent, { color: theme.textSecondary }]}>
                    We have sent OTP to {phone || '00000 00000'}
                  </Text>
                  <Pressable
                    onPress={() => router.back()}
                    style={[styles.editButton, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                  >
                    <Ionicons name="pencil" size={14} color={theme.textSecondary} />
                  </Pressable>
                </View>

                <PrimaryButton
                  disabled={!complete}
                  onPress={() => router.replace('/onboarding/languages')}
                  style={[styles.verifyButton, { opacity: complete ? 1 : 0.5 }]}
                >
                  Verify
                </PrimaryButton>

                <LegalFooter />
              </View>
            </SafeAreaView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    justifyContent: 'space-between',
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
  contentSafeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 14,
  },
  resend: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 12,
  },
  disabled: {
    opacity: 0.65,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  otpInput: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 20,
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
  },
  sentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  sent: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 12,
  },
  editButton: {
    padding: 4,
    marginLeft: 2,
  },
  verifyButton: {
    marginTop: 24,
    marginBottom: 20,
  },
});
