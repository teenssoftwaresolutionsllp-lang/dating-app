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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);

  const filteredProfessions = PROFESSIONS.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleNext = () => {
    if (!selectedProfession && !searchQuery.trim()) return;
    router.push('/company' as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.58} />

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
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
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
          disabled={!selectedProfession && searchQuery.trim().length === 0}
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
  sectionHeaderContainer: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
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
    marginBottom: 24,
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
