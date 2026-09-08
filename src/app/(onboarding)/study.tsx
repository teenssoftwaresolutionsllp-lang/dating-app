import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { updateStoredUserProfile } from '@/constants/userProfile';

export default function StudyScreen() {
  const { qualification } = useLocalSearchParams<{ qualification?: string }>();
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';

  const studyOptionsMap: Record<string, string[]> = {
    'High School': [
      '10th / SSC',
      '11th / Intermediate',
      'Diploma',
      'Other',
    ],
    'Bachelors': [
      'B.Tech / B.E',
      'B.Sc',
      'B.Com',
      'B.A',
      'BBA',
      'BCA',
      'LLB',
      'B. Pharmacy',
      'B. Arch',
      'Other',
    ],
    'Masters': [
      'M.Tech / M.E',
      'M.Sc',
      'M.Com',
      'M.A',
      'MBA',
      'MCA',
      'LLM',
      'M. Pharmacy',
      'Other',
    ],
    'PhD': [
      'PhD - Engineering / Technology',
      'PhD - Science',
      'PhD - Arts / Humanities',
      'PhD - Management / Commerce',
      'Other',
    ],
    'Others': [
      'ITI / Vocational',
      'Certification / Professional Course',
      'Other',
    ],
  };

  const currentQualification = qualification || 'Others';
  const options = studyOptionsMap[currentQualification] || studyOptionsMap['Others'];

  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const isOtherSelected = selected === 'Other' || (selected ? selected.endsWith('Other') : false);
  const isFormValid = Boolean(
    selected && (!isOtherSelected || otherText.trim().length > 0)
  );

  const handleOptionPress = (option: string) => {
    setSelected(option);
    if (option !== 'Other' && !option.endsWith('Other')) {
      setOtherText('');
    }
  };

  const handleNext = () => {
    if (!selected) return;
    const finalStudy = isOtherSelected ? otherText.trim() || 'Other' : selected;
    updateStoredUserProfile({
      education: `${currentQualification} - ${finalStudy}`,
    });
    router.push({
      pathname: '/(onboarding)/profession',
      params: { qualification: currentQualification, study: finalStudy },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/qualification' as any);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.responsiveContainer}>
          {/* Progress Bar */}
          <OnboardingHeader progress={0.4} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Text style={[styles.title, { color: theme.text }]}>Education & Career</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Add your education and work details to complete your profile.
            </Text>

            {/* Section Title */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              What did you study?
            </Text>

            {/* Radio list options */}
            <View style={styles.optionsList}>
              {options.map((option) => {
                const isSelected = selected === option;
                const isOther = option === 'Other' || option.endsWith('Other');

                return (
                  <View key={option} style={styles.optionWrapper}>
                    <Pressable
                      onPress={() => handleOptionPress(option)}
                      style={[styles.radioContainer, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                    >
                      {/* Radio Circle */}
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: isSelected ? theme.primaryButton : theme.border },
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

                      {/* Option Text */}
                      <Text style={[styles.optionText, { color: theme.text }]}>
                        {option}
                      </Text>
                    </Pressable>

                    {/* Text input box below Other option when selected */}
                    {isSelected && isOther && (
                      <View
                        style={[
                          styles.otherInputContainer,
                          {
                            backgroundColor: isDark ? theme.backgroundElement : '#FFFFFF',
                            borderColor: isInputFocused ? theme.primaryButton : (isDark ? '#374151' : '#D1D5DB'),
                          },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.otherTextInput,
                            { color: theme.text },
                          ]}
                          value={otherText}
                          onChangeText={setOtherText}
                          onFocus={() => setIsInputFocused(true)}
                          onBlur={() => setIsInputFocused(false)}
                          placeholder="Enter your field of study"
                          placeholderTextColor={theme.textSecondary || '#9CA3AF'}
                          autoFocus
                          selectionColor={theme.primaryButton}
                          returnKeyType="done"
                          onSubmitEditing={isFormValid ? handleNext : undefined}
                          {...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Navigation */}
          <OnboardingFooter
            showBack
            onBack={handleBack}
            onNext={handleNext}
            disabled={!isFormValid}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    alignSelf: 'center',
    maxWidth: 290,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 16,
    marginTop: 34,
    marginBottom: 24,
  },
  optionsList: {
    width: '100%',
    gap: 22,
  },
  optionWrapper: {
    width: '100%',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
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
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 15,
  },
  otherInputContainer: {
    marginTop: 12,
    marginLeft: 36,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  otherTextInput: {
    fontSize: 15,
    fontFamily: 'DM_Sans_400Regular',
    paddingVertical: 0,
    height: '100%',
    width: '100%',
  },
});
