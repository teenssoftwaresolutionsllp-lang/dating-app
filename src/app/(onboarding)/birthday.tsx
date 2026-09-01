import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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

import { DatePicker } from '@/components/date-picker';
import { BirthdayGraphic } from '@/components/illustrations/birthday-graphic';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { OnboardingHeader } from '@/components/onboarding-header';

export default function BirthdayScreen() {
  const router = useRouter();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('6');

  const [pickerDate, setPickerDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dayInputRef = useRef<TextInput>(null);
  const monthInputRef = useRef<TextInput>(null);
  const yearInputRef = useRef<TextInput>(null);
  const feetInputRef = useRef<TextInput>(null);
  const inchesInputRef = useRef<TextInput>(null);

  const feetNum = parseInt(heightFeet, 10) || 0;
  const inchesNum = parseInt(heightInches, 10) || 0;
  const isFeetValid = feetNum >= 4 && feetNum <= 10;
  const isInchesValid = inchesNum >= 0 && inchesNum <= 11;

  const isFormValid =
    day.trim().length > 0 &&
    month.trim().length > 0 &&
    year.trim().length === 4 &&
    heightFeet.trim().length > 0 &&
    heightInches.trim().length > 0 &&
    isFeetValid &&
    isInchesValid;

  const handleFeetChange = (val: string) => {
    const numVal = parseInt(val, 10);
    if (val === '' || (val.length <= 2 && numVal >= 1 && numVal <= 10)) {
      setHeightFeet(val);
    }
  };

  const handleInchesChange = (val: string) => {
    const numVal = parseInt(val, 10);
    if (val === '' || (val.length <= 2 && numVal >= 0 && numVal <= 11)) {
      setHeightInches(val);
    }
  };

  const incrementFeet = () => {
    const current = parseInt(heightFeet, 10) || 1;
    if (current < 9) {
      setHeightFeet((current + 1).toString());
    }
  };

  const decrementFeet = () => {
    const current = parseInt(heightFeet, 10) || 1;
    if (current > 1) {
      setHeightFeet((current - 1).toString());
    }
  };

  const incrementInches = () => {
    const current = parseInt(heightInches, 10) || 0;
    if (current < 11) {
      setHeightInches((current + 1).toString().padStart(2, '0'));
    }
  };

  const decrementInches = () => {
    const current = parseInt(heightInches, 10) || 0;
    if (current > 0) {
      setHeightInches((current - 1).toString().padStart(2, '0'));
    }
  };

  const handleNext = () => {
    if (!isFormValid) return;
    router.push('/location');
  };

  const handleBack = () => {
    router.back();
  };

  const handleDatePicked = (selectedDate: Date) => {
    setPickerDate(selectedDate);
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const y = String(selectedDate.getFullYear());
    setDay(d);
    setMonth(m);
    setYear(y);
    setTimeout(() => {
      feetInputRef.current?.focus();
    }, 150);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          {/* Title & Subtitle matching Screenshot 1 */}
          <Text style={styles.title}>When is your Birthday?</Text>
          <Text style={styles.subtitle}>
            Write your birth year to complete your profile
          </Text>

          {/* Birthday Party Illustration */}
          <View style={styles.illustrationContainer}>
            <BirthdayGraphic width={280} height={150} />
          </View>

          <View style={styles.calendarSection}>
            <DatePicker
              value={pickerDate}
              onChange={handleDatePicked}
              onNextField={() => {
                setShowDatePicker(false);
                feetInputRef.current?.focus();
              }}
              placeholder="DD/MM/YY"
            />
          </View>

          {/* Height Section - Feet and Inches Spinners */}
          <View style={styles.heightSection}>
            <Text style={styles.heightTitle}>How tall are you?</Text>

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
                  selectionColor="#00F5D4"
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
                  selectionColor="#00F5D4"
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
                Feet should be between 4-10.
              </Text>
            )}
            {!isInchesValid && heightInches.trim().length > 0 && (
              <Text style={styles.errorMessage}>
                Inches should be between 0-11.
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
        disabled={!isFormValid}
      />
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
  calendarSection: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
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
    color: '#00B49F',
  },
  heightSection: {
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
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
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    marginTop: 8,
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
    color: '#00B49F',
    fontWeight: '700',
  },
});