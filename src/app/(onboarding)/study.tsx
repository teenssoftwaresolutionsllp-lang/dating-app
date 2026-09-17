import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { updateStoredUserProfile } from '@/constants/userProfile';

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
      'Other',
    ],
    'Others': [
      'ITI / Vocational',
      'Certification / Professional Course',
      'Other',
    ],
  };

  const currentQualification = qualification || 'Bachelors';
  const options = studyOptionsMap[currentQualification] || studyOptionsMap['Bachelors'];

  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
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

  const scrollViewRef = useRef<ScrollView>(null);
  const otherInputRef = useRef<TextInput>(null);
  const otherInputContainerRef = useRef<View>(null);
  const scrollYRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const keyboardTopRef = useRef<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const isOtherSelected = selected === 'Other' || (selected ? selected.endsWith('Other') : false);
  const isFormValid = Boolean(
    selected && (!isOtherSelected || otherText.trim().length > 0)
  );

  const scrollInputIntoView = (currentKeyboardHeight?: number, currentKeyboardTop?: number) => {
    const kh = currentKeyboardHeight ?? keyboardHeightRef.current;
    const kt = currentKeyboardTop ?? keyboardTopRef.current;

    if (!otherInputContainerRef.current || !scrollViewRef.current) return;

    otherInputContainerRef.current.measureInWindow((x, y, width, height) => {
      if (y === undefined || height === undefined || isNaN(y) || isNaN(height)) return;

      const screenHeight = Dimensions.get('window').height;
      const keyboardTop = kt ?? (screenHeight - kh);
      const visibleBottom = kh > 0 ? keyboardTop : screenHeight - 75 - insets.bottom;
      const desiredMargin = 20;
      const inputBottom = y + height;
      const deficit = inputBottom - (visibleBottom - desiredMargin);

      if (deficit > 0) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollYRef.current + deficit),
          animated: true,
        });
      }
    });
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      const screenY = e.endCoordinates.screenY;
      keyboardHeightRef.current = height;
      keyboardTopRef.current = screenY;
      setKeyboardHeight(height);

      if (selected === 'Other' || selected?.endsWith('Other')) {
        requestAnimationFrame(() => {
          scrollInputIntoView(height, screenY);
        });
        setTimeout(() => {
          scrollInputIntoView(height, screenY);
        }, 100);
      }
    });

    const didShowSub = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardDidShow', (e) => {
          const height = e.endCoordinates.height;
          const screenY = e.endCoordinates.screenY;
          keyboardHeightRef.current = height;
          keyboardTopRef.current = screenY;
          if (selected === 'Other' || selected?.endsWith('Other')) {
            scrollInputIntoView(height, screenY);
          }
        })
      : null;

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      keyboardTopRef.current = null;
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      didShowSub?.remove();
      hideSub.remove();
    };
  }, [selected]);

  const handleOptionPress = (option: string) => {
    setSelected(option);
    if (error) {
      setError(false);
    }
    const isOther = option === 'Other' || option.endsWith('Other');
    if (isOther) {
      requestAnimationFrame(() => {
        otherInputRef.current?.focus();
        scrollInputIntoView();
      });
      setTimeout(() => {
        otherInputRef.current?.focus();
        scrollInputIntoView();
      }, 50);
    } else {
      setOtherText('');
      Keyboard.dismiss();
    }
  };

  const handleNext = () => {
    if (!selected || (isOtherSelected && otherText.trim().length === 0)) {
      setError(true);
      triggerShake();
      return;
    }
    const finalStudy = isOtherSelected ? otherText.trim() || 'Other' : selected;
    updateStoredUserProfile({
      education: `${currentQualification} - ${finalStudy}`,
    });
    router.push({
      pathname: '/profession',
      params: { qualification: currentQualification, study: finalStudy },
    });
  };
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/qualification');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Progress Bar */}
        <OnboardingHeader progress={0.4} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          style={styles.keyboardView}
        >
          <ScrollView
            ref={scrollViewRef}
            onScroll={(e) => {
              scrollYRef.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.scrollContent,
              isOtherSelected && keyboardHeight > 0 && { paddingBottom: keyboardHeight + 20 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Text style={[styles.title, { color: theme.text }]}>Education & Career</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Add your education and work details to complete your profile.
            </Text>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                What did you study?
              </Text>

              {error && (
                <Animated.Text
                  style={[
                    styles.errorMessage,
                    {
                      transform: [{ translateX: shakeAnim }],
                    },
                  ]}
                >
                  Please choose any one option
                </Animated.Text>
              )}
            </View>

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
                        ref={otherInputContainerRef}
                        onLayout={() => {
                          requestAnimationFrame(() => {
                            otherInputRef.current?.focus();
                            scrollInputIntoView();
                          });
                        }}
                        style={[
                          styles.otherInputContainer,
                          {
                            backgroundColor: isDark ? theme.backgroundElement : '#FFFFFF',
                            borderColor: isInputFocused ? theme.primaryButton : (isDark ? '#374151' : '#D1D5DB'),
                          },
                        ]}
                      >
                        <TextInput
                          ref={otherInputRef}
                          style={[
                            styles.otherTextInput,
                            { color: theme.text },
                          ]}
                          value={otherText}
                          onChangeText={setOtherText}
                          onFocus={() => {
                            setIsInputFocused(true);
                            setTimeout(() => {
                              scrollInputIntoView();
                            }, 100);
                          }}
                          onBlur={() => setIsInputFocused(false)}
                          placeholder="Enter your field of study"
                          placeholderTextColor={theme.textSecondary || '#9CA3AF'}
                          selectionColor={theme.primaryButton}
                          returnKeyType="done"
                          onSubmitEditing={isFormValid ? handleNext : undefined}
                          {...({ outlineStyle: 'none' } as any)}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer Navigation */}
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
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
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
    alignItems: 'center',
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
    width: '100%',
    position: 'relative',
    marginTop: 34,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 16,
  },
  errorMessage: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'DM_Sans_500Medium',
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
