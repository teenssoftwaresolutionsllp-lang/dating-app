import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LegalFooter, PrimaryButton, RelationshipArtwork } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [code, setCode] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState('');
  const inputs = useRef<(TextInput | null)[]>([]);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const initialHeight = useRef(Dimensions.get('window').height).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const updateCode = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setCode((current) => current.map((digit, position) => (position === index ? '' : digit)));
      return;
    }

    const next = [...code];
    digits.slice(0, OTP_LENGTH - index).split('').forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setCode(next);
    if (error) {
      setError('');
    }
    if (digit && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  }

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    if (next.every(Boolean)) {
      Keyboard.dismiss();
    } else {
      inputs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (event.nativeEvent.key !== 'Backspace') return;
    if (code[index]) {
      setCode((current) => current.map((digit, position) => (position === index ? '' : digit)));
    } else if (index > 0) {
      setCode((current) => current.map((digit, position) => (position === index - 1 ? '' : digit)));
      inputs.current[index - 1]?.focus();
    }
  };

  const resend = () => {
    if (seconds > 0) return;
    setCode(Array(OTP_LENGTH).fill(''));
    setSeconds(RESEND_SECONDS);
    requestAnimationFrame(() => inputs.current[0]?.focus());
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  };

  const handleVerify = () => {
    if (!complete) {
      setError('Invalid OTP');
      triggerShake();
      return;
    }
    setError('');
    router.replace('/(onboarding)/set-profile');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={[styles.backButton, { top: Math.max(insets.top, 16) + 4, left: 16 }]}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.responsiveWrapper, { height: initialHeight }]}>
          <RelationshipArtwork variant="otp" />

          <SafeAreaView style={styles.contentSafeArea} edges={['bottom', 'left', 'right']}>
            <View style={styles.content}>
              <View style={styles.formTopSection}>
                <View style={styles.headingRow}>
                  <Text style={[styles.heading, { color: theme.text }]}>Enter OTP to Verify</Text>
                  <Pressable
                    onPress={resend}
                    disabled={seconds > 0}
                    accessibilityRole="button"
                    accessibilityLabel="Resend OTP"
                    style={seconds === 0 ? styles.webPointer : undefined}
                  >
                    <Text
                      style={[
                        styles.resend,
                        { color: isDark ? '#538DFF' : '#1769FF' },
                        seconds > 0 && styles.disabled,
                      ]}
                    >
                      {seconds > 0 ? `Resend in 00:${String(seconds).padStart(2, '0')}` : 'Resend OTP'}
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
                      onKeyPress={(event) => handleKeyPress(event, index)}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      maxLength={index === 0 ? OTP_LENGTH : 1}
                      selectTextOnFocus
                      autoCorrect={false}
                      style={[
                        styles.otpInput,
                        {
                          color: theme.text,
                          borderColor: theme.border,
                          backgroundColor: isDark ? theme.backgroundElement : '#FFFFFF',
                        },
                      ]}
                      textAlign="center"
                      accessibilityLabel={`OTP digit ${index + 1}`}
                    />
                  ))}
                </View>

                <View style={styles.sentContainer}>
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

                  {!!error && (
                    <Animated.View style={[styles.errorWrapper, { transform: [{ translateX: shakeAnim }] }]}>
                      <Text style={styles.errorText}>{error}</Text>
                    </Animated.View>
                  )}
                </View>
              </View>

              <View style={styles.bottomButtonSection}>
                <PrimaryButton
                  onPress={handleVerify}
                  style={[
                    styles.verifyButton,
                    {
                      backgroundColor: complete
                        ? theme.primaryButton
                        : '#BDFFF9',
                    },
                  ]}
                >
                  Verify
                </PrimaryButton>
                <LegalFooter />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  keyboardContainer: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start' },
  responsiveWrapper: { width: '100%', maxWidth: 480, flex: 1, justifyContent: 'space-between' },
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
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  formTopSection: {
    width: '100%',
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
  webPointer: Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined,
  contentSafeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: 'DM_Sans_500Medium', fontSize: 14 },
  resend: { fontFamily: 'DM_Sans_500Medium', fontSize: 12 },
  disabled: { opacity: 0.65 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 26 },
  otpInput: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
  },
  sentContainer: {
    width: '100%',
    marginTop: 16,
    position: 'relative',
  },
  sentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  sent: {
    flex: 1,
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 12,
  },
  editButton: {
    padding: 4,
    marginLeft: 2,
  },
  errorWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
  },
  errorText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
    marginLeft: 2,
  },
  bottomButtonSection: {
    width: '100%',
    paddingBottom: 8,
  },
  verifyButton: {
    marginBottom: 16,
  },
});
