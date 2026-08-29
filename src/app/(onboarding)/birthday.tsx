import React, { useState, useRef } from 'react';
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
import { BirthdayGraphic } from '@/components/illustrations/birthday-graphic';
import { DatePicker } from '@/components/date-picker';

export default function BirthdayScreen() {
  const router = useRouter();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [height, setHeight] = useState('5.7');

  const [pickerDate, setPickerDate] = useState<Date>(new Date(2000, 5, 15));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dayInputRef = useRef<TextInput>(null);
  const monthInputRef = useRef<TextInput>(null);
  const yearInputRef = useRef<TextInput>(null);
  const heightInputRef = useRef<TextInput>(null);

  const isFormValid =
    day.trim().length > 0 &&
    month.trim().length > 0 &&
    year.trim().length === 4 &&
    height.trim().length > 0;

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
      heightInputRef.current?.focus();
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
            <BirthdayGraphic width={260} height={130} />
          </View>

          {/* Date Input Fields Row with Underlines (Day | Month | Year) */}
          <View style={styles.dateInputsContainer}>
            {/* Day Column */}
            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Day</Text>
              <TextInput
                ref={dayInputRef}
                style={styles.underlineInput}
                value={day}
                onChangeText={(val) => {
                  setDay(val);
                  if (val.length === 2) {
                    monthInputRef.current?.focus();
                  }
                }}
                placeholder="DD"
                placeholderTextColor="#D1D5DB"
                keyboardType="number-pad"
                maxLength={2}
                selectionColor="#00F5D4"
                returnKeyType="next"
                onSubmitEditing={() => monthInputRef.current?.focus()}
              />
            </View>

            {/* Month Column */}
            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Month</Text>
              <TextInput
                ref={monthInputRef}
                style={styles.underlineInput}
                value={month}
                onChangeText={(val) => {
                  setMonth(val);
                  if (val.length === 2) {
                    yearInputRef.current?.focus();
                  }
                }}
                placeholder="MM"
                placeholderTextColor="#D1D5DB"
                keyboardType="number-pad"
                maxLength={2}
                selectionColor="#00F5D4"
                returnKeyType="next"
                onSubmitEditing={() => yearInputRef.current?.focus()}
              />
            </View>

            {/* Year Column */}
            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Year</Text>
              <TextInput
                ref={yearInputRef}
                style={styles.underlineInput}
                value={year}
                onChangeText={(val) => {
                  setYear(val);
                  if (val.length === 4) {
                    heightInputRef.current?.focus();
                  }
                }}
                placeholder="YYYY"
                placeholderTextColor="#D1D5DB"
                keyboardType="number-pad"
                maxLength={4}
                selectionColor="#00F5D4"
                returnKeyType="next"
                onSubmitEditing={() => heightInputRef.current?.focus()}
              />
            </View>
          </View>

          {/* Quick Date Picker Trigger Modal */}
          <TouchableOpacity
            style={styles.datePickerQuickTrigger}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={16} color="#00B49F" style={{ marginRight: 6 }} />
            <Text style={styles.quickPickerText}>Or select from Date Picker</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DatePicker
              value={pickerDate}
              onChange={handleDatePicked}
              onNextField={() => {
                setShowDatePicker(false);
                heightInputRef.current?.focus();
              }}
            />
          )}

          {/* Height Section matching Screenshot 1 */}
          <View style={styles.heightSection}>
            <Text style={styles.heightTitle}>Height</Text>
            <View style={styles.heightInputRow}>
              <TextInput
                ref={heightInputRef}
                style={styles.heightInput}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                maxLength={4}
                selectionColor="#00F5D4"
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
              <Text style={styles.heightUnit}>fts</Text>
            </View>
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
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    marginTop: 20,
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
    marginTop: 8,
    width: '100%',
  },
  heightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  heightInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
    width: 140,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  heightInput: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlign: 'right',
    marginRight: 6,
    minWidth: 40,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  heightUnit: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
