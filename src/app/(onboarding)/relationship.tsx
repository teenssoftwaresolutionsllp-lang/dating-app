import React, { useRef, useState } from 'react';
import {
  Animated,
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
import { updateStoredUserProfile } from '@/constants/userProfile';
import { updateCurrentProfile } from '@/services/profileApi';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

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

  const handleNext = async () => {
    if (!selectedStatus) {
      setError(true);
      triggerShake();
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      updateStoredUserProfile({ relationshipStatus: selectedStatus });
      await updateCurrentProfile({ relationshipStatus: selectedStatus }).catch((e) => {
        console.warn('Backend sync warning on relationship status update:', e);
      });
      router.push('/(onboarding)/languages' as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/location');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.25} />

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
            {error && (
              <Animated.Text
                style={[
                  styles.errorMessage,
                  {
                    transform: [{ translateX: shakeAnim }],
                  },
                ]}
              >
                Please select your relationship status
              </Animated.Text>
            )}
          </View>

          {/* Radio Options List */}
          <View style={styles.optionsList}>
            {STATUS_OPTIONS.map((option) => {
              const isSelected = selectedStatus === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOptionRow}
                  onPress={() => {
                    setSelectedStatus(option);
                    if (error) setError(false);
                  }}
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
          nextButtonStyle={{
            backgroundColor: selectedStatus
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
  },
  centerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
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
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  errorMessage: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'DM_Sans_500Medium',
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
    borderColor: '#00E4E8',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E4E8',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
});
