import React, { useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { useTheme } from '@/hooks/use-theme';

export default function CompanyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [companyName, setCompanyName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(false);

  const isCompanyValid = Boolean(companyName.trim().length > 0);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (!companyName.trim()) {
      setError(true);
      triggerShake();
      return;
    }
    router.push('/(onboarding)/income' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profession');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.5} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Title & Subtitle */}
            <Text style={styles.title}>Education & Career</Text>
            <Text style={styles.subtitle}>
              Add your education and work details to complete your profile.
            </Text>

            {/* Section Label */}
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Company Name / Organization</Text>
            </View>

            {/* Capsule Input Container */}
            <View style={styles.inputSection}>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  error && styles.inputContainerError,
                ]}
              >
                <TextInput
                  style={[
                    styles.textInput,
                    error && styles.textInputError,
                  ]}
                  value={companyName}
                  onChangeText={(text) => {
                    setCompanyName(text);
                    if (error && text.trim().length > 0) {
                      setError(false);
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter company name"
                  placeholderTextColor={error ? '#9CA3AF' : '#9CA3AF'}
                  selectionColor="#00F5D4"
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>

              {error && (
                <Animated.Text
                  style={[
                    styles.errorMessage,
                    {
                      transform: [{ translateX: shakeAnim }],
                    },
                  ]}
                >
                  Please enter your company name/organization
                </Animated.Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextButtonStyle={{
            backgroundColor: isCompanyValid
              ? theme.primaryButton
              : '#BDFFF9',
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 18,
  },
  labelContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  inputSection: {
    width: '100%',
    position: 'relative',
  },
  inputContainer: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputContainerFocused: {
    borderColor: '#00F5D4',
    borderWidth: 1.5,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  textInput: {
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    height: '100%',
    width: '100%',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  textInputError: {
    color: '#FF3B30',
  },
  errorMessage: {
    position: 'absolute',
    bottom: -20,
    left: 16,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'DM_Sans_500Medium',
  },
});
