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
  const [error, setError] = useState('');
  const inputs = useRef<(TextInput | null)[]>([]);
  const complete = code.every(Boolean);
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
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
    if (seconds === 0) return;
    const timer = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  function updateCode(value: string, index: number) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (error) {
      setError('');
    }
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
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/login');
          }
        }} 
        style={[styles.backButton, { top: insets.top + 8, left: 16 }]}
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back-outline" size={24} color="#ffffff" />
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
  root: {
    flex: 1,
    width: '100%',
  },
  dismissArea: {
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
  otpInput: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 20,
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



