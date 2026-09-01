import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, Keyboard, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LegalFooter, PrimaryButton, RelationshipArtwork } from '@/components/onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
    } else {
      router.push({ pathname: '/otp', params: { phone } });
    }
  };

  // State to track keyboard visibility
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhone(cleaned);
    if (cleaned.length === 10) {
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable 
        onPress={() => router.back()} 
        style={[styles.backButton, { top: insets.top + 8, left: 16 }]}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </Pressable>
      <Pressable style={styles.dismissArea} onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? -35 : -55}
        >
          <RelationshipArtwork variant="welcome" />
          <SafeAreaView style={styles.contentSafeArea} edges={['bottom', 'left', 'right']}>
            <View style={styles.content}>
              <Text style={[styles.title, { color: theme.text }]}>Welcome ,</Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>Login to Connect with your People.</Text>
              <View style={[styles.phoneInput, { borderColor: theme.border }]}>
                <Text style={[styles.countryCode, { color: theme.text, borderRightColor: theme.border }]}>+91</Text>
                <TextInput
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="00000 00000"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
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
        </KeyboardAvoidingView>
      </Pressable>
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
    <Pressable style={[styles.socialButton, { borderColor: theme.border, backgroundColor: isDark ? theme.backgroundElement : '#ffffff' }]} accessibilityRole="button">
      <Image source={iconSource} style={{ width: 24, height: 24 }} contentFit="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dismissArea: { flex: 1 },
  backButton: {
    position: 'absolute',
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSafeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  title: { fontFamily: 'DM_Serif_Display_400Regular', fontSize: 27 },
  subtitle: { fontFamily: 'DM_Sans_400Regular', fontSize: 14, marginTop: 2 },
  phoneInput: { alignItems: 'center', flexDirection: 'row', height: 48, marginTop: 21, borderRadius: 15, borderWidth: 1 },
  countryCode: { fontFamily: 'DM_Sans_400Regular', fontSize: 14, paddingHorizontal: 26, borderRightWidth: 1 },
  input: { flex: 1, fontFamily: 'DM_Sans_400Regular', fontSize: 14, paddingHorizontal: 14 },
  or: { fontFamily: 'DM_Sans_400Regular', fontSize: 13, marginTop: 20, textAlign: 'center' },
  socials: { flexDirection: 'row', justifyContent: 'center', gap: 34, marginTop: 18 },
  socialButton: { alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 14, borderWidth: 1 },
  loginButton: { marginTop: 24, marginBottom: 24 },
});
