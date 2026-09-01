import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, Keyboard } from 'react-native';
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
    if (digit && index < 3) inputs.current[index + 1]?.focus();
  }

  function resend() {
    if (seconds === 0) {
      setCode(['', '', '', '']);
      setSeconds(30);
      inputs.current[0]?.focus();
    }
  }

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
          <RelationshipArtwork variant="otp" />
          <SafeAreaView style={styles.contentSafeArea} edges={['bottom', 'left', 'right']}>
            <View style={styles.content}>
              <View style={styles.headingRow}>
                <Text style={[styles.heading, { color: theme.text }]}>Enter OTP to Verify</Text>
                <Pressable onPress={resend} disabled={seconds > 0}>
                  <Text style={[
                    styles.resend, 
                    { color: isDark ? '#538DFF' : '#1769FF' }, 
                    seconds > 0 && styles.disabled
                  ]}>Resend in 00:{String(seconds).padStart(2, '0')}</Text>
                </Pressable>
              </View>
              <View style={styles.otpRow}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(input) => { inputs.current[index] = input; }}
                    value={digit}
                    onChangeText={(value) => updateCode(value, index)}
                    onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && !digit && index > 0 && inputs.current[index - 1]?.focus()}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={[
                      styles.otpInput, 
                      { 
                        color: theme.text, 
                        borderColor: theme.border, 
                        backgroundColor: isDark ? theme.backgroundElement : '#ffffff' 
                      }
                    ]}
                    textAlign="center"
                  />
                ))}
              </View>
              <View style={styles.sentRow}>
                <Text style={[styles.sent, { color: theme.textSecondary }]}>
                  We have sent OTP to {phone || '00000 00000'}
                </Text>
                <Pressable onPress={() => router.back()} style={styles.editButton}>
                  <Ionicons name="pencil" size={14} color={theme.textSecondary} />
                </Pressable>
              </View>
              <PrimaryButton disabled={!complete} onPress={() => router.replace('/(tab)' as any)} style={styles.verifyButton}>
                Verify
              </PrimaryButton>
              <LegalFooter />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Pressable>
    </View>
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 22 },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heading: { fontFamily: 'DM_Sans_500Medium', fontSize: 14 },
  resend: { fontFamily: 'DM_Sans_500Medium', fontSize: 12 },
  disabled: { opacity: 1 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 27 },
  otpInput: { fontFamily: 'DM_Sans_500Medium', fontSize: 18, width: 56, height: 56, borderRadius: 14, borderWidth: 1 },
  sentRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 15 },
  sent: { fontFamily: 'DM_Sans_400Regular', fontSize: 12 },
  editButton: { padding: 4, marginLeft: 2 },
  verifyButton: { marginTop: 24, marginBottom: 24 },
});
