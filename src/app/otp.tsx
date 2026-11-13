import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  LegalFooter,
  PrimaryButton,
  RelationshipArtwork,
} from "@/components/onboarding";
import { useTheme } from "@/hooks/use-theme";
import { resendOtp, verifyOtp } from "@/utils/api";
import { registerForPushNotifications } from "@/services/notificationService";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { t } = useTranslation();
  const { language, applyUserLanguage } = useLanguage();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputs = useRef<(TextInput | null)[]>([]);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme.text.toLowerCase() === "#ffffff";
  const complete = code.every(Boolean);
  const [initialHeight] = useState(() => Dimensions.get("window").height);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const scrollToInput = () => {
    const scrollY = Math.round(initialHeight * 0.28);
    scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
  };

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e?.endCoordinates?.height || 0;
      setKeyboardHeight(height);
      setIsKeyboardVisible(true);
      scrollToInput();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [initialHeight]);

  const handleInputFocus = (index: number) => {
    setFocusedIndex(index);
    requestAnimationFrame(scrollToInput);
    setTimeout(scrollToInput, 100);
  };

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
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 3,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [seconds]);

  const updateCode = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");
    if (error) setError("");

    if (!digits) {
      setCode((current) =>
        current.map((digit, position) => (position === index ? "" : digit)),
      );
      return;
    }

    // Full OTP auto-filled or pasted into any box
    if (digits.length >= OTP_LENGTH) {
      const full = digits.slice(0, OTP_LENGTH).split("");
      setCode(full);
      Keyboard.dismiss();
      return;
    }

    const next = [...code];

    // Replacing a digit in an already filled box
    if (digits.length > 1 && code[index]) {
      const currentVal = code[index];
      let newChar = digits.replace(currentVal, '').slice(-1);
      if (!newChar) {
        newChar = digits.slice(-1);
      }
      next[index] = newChar;
      setCode(next);
      const nextIndex = Math.min(index + 1, OTP_LENGTH - 1);
      inputs.current[nextIndex]?.focus();
      if (next.every(Boolean)) {
        Keyboard.dismiss();
      }
      return;
    }

    // Standard digit entry
    digits
      .slice(0, OTP_LENGTH - index)
      .split("")
      .forEach((digit, offset) => {
        if (index + offset < OTP_LENGTH) {
          next[index + offset] = digit;
        }
      });
    setCode(next);

    if (next.every(Boolean)) {
      Keyboard.dismiss();
    } else {
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key !== "Backspace") return;
    if (code[index]) {
      setCode((current) =>
        current.map((digit, position) => (position === index ? "" : digit)),
      );
    } else if (index > 0) {
      setCode((current) =>
        current.map((digit, position) => (position === index - 1 ? "" : digit)),
      );
      inputs.current[index - 1]?.focus();
    }
  };

  const resend = async () => {
    if (seconds > 0) return;
    setCode(Array(OTP_LENGTH).fill(""));
    setSeconds(RESEND_SECONDS);
    setError("");
    requestAnimationFrame(() => inputs.current[0]?.focus());

    const digits = phone ? phone.replace(/\D/g, "") : "";
    if (!digits) {
      setError(t("auth.otp.missingPhone"));
      triggerShake();
      return;
    }

    try {
      await resendOtp(digits, "+91");
    } catch (err: any) {
      setError(err?.message || t("auth.otp.resendFailed"));
      triggerShake();
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/login");
  };

  const handleVerify = async () => {
    if (isVerifying) return;
    if (!complete) {
      setError(t("auth.otp.invalidOtp"));
      triggerShake();
      return;
    }
    setError("");
    setIsVerifying(true);

    const digits = phone ? phone.replace(/\D/g, "") : "";
    const enteredOtp = code.join("");

    try {
      const response = await verifyOtp(digits, enteredOtp, "+91");
      void registerForPushNotifications();
      if (response.data?.user?.preferredLanguage) {
        await applyUserLanguage(response.data.user.preferredLanguage);
      }
      router.replace(
        response.data.isNewUser
          ? "/(onboarding)/set-profile"
          : "/(tab)/matches",
      );
    } catch (err: any) {
      setError(err?.message || t("auth.otp.invalidOtp"));
      triggerShake();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={t("common.goBack")}
        hitSlop={8}
        style={[
          styles.backButton,
          { top: Math.max(insets.top, 16) + 4, left: 16 },
        ]}
      >
        <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardVisible && { paddingBottom: Math.max(keyboardHeight, 160) },
          ]}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isKeyboardVisible || Platform.OS === "web"}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.responsiveWrapper, { minHeight: initialHeight }]}>
            <RelationshipArtwork variant="otp" />

            <SafeAreaView
              style={styles.contentSafeArea}
              edges={["bottom", "left", "right"]}
            >
              <View style={styles.content}>
                <View style={styles.formTopSection}>
                  <View style={styles.headingRow}>
                    <Text style={[styles.heading, { color: theme.text }]}>
                      {t("auth.otp.heading")}
                    </Text>
                    <Pressable
                      onPress={resend}
                      disabled={seconds > 0}
                      accessibilityRole="button"
                      accessibilityLabel={t("auth.otp.resendOtp")}
                      style={seconds === 0 ? styles.webPointer : undefined}
                    >
                      <Text
                        style={[
                          styles.resend,
                          { color: isDark ? "#538DFF" : "#1769FF" },
                          seconds > 0 && styles.disabled,
                        ]}
                      >
                        {seconds > 0
                          ? t("auth.otp.resendIn", { seconds: String(seconds).padStart(2, "0") })
                          : t("auth.otp.resendOtp")}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.otpRow}>
                    {code.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(input) => {
                          inputs.current[index] = input;
                        }}
                        value={digit}
                        onChangeText={(value) => updateCode(value, index)}
                        onKeyPress={(event) => handleKeyPress(event, index)}
                        onFocus={() => handleInputFocus(index)}
                        onBlur={() => setFocusedIndex(null)}
                        selectionColor="#00E4E8"
                        cursorColor="#00E4E8"
                        keyboardType="number-pad"
                        inputMode="numeric"
                        textContentType="oneTimeCode"
                        autoComplete="sms-otp"
                        maxLength={OTP_LENGTH}
                        selectTextOnFocus
                        autoCorrect={false}
                        allowFontScaling={false}
                        style={[
                          styles.otpInput,
                          {
                            color: theme.text,
                            borderColor: error
                              ? "#FF3B30"
                              : focusedIndex === index
                                ? "#00E4E8"
                                : theme.border,
                            backgroundColor: isDark
                              ? theme.backgroundElement
                              : "#FFFFFF",
                          },
                          Platform.OS === "web" &&
                            ({ outlineStyle: "none" } as any),
                        ]}
                        textAlign="center"
                        accessibilityLabel={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </View>

                  <View style={styles.sentContainer}>
                    <View style={styles.sentRow}>
                      <Text style={[styles.sent, { color: theme.textSecondary }]}>
                        {t("auth.otp.sentTo", { phone: phone || "00000 00000" })}
                      </Text>
                      <Pressable
                        onPress={handleBack}
                        accessibilityRole="button"
                        accessibilityLabel="Edit phone number"
                        hitSlop={8}
                        style={[
                          styles.editButton,
                          Platform.OS === "web" && ({ cursor: "pointer" } as any),
                        ]}
                      >
                        <Ionicons
                          name="pencil"
                          size={14}
                          color={theme.textSecondary}
                        />
                      </Pressable>
                    </View>

                    {!!error && (
                      <Animated.View
                        style={[
                          styles.errorWrapper,
                          { transform: [{ translateX: shakeAnim }] },
                        ]}
                      >
                        <Text style={styles.errorText}>{error}</Text>
                      </Animated.View>
                    )}
                  </View>
                </View>

                <View style={styles.bottomButtonSection}>
                  <PrimaryButton
                    onPress={handleVerify}
                    style={[
                      styles.verifyButton,
                      {
                        backgroundColor: complete
                          ? theme.primaryButton
                          : "#BDFFF9",
                      },
                    ]}
                  >
                    {t("auth.otp.verifyButton")}
                  </PrimaryButton>
                  <LegalFooter />
                </View>
              </View>
            </SafeAreaView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: "100%" },
  keyboardContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  responsiveWrapper: {
    width: "100%",
    maxWidth: 480,
    flex: 1,
    justifyContent: "space-between",
  },
  backButton: {
    position: "absolute",
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  contentSafeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  formTopSection: {
    width: "100%",
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 14,
  },
  resend: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 12,
  },
  disabled: {
    opacity: 0.65,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 26,
  },
  webPointer:
    Platform.OS === "web" ? ({ cursor: "pointer" } as any) : undefined,
  otpInput: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    fontFamily: "DM_Sans_500Medium",
    fontSize: 20,
    textAlign: "center",
    padding: 0,
    paddingVertical: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  sentContainer: {
    width: "100%",
    marginTop: 16,
    position: "relative",
  },
  sentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  sent: {
    flex: 1,
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
  },
  editButton: {
    padding: 4,
    marginLeft: 2,
  },
  errorWrapper: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
  },
  errorText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 6,
    marginLeft: 2,
  },
  bottomButtonSection: {
    width: "100%",
    paddingBottom: 8,
  },
  verifyButton: {
    marginBottom: 16,
  },
});
