import { router } from 'expo-router';
import { useRef, useState } from 'react';
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

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
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

  const handleLogin = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid number');
      triggerShake();
      return;
    }
    setError('');
    router.push({ pathname: '/otp' as any, params: { phone: digits } });
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
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
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/select-language' as any);
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
          <RelationshipArtwork variant="welcome" />

          <SafeAreaView style={styles.contentSafeArea} edges={['bottom', 'left', 'right']}>
            <View style={styles.content}>
              <View style={styles.formTopSection}>
                <Text style={[styles.title, { color: theme.text }]}>Welcome ,</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Login to Connect with your People.
                </Text>

                <View style={styles.phoneInputContainer}>
                  <View style={[styles.phoneInput, { borderColor: error ? '#FF3B30' : theme.border, backgroundColor: theme.background }]}>
                    <Text style={[styles.countryCode, { color: theme.text, borderRightColor: error ? '#FF3B30' : theme.border }]}>+91</Text>
                    <TextInput
                      value={phone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      maxLength={10}
                      placeholder="00000 00000"
                      placeholderTextColor={theme.textSecondary}
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
                  Login
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
  },
  input: {
    flex: 1,
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    paddingHorizontal: 14,
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
