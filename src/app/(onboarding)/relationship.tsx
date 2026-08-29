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

const STATUS_OPTIONS = [
  'Single',
  'In a Relationship',
  'Married',
  'Separated',
  'Divorced',
  'Widowed',
  'Prefer not to say',
];

export default function RelationshipScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedStatus) return;
    // Finish onboarding, navigate to main app tabs
    // router.replace('/(tab)');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OnboardingHeader progress={1.0} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title & Subtitle */}
        <Text style={styles.title}>{"What's your relationship status?"}</Text>
        <Text style={styles.subtitle}>
          Tell us where you are in your relationship journey.
        </Text>

        {/* Section Heading */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Relationship Status</Text>
        </View>

        {/* Radio Options List */}
        <View style={styles.optionsList}>
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selectedStatus === option;
            return (
              <TouchableOpacity
                key={option}
                style={styles.radioOptionRow}
                onPress={() => setSelectedStatus(option)}
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

      {/* Action Footer */}
      <OnboardingFooter
        showBack
        onBack={handleBack}
        onNext={handleNext}
        disabled={!selectedStatus}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
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
    fontWeight: '700',
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
    marginLeft: 12,
  },
});
