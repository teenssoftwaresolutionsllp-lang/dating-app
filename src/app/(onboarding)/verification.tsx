import React, { useState, useEffect } from "react";
import {
  Animated,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  setLastActiveRoute,
  setPendingVerificationAction,
  getPendingVerificationAction,
  clearPendingVerificationAction,
} from "@/utils/routePersistence";
import { OnboardingHeader } from "@/components/onboarding-header";
import { OnboardingFooter } from "@/components/onboarding-footer";
import { useTheme } from "@/hooks/use-theme";
import {
  GovernmentIdIcon,
  SelfieScanIcon,
} from "@/components/illustrations/verification-icons";
import {
  submitKyc,
  verifyKycDocumentApi,
  verifySelfieApi,
} from "@/services/profileApi";

export default function VerificationScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedDocType, setSelectedDocType] =
    useState<string>("Aadhaar Card");
  const [govIdUploaded, setGovIdUploaded] = useState(false);
  const [govIdUri, setGovIdUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [govIdMethod, setGovIdMethod] = useState<"upload" | "camera" | null>(
    null,
  );
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [showGovIdModal, setShowGovIdModal] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingGovId, setIsVerifyingGovId] = useState(false);
  const [isVerifyingSelfie, setIsVerifyingSelfie] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isVerificationComplete = Boolean(govIdUploaded && selfieVerified);
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

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

  /**
   * Instantly validates Government ID photo using the backend validation engine.
   * Rejects unrelated photos (bags, nature, cars, solid colors, blurry objects) within seconds.
   */
  const processGovIdImage = async (
    uri: string,
    method: "upload" | "camera",
  ) => {
    setIsVerifyingGovId(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("documentType", selectedDocType);

      if (Platform.OS === "web") {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append("documentPhoto", blob, "gov_id.jpg");
      } else {
        formData.append("documentPhoto", {
          uri,
          name: "gov_id.jpg",
          type: "image/jpeg",
        } as any);
      }

      await verifyKycDocumentApi(formData);

      // Validation succeeded
      setGovIdMethod(method);
      setGovIdUploaded(true);
      setGovIdUri(uri);
      setErrorMessage(null);
    } catch (err: any) {
      setGovIdUploaded(false);
      setGovIdUri(null);
      const msg =
        err?.message ||
        "Unrelated or invalid document photo detected. Please upload a clear photo of your Government ID (Aadhaar, PAN, Passport, or DL).";
      setErrorMessage(msg);
      triggerShake();
    } finally {
      setIsVerifyingGovId(false);
    }
  };

  /**
   * Instantly validates live Selfie photo using the backend face detection engine.
   * Rejects non-face or unrelated photos within seconds.
   */
  const processSelfieImage = async (uri: string) => {
    setIsVerifyingSelfie(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append("selfiePhoto", blob, "selfie.jpg");
      } else {
        formData.append("selfiePhoto", {
          uri,
          name: "selfie.jpg",
          type: "image/jpeg",
        } as any);
      }

      await verifySelfieApi(formData);

      // Validation succeeded
      setSelfieVerified(true);
      setSelfieUri(uri);
      setErrorMessage(null);
    } catch (err: any) {
      setSelfieVerified(false);
      setSelfieUri(null);
      const msg =
        err?.message ||
        "No face detected or unrelated photo. Please take a clear live selfie of your face directly in the camera.";
      setErrorMessage(msg);
      triggerShake();
    } finally {
      setIsVerifyingSelfie(false);
    }
  };

  useEffect(() => {
    setLastActiveRoute("/(onboarding)/verification");

    const checkPendingResult = async () => {
      try {
        if (Platform.OS === "android") {
          const pending = await ImagePicker.getPendingResultAsync();
          const pendingAction = await getPendingVerificationAction();

          if (
            pending &&
            !("code" in pending) &&
            !pending.canceled &&
            pending.assets &&
            pending.assets.length > 0
          ) {
            const asset = pending.assets[0];
            if (pendingAction === "govId_upload") {
              processGovIdImage(asset.uri, "upload");
            } else if (pendingAction === "govId_camera") {
              processGovIdImage(asset.uri, "camera");
            } else if (pendingAction === "selfie") {
              processSelfieImage(asset.uri);
            }
          }
          await clearPendingVerificationAction();
        }
      } catch {
        // Ignore pending result errors
      }
    };

    checkPendingResult();
  }, []);

  const openPhotoPicker = async (callback: (uri?: string) => void) => {
    setErrorMessage(null);
    // Web
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");

      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp,image/jpg";
      input.style.position = "fixed";
      input.style.top = "-9999px";
      input.style.left = "-9999px";

      document.body.appendChild(input);

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];

        // Only update when user actually selected an image
        if (file) {
          const uri = URL.createObjectURL(file);
          callback(uri);
        }

        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };

      input.click();
      return;
    }

    // Native
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setErrorMessage(
          "Media library permission is required to select document",
        );
        triggerShake();
        await clearPendingVerificationAction();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        await clearPendingVerificationAction();
        return;
      }

      callback(result.assets[0].uri);
      await clearPendingVerificationAction();
    } catch {
      await clearPendingVerificationAction();
      return;
    }
  };

  const openCameraPicker = async (
    callback: (uri?: string) => void,
    isFrontCamera = false,
  ) => {
    setErrorMessage(null);
    // Web
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");

      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp,image/jpg";
      input.setAttribute("capture", isFrontCamera ? "user" : "environment");
      input.style.position = "fixed";
      input.style.top = "-9999px";
      input.style.left = "-9999px";

      document.body.appendChild(input);

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];

        if (file) {
          const uri = URL.createObjectURL(file);
          callback(uri);
        }

        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };

      input.click();
      return;
    }

    // Native
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setErrorMessage(
          "Camera permission is required to capture verification photo",
        );
        triggerShake();
        await clearPendingVerificationAction();
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        cameraType: isFrontCamera
          ? ImagePicker.CameraType.front
          : ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: isFrontCamera ? [1, 1] : [4, 3],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        await clearPendingVerificationAction();
        return;
      }

      callback(result.assets[0].uri);
      await clearPendingVerificationAction();
    } catch {
      await clearPendingVerificationAction();
      return;
    }
  };

  const handleSelectGovIdPhotos = async () => {
    setShowGovIdModal(false);
    await setPendingVerificationAction("govId_upload");

    openPhotoPicker((uri) => {
      if (uri) {
        processGovIdImage(uri, "upload");
      }
    });
  };

  const handleSelectGovIdCamera = async () => {
    setShowGovIdModal(false);
    await setPendingVerificationAction("govId_camera");

    openCameraPicker((uri) => {
      if (uri) {
        processGovIdImage(uri, "camera");
      }
    }, false);
  };

  const handleSelectSelfieCamera = async () => {
    setShowSelfieModal(false);
    await setPendingVerificationAction("selfie");

    openCameraPicker((uri) => {
      if (uri) {
        processSelfieImage(uri);
      }
    }, true);
  };

  const handleNext = async () => {
    if (!govIdUploaded || !govIdUri) {
      setErrorMessage(
        "Please upload or capture a verified photo of your Government ID.",
      );
      triggerShake();
      return;
    }

    if (!selfieVerified || !selfieUri) {
      setErrorMessage(
        "Please take a verified face selfie with the front camera to confirm identity.",
      );
      triggerShake();
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("documentType", selectedDocType);

      if (Platform.OS === "web") {
        const docRes = await fetch(govIdUri);
        const docBlob = await docRes.blob();
        formData.append("documentPhoto", docBlob, "gov_id.jpg");

        const selfieRes = await fetch(selfieUri);
        const selfieBlob = await selfieRes.blob();
        formData.append("selfiePhoto", selfieBlob, "selfie.jpg");
      } else {
        formData.append("documentPhoto", {
          uri: govIdUri,
          name: "gov_id.jpg",
          type: "image/jpeg",
        } as any);
        formData.append("selfiePhoto", {
          uri: selfieUri,
          name: "selfie.jpg",
          type: "image/jpeg",
        } as any);
      }

      await submitKyc(formData);
      setLastActiveRoute("/(onboarding)/photos");
      router.push("/(onboarding)/photos" as any);
    } catch (err: any) {
      console.warn("KYC submit error:", err);
      const msg =
        err?.message ||
        "Verification failed. Please ensure both document and selfie photos are clear.";
      setErrorMessage(msg);
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setLastActiveRoute("/(onboarding)/income");
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/income");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.6} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title & Subtitle */}
          <Text style={styles.title}>{"Let's verify it's really you"}</Text>

          <Text style={styles.subtitle}>
            One quick check helps keep our community safe and genuine.
          </Text>

          {/* Cards Container */}
          <View style={styles.cardsContainer}>
            {/* Government ID Item */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => setShowGovIdModal(true)}
              activeOpacity={0.7}
              disabled={isVerifyingGovId}
            >
              <View style={styles.iconContainer}>
                <GovernmentIdIcon size={46} color="#6B7280" />
              </View>

              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Government ID</Text>

                <Text style={styles.cardSubtitle}>
                  {isVerifyingGovId
                    ? "Analyzing & verifying ID document..."
                    : govIdUploaded
                      ? govIdMethod === "camera"
                        ? "ID photo verified successfully"
                        : "ID uploaded & verified successfully"
                      : "Upload a valid government-issued ID"}
                </Text>
              </View>

              <View
                style={[
                  styles.actionCircle,
                  govIdUploaded && styles.actionCircleDone,
                ]}
              >
                {isVerifyingGovId ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Ionicons
                    name={govIdUploaded ? "checkmark" : "chevron-forward"}
                    size={18}
                    color={govIdUploaded ? "#FFFFFF" : "#000000"}
                  />
                )}
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Selfie Verification Item */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => setShowSelfieModal(true)}
              activeOpacity={0.7}
              disabled={isVerifyingSelfie}
            >
              <View style={styles.iconContainer}>
                <SelfieScanIcon size={46} color="#6B7280" />
              </View>

              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Selfie Verification</Text>

                <Text style={styles.cardSubtitle}>
                  {isVerifyingSelfie
                    ? "Analyzing face & selfie quality..."
                    : selfieVerified
                      ? "Face confirmed via live camera"
                      : "Take a quick selfie to confirm it's you"}
                </Text>
              </View>

              <View
                style={[
                  styles.actionCircle,
                  selfieVerified && styles.actionCircleDone,
                ]}
              >
                {isVerifyingSelfie ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Ionicons
                    name={selfieVerified ? "checkmark" : "chevron-forward"}
                    size={18}
                    color={selfieVerified ? "#FFFFFF" : "#000000"}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Error Message Display */}
          {errorMessage && (
            <Animated.View
              style={[
                styles.errorContainer,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={18}
                color="#EF4444"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </Animated.View>
          )}

          {/* Security Notice Banner */}
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed" size={16} color="#16A34A" />

            <Text style={styles.securityText}>
              Your information is encrypted, private, and secure.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextText={
            isSubmitting
              ? "Submitting..."
              : isVerifyingGovId || isVerifyingSelfie
                ? "Verifying..."
                : "Next"
          }
          disabled={isSubmitting || isVerifyingGovId || isVerifyingSelfie}
          nextButtonStyle={{
            backgroundColor:
              isVerificationComplete &&
              !isSubmitting &&
              !isVerifyingGovId &&
              !isVerifyingSelfie
                ? theme.primaryButton
                : "#BDFFF9",
          }}
        />
      </View>

      {/* Government ID Modal */}
      <Modal
        visible={showGovIdModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGovIdModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGovIdModal(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalSheetContainer}>
                <View style={styles.grabHandle} />

                <Text style={styles.modalTitle}>Select Government ID</Text>

                <Text style={styles.modalSubtitle}>
                  Choose document type & upload a clear, legible photo
                </Text>

                {/* Document Type Selector Chips */}
                <View style={styles.docTypeRow}>
                  {[
                    "Aadhaar Card",
                    "PAN Card",
                    "Passport",
                    "Driving License",
                  ].map((doc) => (
                    <TouchableOpacity
                      key={doc}
                      style={[
                        styles.docChip,
                        selectedDocType === doc && styles.docChipSelected,
                      ]}
                      onPress={() => setSelectedDocType(doc)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.docChipText,
                          selectedDocType === doc && styles.docChipTextSelected,
                        ]}
                      >
                        {doc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalOptionsList}>
                  {/* Photos Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={handleSelectGovIdPhotos}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons
                        name="images-outline"
                        size={22}
                        color="#0F766E"
                      />
                    </View>

                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>
                        Upload Document Photo
                      </Text>

                      <Text style={styles.modalOptionDesc}>
                        Choose from device photo gallery
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>

                  {/* Camera Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={handleSelectGovIdCamera}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color="#0F766E"
                      />
                    </View>

                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>
                        Take Document Photo
                      </Text>

                      <Text style={styles.modalOptionDesc}>
                        Capture photo with all 4 corners visible
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowGovIdModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Selfie Verification Modal */}
      <Modal
        visible={showSelfieModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSelfieModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSelfieModal(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalSheetContainer}>
                <View style={styles.grabHandle} />

                <Text style={styles.modalTitle}>Selfie Verification</Text>

                <Text style={styles.modalSubtitle}>
                  Take a selfie to confirm your identity
                </Text>

                <View style={styles.modalOptionsList}>
                  {/* Camera Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={handleSelectSelfieCamera}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color="#0F766E"
                      />
                    </View>

                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>Camera</Text>

                      <Text style={styles.modalOptionDesc}>
                        Take a selfie directly with your camera
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowSelfieModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  centerContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "DM_Sans_700Bold",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 18,
    paddingHorizontal: 12,
    fontFamily: "DM_Sans_400Regular",
  },

  cardsContainer: {
    width: "100%",
    marginBottom: 24,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  iconContainer: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardTextContent: {
    flex: 1,
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
    fontFamily: "DM_Sans_700Bold",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    fontFamily: "DM_Sans_400Regular",
  },

  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00E4E8",
    alignItems: "center",
    justifyContent: "center",
  },

  actionCircleDone: {
    backgroundColor: "#00E4E8",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
    width: "100%",
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    marginTop: 8,
  },

  securityText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "500",
    fontFamily: "DM_Sans_500Medium",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  modalSheetContainer: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },

  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    fontFamily: "DM_Sans_700Bold",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
    fontFamily: "DM_Sans_400Regular",
  },

  modalOptionsList: {
    gap: 12,
    marginBottom: 16,
  },

  modalOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  modalOptionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E6FFFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  modalOptionTextWrap: {
    flex: 1,
  },

  modalOptionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    fontFamily: "DM_Sans_700Bold",
  },

  modalOptionDesc: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "DM_Sans_400Regular",
  },

  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "DM_Sans_500Medium",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    width: "100%",
  },

  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#B91C1C",
    fontWeight: "500",
    fontFamily: "DM_Sans_500Medium",
  },

  docTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },

  docChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  docChipSelected: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },

  docChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    fontFamily: "DM_Sans_500Medium",
  },

  docChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
  },
});
