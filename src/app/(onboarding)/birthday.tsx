import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { DatePicker } from '@/components/date-picker';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { OnboardingHeader } from '@/components/onboarding-header';
import {
  getOnboardingProfileDraft,
  updateOnboardingProfileDraft,
} from '@/constants/userProfile';
import { updateCurrentProfile } from '@/services/profileApi';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';

function parseSavedDob(dob?: string): {
  day: string;
  month: string;
  year: string;
  date: Date | null;
} {
  if (!dob) return { day: '', month: '', year: '', date: null };
  const isoPart = dob.trim().split('T')[0];
  const parts = isoPart.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const yNum = parseInt(parts[0], 10);
    const mNum = parseInt(parts[1], 10);
    const dNum = parseInt(parts[2], 10);
    if (
      !isNaN(yNum) &&
      !isNaN(mNum) &&
      !isNaN(dNum) &&
      mNum >= 1 &&
      mNum <= 12 &&
      dNum >= 1 &&
      dNum <= 31
    ) {
      return {
        day: String(dNum).padStart(2, '0'),
        month: String(mNum).padStart(2, '0'),
        year: String(yNum),
        date: new Date(yNum, mNum - 1, dNum),
      };
    }
  }
  return { day: '', month: '', year: '', date: null };
}

function parseSavedHeight(height?: string): { feet: string; inches: string } {
  if (height !== undefined) {
    const match = height.match(/^(\d*)\s*'\s*(\d*)/);
    if (match) {
      return { feet: match[1], inches: match[2] };
    }
  }
  return { feet: '5', inches: '6' };
}

export default function BirthdayScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const initialDraft = getOnboardingProfileDraft();
  const initialDob = parseSavedDob(initialDraft.dateOfBirth);
  const initialHeight = parseSavedHeight(initialDraft.height);

  const [day, setDay] = useState(initialDob.day);
  const [month, setMonth] = useState(initialDob.month);
  const [year, setYear] = useState(initialDob.year);
  const [heightFeet, setHeightFeet] = useState(initialHeight.feet);
  const [heightInches, setHeightInches] = useState(initialHeight.inches);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pickerDate, setPickerDate] = useState<Date | null>(initialDob.date);
  const [dobError, setDobError] = useState(false);

  const [dobShakeAnim] = useState(() => new Animated.Value(0));

  const feetInputRef = useRef<TextInput>(null);
  const inchesInputRef = useRef<TextInput>(null);

  const feetNum = parseInt(heightFeet, 10) || 0;
  const inchesNum = parseInt(heightInches, 10) || 0;
  const isFeetValid = feetNum >= 4 && feetNum <= 10;
  const isInchesValid = inchesNum >= 0 && inchesNum <= 11;

  const isDobValid =
    pickerDate !== null ||
    (day.trim().length > 0 && month.trim().length > 0 && year.trim().length === 4);

  const isFormValid =
    isDobValid &&
    heightFeet.trim().length > 0 &&
    heightInches.trim().length > 0 &&
    isFeetValid &&
    isInchesValid;

  const triggerDobShake = () => {
    dobShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(dobShakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(dobShakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(dobShakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(dobShakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(dobShakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(dobShakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(dobShakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const persistHeight = (feet: string, inches: string) => {
    const f = parseInt(feet, 10);
    const i = parseInt(inches, 10);
    const totalCm =
      !isNaN(f) && !isNaN(i) ? Math.round((f * 12 + i) * 2.54) : 0;
    updateOnboardingProfileDraft({
      height: `${feet}'${inches}" (${totalCm} cm)`,
    });
  };

  const handleFeetChange = (val: string) => {
    const numVal = parseInt(val, 10);
    if (val === '' || (val.length <= 2 && numVal >= 1 && numVal <= 10)) {
      setHeightFeet(val);
      persistHeight(val, heightInches);
    }
  };

  const handleInchesChange = (val: string) => {
    const numVal = parseInt(val, 10);
    if (val === '' || (val.length <= 2 && numVal >= 0 && numVal <= 11)) {
      setHeightInches(val);
      persistHeight(heightFeet, val);
    }
  };

  const incrementFeet = () => {
    const current = parseInt(heightFeet, 10) || 1;
    if (current < 9) {
      const next = (current + 1).toString();
      setHeightFeet(next);
      persistHeight(next, heightInches);
    }
  };

  const decrementFeet = () => {
    const current = parseInt(heightFeet, 10) || 1;
    if (current > 1) {
      const next = (current - 1).toString();
      setHeightFeet(next);
      persistHeight(next, heightInches);
    }
  };

  const incrementInches = () => {
    const current = parseInt(heightInches, 10) || 0;
    if (current < 11) {
      const next = (current + 1).toString().padStart(2, '0');
      setHeightInches(next);
      persistHeight(heightFeet, next);
    }
  };

  const decrementInches = () => {
    const current = parseInt(heightInches, 10) || 0;
    if (current > 0) {
      const next = (current - 1).toString().padStart(2, '0');
      setHeightInches(next);
      persistHeight(heightFeet, next);
    }
  };

  const handleNext = async () => {
    if (!isDobValid) {
      setDobError(true);
      triggerDobShake();
      return;
    }
    if (!isFeetValid || !isInchesValid || heightFeet.trim().length === 0 || heightInches.trim().length === 0 || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const d = day.padStart(2, '0');
      const m = month.padStart(2, '0');
      const y = year;
      const dobString = `${y}-${m}-${d}`;
      const totalCm = Math.round((parseInt(heightFeet, 10) * 12 + parseInt(heightInches, 10)) * 2.54);

      updateOnboardingProfileDraft({
        dateOfBirth: dobString,
        height: `${heightFeet}'${heightInches}" (${totalCm} cm)`,
      });

      await updateCurrentProfile({
        dateOfBirth: dobString,
        heightCm: totalCm,
      }).catch((e) => {
        console.warn('Backend sync warning on birthday update:', e);
      });

      router.push('/location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/set-profile');
    }
  };

  const handleDatePicked = (selectedDate: Date) => {
    setDobError(false);
    setPickerDate(selectedDate);
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const y = String(selectedDate.getFullYear());
    setDay(d);
    setMonth(m);
    setYear(y);
    updateOnboardingProfileDraft({
      dateOfBirth: `${y}-${m}-${d}`,
    });
    setTimeout(() => {
      feetInputRef.current?.focus();
    }, 150);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.22} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title & Subtitle matching Screenshot 1 */}
            <Text style={styles.title}>{t('onboarding.steps.birthday.title')}</Text>
            <Text style={styles.subtitle}>
              {t('onboarding.steps.birthday.subtitle')}
            </Text>

            {/* Birthday Party Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                source={require('@/assets/images/birthday.jpg')}
                style={styles.birthdayImage}
                contentFit="contain"
              />
            </View>

            <View style={styles.calendarSection}>
              <DatePicker
                value={pickerDate}
                onChange={handleDatePicked}
                onNextField={() => {
                  feetInputRef.current?.focus();
                }}
                placeholder={t('onboarding.steps.birthday.dobPlaceholder')}
                hasError={dobError}
              />
              {dobError && (
                <Animated.Text
                  style={[
                    styles.dobErrorMessage,
                    {
                      transform: [{ translateX: dobShakeAnim }],
                    },
                  ]}
                >
                  {t('onboarding.steps.birthday.dobError')}
                </Animated.Text>
              )}
            </View>

            {/* Height Section - Feet and Inches Spinners */}
            <View style={styles.heightSection}>
              <Text style={styles.heightTitle}>{t('onboarding.steps.birthday.heightTitle')}</Text>

              {/* Feet and Inches Row */}
              <View style={styles.heightSpinnerRow}>
                {/* Feet Spinner */}
                <View style={styles.spinnerContainer}>
                  <TextInput
                    ref={feetInputRef}
                    style={styles.spinnerInput}
                    value={heightFeet}
                    onChangeText={handleFeetChange}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectionColor="#00E4E8"
                  />

                  <View style={styles.spinnerArrowStack}>
                    <Pressable style={styles.spinnerButton} onPress={incrementFeet}>
                      <Ionicons name="chevron-up" size={18} color="#64748B" />
                    </Pressable>
                    <Pressable style={styles.spinnerButton} onPress={decrementFeet}>
                      <Ionicons name="chevron-down" size={18} color="#64748B" />
                    </Pressable>
                  </View>

                </View>

                {/* Inches Spinner */}
                <View style={styles.spinnerContainer}>
                  <TextInput
                    ref={inchesInputRef}
                    style={styles.spinnerInput}
                    value={heightInches}
                    onChangeText={handleInchesChange}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectionColor="#00E4E8"
                  />

                  <View style={styles.spinnerArrowStack}>
                    <Pressable style={styles.spinnerButton} onPress={incrementInches}>
                      <Ionicons name="chevron-up" size={18} color="#64748B" />
                    </Pressable>
                    <Pressable style={styles.spinnerButton} onPress={decrementInches}>
                      <Ionicons name="chevron-down" size={18} color="#64748B" />
                    </Pressable>
                  </View>

                </View>
              </View>

              {/* Validation Error Message */}
              {!isFeetValid && heightFeet.trim().length > 0 && (
                <Text style={styles.errorMessage}>
                  {t('onboarding.steps.birthday.feetError')}
                </Text>
              )}
              {!isInchesValid && heightInches.trim().length > 0 && (
                <Text style={styles.errorMessage}>
                  {t('onboarding.steps.birthday.inchesError')}
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Action Footer with Validation */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextButtonStyle={{
            backgroundColor: isFormValid
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
    paddingBottom: 16,
    alignItems: 'center',
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
    marginBottom: 16,
  },
  illustrationContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthdayImage: {
    width: 280,
    height: 150,
  },
  calendarSection: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
    position: 'relative',
  },
  dateInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  underlineInput: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D1D5DB',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 0,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  datePickerQuickTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E0FDFD',
    marginBottom: 24,
  },
  quickPickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00E4E8',
  },
  heightSection: {
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    position: 'relative',
  },
  heightTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  heightSpinnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
    marginBottom: 16,
  },
  spinnerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  spinnerArrowStack: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  spinnerButton: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  spinnerInput: {
    flex: 1,
    minWidth: 28,
    fontSize: 26,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  errorMessage: {
    position: 'absolute',
    bottom: -18,
    fontSize: 13,
    fontWeight: '500',
    color: '#EF4444',
  },
  dobErrorMessage: {
    position: 'absolute',
    bottom: -16,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    alignSelf: 'center',
    left: 10
  },
  scrollerContainer: {
    width: '100%',
    marginTop: 24,
    height: 200,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  scrollerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scrollerItemSelected: {
    backgroundColor: '#E0FDFD',
  },
  scrollerItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  scrollerItemTextSelected: {
    color: '#00E4E8',
    fontWeight: '700',
  },
});