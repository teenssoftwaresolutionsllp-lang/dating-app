import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';

const INCOME_OPTIONS = [
  'Below ₹2 Lakh',
  '₹2–5 Lakh',
  '₹5–10 Lakh',
  '₹10–20 Lakh',
  '₹20 Lakh+',
  'Prefer not to say',
];

export default function IncomeScreen() {
  const router = useRouter();
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedIncome) return;
    router.push('/verification' as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.72} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title & Subtitle */}
          <Text style={styles.title}>Education & Career</Text>
          <Text style={styles.subtitle}>
            Add your education and work details to complete your profile.
          </Text>

          {/* Question Heading */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>What is your annual income?</Text>
          </View>

          {/* Radio Options List */}
          <View style={styles.optionsList}>
            {INCOME_OPTIONS.map((option) => {
              const isSelected = selectedIncome === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOptionRow}
                  onPress={() => setSelectedIncome(option)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          disabled={!selectedIncome}
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  optionsList: {
    width: '100%',
    gap: 18,
  },
  radioOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#93EAE6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: '#00F5D4',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00F5D4',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 14,
  },
});
