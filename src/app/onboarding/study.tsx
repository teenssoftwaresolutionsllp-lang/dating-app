import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export default function StudyScreen() {
  const { qualification } = useLocalSearchParams<{ qualification?: string }>();
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();

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
      'PhD - Other',
    ],
    'Others': [
      'Vocational',
      'Certification',
      'Other',
    ],
  };

  const currentQualification = qualification || 'Bachelors';
  const options = studyOptionsMap[currentQualification] || studyOptionsMap['Bachelors'];

  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (selected) {
      router.push({
        pathname: '/onboarding/interests',
        params: { qualification: currentQualification, study: selected },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <View style={[styles.progressFill, { width: '45%', backgroundColor: theme.primaryButton }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              return (
                <Pressable
                  key={option}
                  onPress={() => setSelected(option)}
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
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Navigation */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: theme.primaryButton },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>

          <Pressable
            onPress={handleNext}
            disabled={!selected}
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.primaryButton,
                opacity: !selected ? 0.5 : 1,
              },
              Platform.OS === 'web' && ({ cursor: selected ? 'pointer' : 'default' } as any),
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    justifyContent: 'space-between',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    color: '#000000',
  },
});
