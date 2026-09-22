import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { updateStoredUserProfile } from '@/constants/userProfile';
import { getInterestsCatalog, updateInterests, type CatalogItem } from '@/services/profileApi';

const DEFAULT_INTERESTS = [
  'Music',
  'Movies',
  'Travel',
  'Concerts',
  'Nature',
  'Dance',
  'Food',
  'Fitness',
  'Gaming',
  'Books',
  'Sports',
  'Cooking',
  'Photography',
  'Art',
  'Pets',
];

export default function InterestsScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Music', 'Movies', 'Travel']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getInterestsCatalog().then((items) => {
      if (items && items.length > 0) {
        setCatalog(items);
      }
    });
  }, []);

  const availableInterests = catalog.length > 0 ? catalog.map((c) => c.name) : DEFAULT_INTERESTS;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = async () => {
    if (selectedInterests.length < 1 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      updateStoredUserProfile({ interests: selectedInterests });
      const interestIds = selectedInterests.map((name) => {
        const found = catalog.find((c) => c.name.toLowerCase() === name.toLowerCase());
        return found ? found.id : DEFAULT_INTERESTS.indexOf(name) + 1;
      }).filter((id) => id > 0);

      if (interestIds.length > 0) {
        await updateInterests(interestIds).catch((e) => {
          console.warn('Backend sync warning on interests update:', e);
        });
      }

      router.push({
        pathname: '/looking-for',
        params: { interests: JSON.stringify(selectedInterests) },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/photos');
    }
  };

  const isNextEnabled = selectedInterests.length >= 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        <OnboardingHeader progress={0.7} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text }]}>What are you into?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tell us a little about yourself so we can help you find better matches.
          </Text>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Interests</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Choose at least 3</Text>
          </View>

          {/* Interests Chips Grid */}
          <View style={styles.chipsContainer}>
            {availableInterests.map((interest: string) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.primaryButton : isDark ? theme.backgroundElement : '#FFFFFF',
                      borderColor: isSelected ? theme.primaryButton : isDark ? '#333333' : '#B9B9B9',
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#000000' : theme.text,
                        fontFamily: isSelected ? 'DM_Sans_700Bold' : 'DM_Sans_500Medium',
                      },
                    ]}
                  >
                    {interest}
                  </Text>
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'add'}
                    size={16}
                    color={isSelected ? '#000000' : theme.textSecondary}
                    style={styles.chipIcon}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Navigation */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          disabled={!isNextEnabled}
        />
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  sectionHeader: {
    marginTop: 32,
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
  },
  sectionSubtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  chipIcon: {
    marginLeft: 6,
  },
});
