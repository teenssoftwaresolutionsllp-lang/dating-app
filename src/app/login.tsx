import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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
import { useTranslation } from 'react-i18next';
import { LegalFooter, PrimaryButton, RelationshipArtwork } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';
import { sendOtp } from '@/utils/api';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [initialHeight] = useState(() => Dimensions.get('window').height);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const scrollToInput = () => {
    const scrollY = Math.round(initialHeight * 0.28);
    scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e?.endCoordinates?.height || 0;
      setKeyboardHeight(height);
      setIsKeyboardVisible(true);
      scrollToInput();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [initialHeight]);

  const handleFocus = () => {
    setIsFocused(true);
    requestAnimationFrame(scrollToInput);
    setTimeout(scrollToInput, 100);
  };

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

  const handleLogin = async () => {
    if (isSubmitting) return;
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError(t('auth.login.phoneInvalid'));
      triggerShake();
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await sendOtp(digits, '+91');
      router.push({ pathname: '/otp' as any, params: { phone: digits } });
    } catch (err: any) {
      setError(err?.message || t('auth.login.sendFailed'));
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    let digits = text.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    const cleaned = digits.slice(0, 10);
    setPhone(cleaned);
    if (error) {
      setError('');
    }
    if (cleaned.length === 10) {
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Pressable 
        onPress={() => {
          // if (router.canGoBack()) {
          //   router.back();
          // } else {
            router.replace('/select-language' as any);
          // }
        }} 
        style={[styles.backButton, { top: insets.top + 8, left: 16 }]}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
      >
        <Ionicons name="chevron-back-outline" size={24} color="#ffffff" />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardVisible && { paddingBottom: Math.max(keyboardHeight, 160) },
          ]}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isKeyboardVisible || Platform.OS === 'web'}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.responsiveWrapper, { minHeight: initialHeight }]}>
            <RelationshipArtwork variant="welcome" />

            <SafeAreaView style={styles.contentSafeArea} edges={['bottom', 'left', 'right']}>
              <View style={styles.content}>
                <View style={styles.formTopSection}>
                  <Text style={[styles.title, { color: theme.text }]}>{t('auth.login.welcome')}</Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {t('auth.login.subtitle')}
                  </Text>

                  <View style={styles.phoneInputContainer}>
                    <View
                      style={[
                        styles.phoneInput,
                        {
                          borderColor: error ? '#FF3B30' : isFocused ? '#00E4E8' : theme.border,
                          backgroundColor: theme.background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countryCode,
                          {
                            color: theme.text,
                            borderRightColor: error ? '#FF3B30' : isFocused ? '#00E4E8' : theme.border,
                          },
                        ]}
                      >
                        +91
                      </Text>
                      <TextInput
                        value={phone}
                        onChangeText={handlePhoneChange}
                        onFocus={handleFocus}
                        onBlur={() => setIsFocused(false)}
                        selectionColor="#00E4E8"
                        cursorColor="#00E4E8"
                        keyboardType="phone-pad"
                        inputMode="tel"
                        textContentType="telephoneNumber"
                        autoComplete="tel"
                        maxLength={10}
                        placeholder={t('auth.login.phonePlaceholder')}
                        placeholderTextColor={theme.textSecondary}
                        allowFontScaling={false}
                        style={[
                          styles.input,
                          { color: theme.text },
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                        ]}
                      />
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
                    onPress={handleLogin}
                    style={[
                      styles.loginButton,
                      {
                        backgroundColor:
                          phone.length === 10
                            ? theme.primaryButton
                            : '#BDFFF9',
                      },
                    ]}
                  >
                    {t('auth.login.loginButton')}
                  </PrimaryButton>

                  <LegalFooter />
                </View>
              </View>
            </SafeAreaView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// function SocialButton({ type, theme }: { type: 'google' | 'facebook' | 'instagram'; theme: any }) {
//   const isDark = theme.text === '#ffffff';
//   let iconSource;
//   if (type === 'google') {
//     iconSource = require('@/assets/images/google-icon.png');
//   } else if (type === 'facebook') {
//     iconSource = require('@/assets/images/facebook-icon.png');
//   } else if (type === 'instagram') {
//     iconSource = require('@/assets/images/instagram-icon.png');
//   }

//   return (
//     <Pressable
//       style={[
//         styles.socialButton,
//         {
//           borderColor: theme.border,
//           backgroundColor: isDark ? theme.backgroundElement : '#ffffff',
//         },
//         Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
//       ]}
//       accessibilityRole="button"
//     >
//       <Image source={iconSource} style={{ width: 24, height: 24 }} contentFit="contain" />
//     </Pressable>
//   );
// }

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
  title: {
    fontFamily: 'DM_Serif_Display_400Regular',
    fontSize: 27,
  },
  subtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    marginTop: 2,
  },
  phoneInputContainer: {
    width: '100%',
    position: 'relative',
    marginTop: 21,
  },
  phoneInput: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
  },
  countryCode: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    paddingHorizontal: 22,
    borderRightWidth: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  input: {
    flex: 1,
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
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
    marginLeft: 4,
  },
  bottomButtonSection: {
    width: '100%',
    paddingBottom: 8,
  },
  loginButton: {
    marginBottom: 16,
  },
});
