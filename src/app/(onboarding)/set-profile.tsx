import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import { Image } from 'expo-image';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { Image } from 'expo-image';
import {
  getOnboardingProfileDraft,
  updateOnboardingProfileDraft,
} from '@/constants/userProfile';
import { updateCurrentProfile } from '@/services/profileApi';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';

export default function SetProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const initialDraft = getOnboardingProfileDraft();
  const initialGender =
    initialDraft.gender?.toLowerCase() === 'female'
      ? 'Female'
      : initialDraft.gender?.toLowerCase() === 'male'
        ? 'Male'
        : null;
  const [userName, setUserName] = useState(initialDraft.name ?? '');
  const [gender, setGender] = useState<'Female' | 'Male' | null>(initialGender);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const [bioError, setBioError] = useState(false);

  const [bio, setBio] = useState(initialDraft.about ?? '');
  const [isBioFocused, setIsBioFocused] = useState(false);
  const isBioFocusedRef = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardHeightRef = useRef(0);

  const isComplete = Boolean(userName.trim() && gender && bio.trim());

  const scrollViewRef = useRef<ScrollView>(null);
  const bioSectionYRef = useRef<number | null>(null);
  const savedScrollYRef = useRef(0);
  const currentScrollYRef = useRef(0);
  const userNameShakeAnim = useRef(new Animated.Value(0)).current;
  const genderShakeAnim = useRef(new Animated.Value(0)).current;
  const bioShakeAnim = useRef(new Animated.Value(0)).current;

  const scrollToBio = () => {
    const doScroll = () => {
      if (bioSectionYRef.current !== null && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: Math.max(0, bioSectionYRef.current - 16),
          animated: true,
        });
      } else {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    };

    doScroll();
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 100);
    setTimeout(doScroll, 250);
  };

  const restoreOriginalPosition = () => {
    const doRestore = () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: Math.max(0, savedScrollYRef.current),
          animated: true,
        });
      }
    };

    doRestore();
    requestAnimationFrame(doRestore);
    setTimeout(doRestore, 100);
  };

  const handleBioFocus = () => {
    if (!isBioFocusedRef.current && keyboardHeightRef.current === 0) {
      savedScrollYRef.current = currentScrollYRef.current;
    }
    setIsBioFocused(true);
    isBioFocusedRef.current = true;
    scrollToBio();
  };

  const handleBioBlur = () => {
    setIsBioFocused(false);
    isBioFocusedRef.current = false;
    if (keyboardHeightRef.current === 0) {
      restoreOriginalPosition();
    }
  };

  useEffect(() => {
    const onKeyboardShow = (e: any) => {
      const height = e?.endCoordinates?.height || 0;
      keyboardHeightRef.current = height;
      setKeyboardHeight(height);
      if (isBioFocusedRef.current) {
        scrollToBio();
      }
    };

    const onKeyboardHide = () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
      restoreOriginalPosition();
    };

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onKeyboardShow
    );
    const didShowSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardDidShow', onKeyboardShow)
        : null;
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onKeyboardHide
    );

    return () => {
      showSub.remove();
      didShowSub?.remove();
      hideSub.remove();
    };
  }, []);

  const triggerUserNameShake = () => {
    userNameShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(userNameShakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(userNameShakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(userNameShakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(userNameShakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(userNameShakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(userNameShakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(userNameShakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerGenderShake = () => {
    genderShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(genderShakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(genderShakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(genderShakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(genderShakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(genderShakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(genderShakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(genderShakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerBioShake = () => {
    bioShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(bioShakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(bioShakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(bioShakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(bioShakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(bioShakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(bioShakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(bioShakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = async () => {
    if (!userName.trim()) {
      setUserNameError(true);
      setGenderError(false);
      setBioError(false);
      triggerUserNameShake();
      return;
    }

    if (!gender) {
      setGenderError(true);
      setUserNameError(false);
      setBioError(false);
      triggerGenderShake();
      return;
    }

    if (!bio.trim()) {
      setBioError(true);
      setUserNameError(false);
      setGenderError(false);
      triggerBioShake();
      return;
    }

    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedGender = gender.toLowerCase();
      updateOnboardingProfileDraft({
        name: userName.trim(),
        gender: selectedGender,
        about: bio.trim(),
      });
      await updateCurrentProfile({
        name: userName.trim(),
        gender: selectedGender,
        bio: bio.trim() || undefined,
      }).catch((e: unknown) => {
        console.warn('Backend sync warning on profile update:', e);
      });
      router.push({
        pathname: '/(onboarding)/birthday',
        params: { name: userName.trim(), gender: selectedGender },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.05} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            ref={scrollViewRef}
            onScroll={(e) => {
              currentScrollYRef.current = e.nativeEvent.contentOffset.y;
              if (!isBioFocusedRef.current && keyboardHeightRef.current === 0) {
                savedScrollYRef.current = e.nativeEvent.contentOffset.y;
              }
            }}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.scrollContent,
              (isBioFocused || keyboardHeight > 0) && {
                paddingBottom: Math.max(keyboardHeight + 60, 320),
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Title */}
            <Text style={styles.title}>{t('onboarding.steps.setProfile.title')}</Text>

            {/* User Name Section */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>{t('onboarding.steps.setProfile.nameLabel')}</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  userNameError && styles.inputContainerError,
                ]}
              >
                <TextInput
                  style={[
                    styles.textInput,
                    userNameError && styles.textInputError,
                  ]}
                  value={userName}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\s/g, '');
                    setUserName(cleaned);
                    updateOnboardingProfileDraft({ name: cleaned });
                    if (userNameError && cleaned.length > 0) {
                      setUserNameError(false);
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={t('onboarding.steps.setProfile.namePlaceholder')}
                  placeholderTextColor={userNameError ? '#9CA3AF' : '#9CA3AF'}
                  selectionColor="#00E4E8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
              <Text style={styles.helperText}>
                {t('onboarding.steps.setProfile.nameHelper')}
              </Text>
              {userNameError && (
                <Animated.Text
                  style={[
                    styles.errorMessage,
                    {
                      transform: [{ translateX: userNameShakeAnim }],
                    },
                  ]}
                >
                  {t('onboarding.steps.setProfile.nameError')}
                </Animated.Text>
              )}
            </View>

            {/* You Are Section */}
            <View style={styles.genderSection}>
              <Text style={styles.sectionTitle}>{t('onboarding.steps.setProfile.genderLabel')}</Text>

              <View style={styles.genderCardsRow}>
                {/* Female Card */}
                <TouchableOpacity
                  style={[
                    styles.genderCard,
                    gender === 'Female' && styles.genderCardSelected,
                  ]}
                  onPress={() => {
                    setGender('Female');
                    updateOnboardingProfileDraft({ gender: 'female' });
                    if (genderError) {
                      setGenderError(false);
                    }
                  }}
                  activeOpacity={0.3}
                >
                  <Image
                    source={require('@/assets/images/female-avatar.jpg')}
                    style={styles.genderImage}
                    contentFit="contain"
                  />
                  <Text style={styles.genderLabel}>{t('onboarding.steps.setProfile.female')}</Text>
                </TouchableOpacity>

                {/* Male Card */}
                <TouchableOpacity
                  style={[
                    styles.genderCard,
                    gender === 'Male' && styles.genderCardSelected,
                  ]}
                  onPress={() => {
                    setGender('Male');
                    updateOnboardingProfileDraft({ gender: 'male' });
                    if (genderError) {
                      setGenderError(false);
                    }
                  }}
                  activeOpacity={0.3}
                >
                  <Image
                    source={require('@/assets/images/male-avatar.jpg')}
                    style={styles.genderImage}
                    contentFit="contain"
                  />
                  <Text style={styles.genderLabel}>{t('onboarding.steps.setProfile.male')}</Text>
                </TouchableOpacity>
              </View>
              {genderError && (
                <Animated.Text
                  style={[
                    styles.genderErrorMessage,
                    {
                      transform: [{ translateX: genderShakeAnim }],
                    },
                  ]}
                >
                  {t('onboarding.steps.setProfile.genderError')}
                </Animated.Text>
              )}
            
            </View>

            {/* About Me / Bio Section */}
            <View
              style={[styles.inputSection, { marginTop: 24 }]}
              onLayout={(e) => {
                bioSectionYRef.current = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.bioTitleRow}>
                <Text style={styles.label}>{t('onboarding.steps.setProfile.bioLabel')}</Text>
              </View>
              <View
                style={[
                  styles.bioInputContainer,
                  isBioFocused && styles.inputContainerFocused,
                  bioError && styles.inputContainerError,
                ]}
              >
                <TextInput
                  style={styles.bioTextInput}
                  value={bio}
                  onChangeText={(text) => {
                    setBio(text);
                    updateOnboardingProfileDraft({ about: text });
                    if (bioError && text.trim().length > 0) {
                      setBioError(false);
                    }
                  }}
                  onFocus={handleBioFocus}
                  onBlur={handleBioBlur}
                  placeholder={t('onboarding.steps.setProfile.bioPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  selectionColor="#00E4E8"
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.bioBottomRow}>
                {bioError ? (
                  <Animated.Text
                    style={[
                      styles.bioErrorMessage,
                      {
                        transform: [{ translateX: bioShakeAnim }],
                      },
                    ]}
                  >
                    {t('onboarding.steps.setProfile.bioError')}
                  </Animated.Text>
                ) : <View />}
                <Text style={styles.bioCharCount}>{bio.length} / 300</Text>
              </View>
            </View>

            {/* Warning Banner */}
            <View style={styles.warningRow}>
              <Ionicons name="information-circle-outline" size={18} color="#9CA3AF" />
              <Text style={styles.warningText}>{"Gender can't be changed later"}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Action Button */}
        <OnboardingFooter
          onNext={handleNext}
          disabled={isSubmitting}
          nextButtonStyle={{
            backgroundColor: isComplete
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
    marginBottom: 28,
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: 36,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputContainerFocused: {
    borderColor: '#00E4E8',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    height: '100%',
    width: '100%',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  textInputError: {
    color: '#FF3B30',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  genderSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  genderCardsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
  },
  genderCard: {
    flex: 1,
    maxWidth: 150,
    height: 150,
    // backgroundColor: '#E0FDFD',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderCardSelected: {
    borderColor: '#00E4E8',
    // backgroundColor: '#ccf8fb',
  },
  genderImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 'auto',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  errorMessage: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
  },
  genderErrorMessage: {
    position: 'absolute',
    bottom: -22,
    left: 0,
    right: 0,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
    textAlign: 'center',
  },
  bioTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionalBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  bioInputContainer: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 80,
  },
  bioTextInput: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    minHeight: 60,
  },
  bioCharCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  bioBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    minHeight: 18,
  },
  bioErrorMessage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
