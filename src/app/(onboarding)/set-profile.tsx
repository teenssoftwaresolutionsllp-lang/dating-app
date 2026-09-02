import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { FemaleAvatar, MaleAvatar } from '@/components/illustrations/gender-avatars';

export default function SetProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const isProfileValid = userName.trim().length > 0 && gender !== null;

  const handleNext = () => {
    if (!isProfileValid) return;
    router.push('/birthday');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OnboardingHeader progress={0.25} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title */}
          <Text style={styles.title}>Set Profile</Text>

          {/* User Name Section */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>User Name</Text>
            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={userName}
                onChangeText={setUserName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter user name"
                placeholderTextColor="#9CA3AF"
                selectionColor="#00F5D4"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (gender) {
                    handleNext();
                  }
                }}
              />
            </View>
            <Text style={styles.helperText}>
              only letters, numbers, special characters and no spaces.
            </Text>
          </View>

          {/* You Are Section */}
          <View style={styles.genderSection}>
            <Text style={styles.sectionTitle}>You Are</Text>

            <View style={styles.genderCardsRow}>
              {/* Female Card */}
              <TouchableOpacity
                style={[
                  styles.genderCard,
                  gender === 'Female' && styles.genderCardSelected,
                ]}
                onPress={() => setGender('Female')}
                activeOpacity={0.8}
              >
                <FemaleAvatar size={100} />
                <Text style={styles.genderLabel}>Female</Text>
              </TouchableOpacity>

              {/* Male Card */}
              <TouchableOpacity
                style={[
                  styles.genderCard,
                  gender === 'Male' && styles.genderCardSelected,
                ]}
                onPress={() => setGender('Male')}
                activeOpacity={0.8}
              >
                <MaleAvatar size={100} />
                <Text style={styles.genderLabel}>Male</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningRow}>
            <Ionicons name="information-circle-outline" size={18} color="#FF3B30" />
            <Text style={styles.warningText}>{"Gender can't be changed later"}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Button */}
      <OnboardingFooter showBack={false} onNext={handleNext} disabled={!isProfileValid} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 28,
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputContainerFocused: {
    borderColor: '#00F5D4',
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    height: '100%',
    width: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  genderSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  genderCardsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
  },
  genderCard: {
    flex: 1,
    maxWidth: 150,
    height: 150,
    backgroundColor: '#E0FDFD',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderCardSelected: {
    borderColor: '#00F5D4',
    backgroundColor: '#CEFBFB',
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 'auto',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
