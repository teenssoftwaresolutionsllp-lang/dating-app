import React, { useState } from 'react';
import {
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

export default function CompanyScreen() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleNext = () => {
    router.push('/income' as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.65} />

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
              <Text style={styles.label}>Company Name</Text>
            </View>

            {/* Capsule Input Container */}
            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={companyName}
                onChangeText={setCompanyName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter Company Name"
                placeholderTextColor="#9CA3AF"
                selectionColor="#00F5D4"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
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
    maxWidth: 500,
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
  textInput: {
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    height: '100%',
    width: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
});
