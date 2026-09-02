import { router } from 'expo-router';
import { useState, useRef } from 'react';
import {
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export default function IdealMatchScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();

  // Age state (18 to 55)
  const [minAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [trackWidth, setTrackWidth] = useState(240);

  // Distance state
  const distanceOptions = ['5 km', '10 km', '25 km', '50 km', 'Any Where'];
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);

  // Partner Religion state
  const religionOptions = [
    'Open to all',
    'Hindu',
    'Muslim',
    'Christian',
    'Sikh',
    'Jain',
    'Buddhist',
    'Spiritual - not religious',
    'Agnostic',
    'Atheist',
    'Other',
  ];
  const [selectedReligion, setSelectedReligion] = useState<string>('');
  const [religionModalVisible, setReligionModalVisible] = useState(false);

  // Partner Interests state
  const interestsList = [
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
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSliderTouch = (touchX: number) => {
    if (trackWidth <= 0) return;
    const clampedX = Math.max(0, Math.min(touchX, trackWidth));
    const ratio = clampedX / trackWidth;
    const calculatedAge = Math.round(18 + ratio * (55 - 18));
    setMaxAge(Math.max(18, Math.min(55, calculatedAge)));
  };

  // Slider pan responder for age (works on iOS, Android, tablets, and Web mouse/touch)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleSliderTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleSliderTouch(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const handleNext = () => {
    router.push('/onboarding/ready');
  };

  // Slider progress ratio
  const sliderProgress = (maxAge - 18) / (55 - 18);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <View style={[styles.progressFill, { width: '96%', backgroundColor: theme.primaryButton }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text }]}>Your ideal match</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tell us what matters most to you.
          </Text>

          {/* 1. Age Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Age</Text>
            <Text style={[styles.preferredAgeLabel, { color: theme.textSecondary }]}>
              Preferred Age: {maxAge}
            </Text>

            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLimitText, { color: theme.text }]}>18</Text>
              <View
                style={[styles.sliderTrackWrapper, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                {...panResponder.panHandlers}
              >
                <View style={[styles.sliderTrackBg, { backgroundColor: isDark ? '#333333' : '#E0E0E0' }]}>
                  <View
                    style={[
                      styles.sliderTrackFill,
                      {
                        width: `${sliderProgress * 100}%`,
                        backgroundColor: theme.primaryButton,
                      },
                    ]}
                  />
                </View>
                {/* Slider Thumb Handle */}
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${sliderProgress * 100}%`,
                      backgroundColor: theme.primaryButton,
                      borderColor: isDark ? '#000000' : '#FFFFFF',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.sliderLimitText, { color: theme.text }]}>55</Text>
            </View>
          </View>

          {/* 2. Distance Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 18 }]}>Distance</Text>
            <View style={styles.distanceList}>
              {distanceOptions.map((dist) => {
                const isSelected = selectedDistance === dist;
                return (
                  <Pressable
                    key={dist}
                    onPress={() => setSelectedDistance(dist)}
                    style={[styles.radioContainer, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                  >
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
                    <Text style={[styles.optionText, { color: theme.text }]}>{dist}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3. Partner Religion / Community Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 14 }]}>
              Partner Religion / Community
            </Text>
            <Pressable
              onPress={() => setReligionModalVisible(true)}
              style={[
                styles.selectBox,
                {
                  borderColor: selectedReligion ? theme.primaryButton : isDark ? '#3E4044' : '#B9B9B9',
                  backgroundColor: isDark ? theme.backgroundElement : '#FFFFFF',
                },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.selectBoxText,
                  {
                    color: selectedReligion ? theme.text : theme.textSecondary,
                    fontFamily: selectedReligion ? 'DM_Sans_500Medium' : 'DM_Sans_400Regular',
                  },
                ]}
              >
                {selectedReligion || 'Select Religion / Community'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={selectedReligion ? theme.primaryButton : theme.textSecondary}
              />
            </Pressable>
          </View>

          {/* 4. Partner Interests Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
              Partner Interests
            </Text>
            <View style={styles.chipsContainer}>
              {interestsList.map((interest) => {
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
            style={[
              styles.nextButton,
              { backgroundColor: theme.primaryButton },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>

      {/* Religion Selection Modal Sheet */}
      <Modal
        visible={religionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReligionModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setReligionModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: isDark ? '#1F2022' : '#FFFFFF',
                    paddingBottom: Math.max(insets.bottom, 20),
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Select Partner Religion / Community
                  </Text>
                  <Pressable
                    onPress={() => setReligionModalVisible(false)}
                    hitSlop={10}
                    style={Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}}
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </Pressable>
                </View>

                <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                  {religionOptions.map((item) => {
                    const isSelected = selectedReligion === item;
                    return (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setSelectedReligion(item);
                          setReligionModalVisible(false);
                        }}
                        style={[
                          styles.modalOption,
                          isSelected && { backgroundColor: isDark ? '#2B2D31' : '#E0F7FA' },
                          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            {
                              color: isSelected ? (isDark ? theme.primaryButton : '#007A80') : theme.text,
                              fontFamily: isSelected ? 'DM_Sans_700Bold' : 'DM_Sans_400Regular',
                            },
                          ]}
                        >
                          {item}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={theme.primaryButton} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingBottom: 20,
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
    paddingBottom: 30,
  },
  title: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    alignSelf: 'center',
    maxWidth: 290,
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
  },
  preferredAgeLabel: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  sliderLimitText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  sliderTrackWrapper: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    marginLeft: -11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  distanceList: {
    gap: 18,
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
  selectBox: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  selectBoxText: {
    fontSize: 15,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  chipIcon: {
    marginLeft: 6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#888888',
  },
  modalTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 18,
  },
  modalList: {
    marginTop: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  modalOptionText: {
    fontSize: 15,
  },
});
