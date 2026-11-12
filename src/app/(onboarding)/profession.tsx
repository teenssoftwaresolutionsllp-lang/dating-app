import React, { useState } from 'react';
import {
  Animated,
  View,
  Text,
  // TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  // Platform,
  // Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import {
  getOnboardingProfileDraft,
  updateOnboardingProfileDraft,
} from '@/constants/userProfile';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';
import { updateEducation } from '@/services/profileApi';

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
  'Freelancing',
  'Others',

];

export default function ProfessionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const initialDraft = getOnboardingProfileDraft();
  const [selectedProfession, setSelectedProfession] = useState<string | null>(
    initialDraft.profession || null,
  );
  const [error, setError] = useState(false);
  const isProfessionValid = Boolean(selectedProfession);
  const [shakeAnim] = useState(() => new Animated.Value(0));

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

  // const filteredProfessions = PROFESSIONS.filter((item) =>
  //   item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  // );

  const handleNext = async () => {
    if (!selectedProfession) {
      setError(true);
      triggerShake();
      return;
    }

    const finalProfession = selectedProfession;

    updateOnboardingProfileDraft({ profession: finalProfession });

    await updateEducation({
      profession: finalProfession,
      occupation: finalProfession,
    }).catch((e) => {
      console.warn('Backend sync warning on profession update:', e);
    });

    router.push({
      pathname: '/(onboarding)/company',
      params: { profession: finalProfession },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/study');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.45} />

        <View style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Title & Subtitle */}
            <Text style={styles.title}>{t('onboarding.steps.career.mainTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('onboarding.steps.career.mainSubtitle')}
            </Text>

            {/* Question Heading */}
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>
                {t('onboarding.steps.career.professionTitle')}
              </Text>

              {error && (
                <Animated.Text
                  style={[
                    styles.errorMessage,
                    { transform: [{ translateX: shakeAnim }] },
                  ]}
                >
                  {t('onboarding.steps.career.professionError')}
                </Animated.Text>
              )}
            </View>

            {/* Search Input Capsule */}

            {/* Profession Options List */}
            {/* Profession Options List */}
            <View style={styles.listContainer}>
              {PROFESSIONS.map((profession) => {
                const isSelected = selectedProfession === profession;

                return (
                  <TouchableOpacity
                    key={profession}
                    style={styles.optionRow}
                    onPress={() => {
                      setSelectedProfession(profession);
                      updateOnboardingProfileDraft({ profession });
                      setError(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected
                            ? theme.primaryButton
                            : theme.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInnerCircle,
                            { backgroundColor: theme.primaryButton },
                          ]}
                        />
                      )}
                    </View>

                    <Text style={styles.optionText}>
                      {profession}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

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
  // searchSection: {
  //   width: '100%',
  //   position: 'relative',
  //   marginBottom: 24,
  // },
  // searchContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   width: '100%',
  //   height: 48,
  //   borderWidth: 1,
  //   borderColor: '#D1D5DB',
  //   borderRadius: 24,
  //   paddingHorizontal: 16,
  //   backgroundColor: '#FFFFFF',
  // },
  // searchContainerFocused: {
  //   borderColor: '#00E4E8',
  // },
  // searchContainerWithError: {
  //   borderColor: '#FF3B30',
  // },
  errorMessage: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'DM_Sans_500Medium',
  },
  // searchIcon: {
  //   marginRight: 10,
  // },
  // searchInput: {
  //   flex: 1,
  //   fontSize: 14,
  //   color: '#111827',
  //   backgroundColor: '#FFFFFF',
  //   height: '100%',
  //   paddingVertical: 0,
  //   outlineStyle: 'none' as any,
  // },
  listContainer: {
    width: '100%',
    gap: 22,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:14,
  },
  // optionRowSelected: {
  //   backgroundColor: '#F0FCFC',
  // },
  // optionText: {
  //   fontSize: 15,
  //   fontWeight: '500',
  //   color: '#374151',
  // },
  // optionTextSelected: {
  //   fontWeight: '700',
  //   color: '#111827',
  // },
    radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
});
