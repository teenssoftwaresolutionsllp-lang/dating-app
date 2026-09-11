import React, { useRef, useState } from 'react';
import {
  Animated,
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
import { updateStoredUserProfile } from '@/constants/userProfile';
import { useTheme } from '@/hooks/use-theme';

const PROFESSIONS = [
  'Software Engineer',
  'Designer',
  'Doctor',
  'Teacher',
  'Business Owner',
  'Manager',
  'Marketing',
  'Architect',
  'Accountant',
  'Consultant',
  'Entrepreneur',
  'Financial Analyst',
  'Lawyer',
  'Nurse',
  'Product Manager',
  'Researcher',
  'Student',
];

export default function ProfessionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const isProfessionValid = Boolean(selectedProfession || searchQuery.trim().length > 0);

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

  const filteredProfessions = PROFESSIONS.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleNext = () => {
    if (!selectedProfession && !searchQuery.trim()) {
      setError(true);
      triggerShake();
      return;
    }
    const finalProfession = selectedProfession || searchQuery.trim();
    updateStoredUserProfile({ profession: finalProfession });
    router.push('/(onboarding)/company' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/study' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.45} />

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

            {/* Question Heading */}
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>What do you do?</Text>
            </View>

            {/* Search Input Capsule */}
            <View style={styles.searchSection}>
              <View style={[styles.searchContainer, error && styles.searchContainerWithError]}>
                <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (error && text.trim().length > 0) {
                      setError(false);
                    }
                    if (text && !selectedProfession) {
                      setSelectedProfession(text);
                    }
                  }}
                  placeholder="Search Profession"
                  placeholderTextColor="#9CA3AF"
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
                  Please choose your Profession
                </Animated.Text>
              )}
            </View>

            {/* Profession Options List */}
            <View style={styles.listContainer}>
              {filteredProfessions.map((profession) => {
                const isSelected = selectedProfession === profession;
                return (
                  <TouchableOpacity
                    key={profession}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    onPress={() => {
                      setSelectedProfession(profession);
                      setSearchQuery(profession);
                      if (error) {
                        setError(false);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {profession}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#00F5D4" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextButtonStyle={{
            backgroundColor: isProfessionValid
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
  sectionHeaderContainer: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  searchSection: {
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  searchContainerWithError: {
    borderColor: '#FF3B30',
  },
  errorMessage: {
    position: 'absolute',
    bottom: -18,
    left: 12,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'DM_Sans_500Medium',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  listContainer: {
    width: '100%',
    gap: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  optionRowSelected: {
    backgroundColor: '#F0FCFC',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#111827',
  },
});
