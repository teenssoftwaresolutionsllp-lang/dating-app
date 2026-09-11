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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { Image } from 'expo-image';
import { updateStoredUserProfile } from '@/constants/userProfile';
import { useTheme } from '@/hooks/use-theme';

export default function SetProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [genderError, setGenderError] = useState(false);

  const isComplete = Boolean(userName.trim() && gender);

  const userNameShakeAnim = useRef(new Animated.Value(0)).current;
  const genderShakeAnim = useRef(new Animated.Value(0)).current;

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

  const handleNext = () => {
    if (!userName.trim()) {
      setUserNameError(true);
      setGenderError(false);
      triggerUserNameShake();
      return;
    }
    if (!gender) {
      setGenderError(true);
      triggerGenderShake();
      return;
    }
    updateStoredUserProfile({ name: userName.trim() });
    router.push('/(onboarding)/birthday' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.05} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Title */}
            <Text style={styles.title}>Set Profile</Text>

            {/* User Name Section */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>User Name</Text>
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
                    if (userNameError && cleaned.length > 0) {
                      setUserNameError(false);
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter user name"
                  placeholderTextColor={userNameError ? '#9CA3AF' : '#9CA3AF'}
                  selectionColor="#00E4E8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
              <Text style={styles.helperText}>
               Letters, numbers & special characters only. No spaces
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
                  Enter User Name
                </Animated.Text>
              )}
            </View>

            {/* You Are Section */}
            <View style={styles.genderSection}>
              <Text style={styles.sectionTitle}>You Are</Text>

              <View style={styles.genderCardsRow}>
                {/* Female Card */}
                <TouchableOpacity
                  style={[
                    styles.genderCard,
                    gender === 'Female' && styles.genderCardSelected,
                  ]}
                  onPress={() => {
                    setGender('Female');
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
                  <Text style={styles.genderLabel}>Female</Text>
                </TouchableOpacity>

                {/* Male Card */}
                <TouchableOpacity
                  style={[
                    styles.genderCard,
                    gender === 'Male' && styles.genderCardSelected,
                  ]}
                  onPress={() => {
                    setGender('Male');
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
                  <Text style={styles.genderLabel}>Male</Text>
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
                  Select your gender
                </Animated.Text>
              )}
              {/* Male Card */}
              <TouchableOpacity
                style={[
                  styles.genderCard,
                  gender === 'Male' && styles.genderCardSelected,
                ]}
                onPress={() => setGender('Male')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('@/assets/images/male-avatar.jpg')}
                  style={styles.genderImage}
                  contentFit="contain"
                />
                <Text style={styles.genderLabel}>Male</Text>
              </TouchableOpacity>
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
    backgroundColor: '#E0FDFD',
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
    width: 80,
    height: 80,
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
});
