import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LegalFooter, PrimaryButton, RelationshipArtwork } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a valid 10-digit phone number.');
      } else {
        Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      }
    } else {
      router.push({ pathname: '/otp' as any, params: { phone } });
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhone(cleaned);
    if (cleaned.length === 10) {
      Keyboard.dismiss();
    }
  };

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
            <RelationshipArtwork variant="welcome" />

            <SafeAreaView style={styles.contentSafeArea} edges={['bottom', 'left', 'right']}>
              <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>Welcome ,</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Login to Connect with your People.
                </Text>

                <View style={[styles.phoneInput, { borderColor: theme.border, backgroundColor: theme.background }]}>
                  <Text style={[styles.countryCode, { color: theme.text, borderRightColor: theme.border }]}>+91</Text>
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

                <Text style={[styles.or, { color: theme.textSecondary }]}>or</Text>

                <View style={styles.socials}>
                  <SocialButton type="google" theme={theme} />
                  <SocialButton type="facebook" theme={theme} />
                  <SocialButton type="instagram" theme={theme} />
                </View>

                <PrimaryButton onPress={handleLogin} style={styles.loginButton}>
                  Login
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

function SocialButton({ type, theme }: { type: 'google' | 'facebook' | 'instagram'; theme: any }) {
  const isDark = theme.text === '#ffffff';
  let iconSource;
  if (type === 'google') {
    iconSource = require('@/assets/images/google-icon.png');
  } else if (type === 'facebook') {
    iconSource = require('@/assets/images/facebook-icon.png');
  } else if (type === 'instagram') {
    iconSource = require('@/assets/images/instagram-icon.png');
  }

  return (
    <Pressable
      style={[
        styles.socialButton,
        {
          borderColor: theme.border,
          backgroundColor: isDark ? theme.backgroundElement : '#ffffff',
        },
        Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
      ]}
      accessibilityRole="button"
    >
      <Image source={iconSource} style={{ width: 24, height: 24 }} contentFit="contain" />
    </Pressable>
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
    paddingTop: 12,
    paddingBottom: 16,
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
  phoneInput: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    marginTop: 21,
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
  or: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
  },
  socials: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 18,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
  },
  loginButton: {
    marginTop: 24,
    marginBottom: 20,
  },
});
