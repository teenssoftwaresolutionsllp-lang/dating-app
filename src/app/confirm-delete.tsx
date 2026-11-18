import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { WarningTriangleGraphic } from "@/components/SettingsIcons";
import { authStorage } from "@/services/authStorage";
import {
  confirmAccountDeletion,
  requestAccountDeletionOtp,
} from "@/services/accountApi";

const isOtpCooldownError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const apiError = error as Error & { data?: { code?: string } };
  return (
    apiError.data?.code === "OTP_COOLDOWN_ACTIVE" ||
    error.message.includes(
      "Please wait before requesting another account deletion code",
    )
  );
};

export default function ConfirmDeleteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isRequesting, setIsRequesting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const initialOtpRequest = useRef<ReturnType<
    typeof requestAccountDeletionOtp
  > | null>(null);

  useEffect(() => {
    let isActive = true;
    const request = initialOtpRequest.current ?? requestAccountDeletionOtp();
    initialOtpRequest.current = request;

    void request
      .then((result) => {
        if (!isActive) return;
        setResendSeconds(result?.resendCooldown ?? 30);
      })
      .catch((requestError: unknown) => {
        if (!isActive) return;
        if (isOtpCooldownError(requestError)) {
          setError(t("confirmDelete.cooldownError"));
          setResendSeconds(30);
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("confirmDelete.generalError"),
        );
      })
      .finally(() => {
        if (isActive) setIsRequesting(false);
      });

    return () => {
      isActive = false;
    };
  }, [t]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/delete-account");
    }
  };

  const handleConfirmDelete = async () => {
    if (isSubmitting) return;
    if (!/^\d{4}$/.test(otp)) {
      setError(t("confirmDelete.codeRequiredError"));
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await confirmAccountDeletion(otp);
      await authStorage.clearAuth();
      router.replace("/login");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("confirmDelete.generalError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || isSubmitting || isResending) return;
    setIsResending(true);
    setError("");
    try {
      const result = await requestAccountDeletionOtp();
      setOtp("");
      setResendSeconds(result?.resendCooldown ?? 30);
    } catch (requestError) {
      if (isOtpCooldownError(requestError)) {
        setError(t("confirmDelete.cooldownError"));
        setResendSeconds(30);
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("confirmDelete.generalError"),
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#C4C4C4" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0D7A74" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("confirmDelete.title")}</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Dimmed Overlay Area */}
        <View style={styles.dimmedOverlay}>
          {/* Dialog Card */}
          <View style={styles.dialogCard}>
            {/* Warning Triangle Icon */}
            <View style={styles.iconContainer}>
              <WarningTriangleGraphic size={68} color="#FF0000" />
            </View>

            {/* Title */}
            <Text style={styles.dialogTitle}>{t("confirmDelete.areYouSure")}</Text>

            {/* Subtitle */}
            <Text style={styles.dialogDesc}>
              {t("confirmDelete.dialogDesc")}
            </Text>

            <TextInput
              accessibilityLabel="Account deletion code"
              style={styles.otpInput}
              value={otp}
              onChangeText={(value) => {
                setOtp(value.replace(/\D/g, "").slice(0, 4));
                if (error) setError("");
              }}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={4}
              placeholder={t("confirmDelete.codePlaceholder")}
              placeholderTextColor="#9CA3AF"
              textAlign="center"
            />
            {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              onPress={handleResend}
              disabled={
                resendSeconds > 0 || isRequesting || isSubmitting || isResending
              }
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.resendText,
                  resendSeconds > 0 && styles.disabledText,
                ]}
              >
                {isRequesting || isResending
                  ? t("confirmDelete.sendingCode")
                  : resendSeconds > 0
                    ? t("confirmDelete.resendIn", { seconds: resendSeconds })
                    : t("confirmDelete.resendCode")}
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.btnStack}>
              <TouchableOpacity
                style={styles.deleteBtn}
                activeOpacity={0.85}
                onPress={handleConfirmDelete}
                disabled={isRequesting || isSubmitting || isResending}
              >
                <Text style={styles.deleteBtnText}>
                  {isRequesting
                    ? t("confirmDelete.sendingCode")
                    : isSubmitting
                      ? t("confirmDelete.deletingBtn")
                      : t("confirmDelete.confirmDeleteBtn")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.7}
                onPress={handleBack}
              >
                <Text style={styles.cancelBtnText}>{t("confirmDelete.cancelBtn")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#C4C4C4",
    paddingTop: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#C4C4C4",
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#C4C4C4",
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
    color: "#0F172A",
    textAlign: "center",
  },
  headerRightSpacer: {
    width: 32,
  },
  dimmedOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  dialogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  dialogDesc: {
    fontSize: 12,
    fontFamily: "DM_Sans_400Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  otpInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "DM_Sans_700Bold",
    color: "#0F172A",
  },
  errorText: {
    width: "100%",
    color: "#B91C1C",
    fontSize: 12,
    fontFamily: "DM_Sans_500Medium",
    textAlign: "center",
    marginBottom: 8,
  },
  resendText: {
    color: "#0D7A74",
    fontSize: 13,
    fontFamily: "DM_Sans_700Bold",
    paddingVertical: 8,
    marginBottom: 12,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  btnStack: {
    width: "100%",
    gap: 12,
  },
  deleteBtn: {
    backgroundColor: "#FF0000",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 15,
    fontFamily: "DM_Sans_700Bold",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelBtn: {
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "DM_Sans_700Bold",
    fontWeight: "700",
    color: "#0F172A",
  },
});
