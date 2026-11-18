import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import {
  SubscriptionIcon,
  TermsDocIcon,
  SafetyBadgeIcon,
  TrustRosetteIcon,
} from "@/components/SettingsIcons";
import { clearUserAuth } from "@/utils/authPersistence";
import { logout } from "@/utils/api";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  // Dialog States
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)/me");
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch {
      await clearUserAuth();
    }
    router.replace("/login");
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    router.push("/deactivate-or-delete");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Top Header Nav */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0D7A74" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("settings.title")}</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Scrollable Settings List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Change Language */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="language-outline" size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>{t("settings.changeLanguage")}</Text>
            </View>
            <View style={styles.languageBadge}>
              <Text style={styles.languageBadgeText}>
                {language === "te" ? "తెలుగు" : "English"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
            </View>
          </TouchableOpacity>

          {/* 2. Subscription */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <SubscriptionIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>{t("settings.subscription")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 3. Notifications */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push("/notification")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#0D7A74"
                />
              </View>
              <Text style={styles.cardText}>{t("settings.notifications")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 4. Terms of Use */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push("/terms-of-use")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <TermsDocIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>{t("settings.termsOfUse")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 5. Terms and Security */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push("/terms-and-security")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <TermsDocIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>{t("settings.termsAndSecurity")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 6. Safety Guidelines */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push("/safety-guidelines")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <SafetyBadgeIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>{t("settings.safetyGuidelines")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 7. Trust Compatibilities */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push("/trust-compatibility")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <TrustRosetteIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>{t("settings.trustCompatibility")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 8. Deactivate and Delete Account */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push("/deactivate-or-delete")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <Text style={[styles.cardText, styles.deleteCardText]}>
                {t("settings.deactivateDelete")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 9. Logout */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push("/logout")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-out-outline" size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>{t("settings.logout")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>
        </ScrollView>

        {/* Change Language Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View
                style={[styles.modalIconCircle, { backgroundColor: "#E6FFFA" }]}
              >
                <Ionicons name="language" size={30} color="#0D7A74" />
              </View>
              <Text style={styles.modalTitle}>
                {t("settings.modals.language.title")}
              </Text>
              <Text style={styles.modalDesc}>
                {t("settings.modals.language.desc")}
              </Text>

              <TouchableOpacity
                style={[
                  styles.languageOptionBtn,
                  language === "en" && styles.languageOptionActive,
                ]}
                activeOpacity={0.7}
                onPress={async () => {
                  await changeLanguage("en", true);
                  setShowLanguageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    language === "en" && styles.languageOptionTextActive,
                  ]}
                >
                  English
                </Text>
                {language === "en" && (
                  <Ionicons name="checkmark-circle" size={20} color="#0D7A74" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageOptionBtn,
                  language === "te" && styles.languageOptionActive,
                ]}
                activeOpacity={0.7}
                onPress={async () => {
                  await changeLanguage("te", true);
                  setShowLanguageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    language === "te" && styles.languageOptionTextActive,
                  ]}
                >
                  తెలుగు (Telugu)
                </Text>
                {language === "te" && (
                  <Ionicons name="checkmark-circle" size={20} color="#0D7A74" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowLanguageModal(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>
                  {t("settings.modals.language.close")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Subscription Modal */}
        <Modal
          visible={showSubscriptionModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSubscriptionModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View
                style={[styles.modalIconCircle, { backgroundColor: "#E6FFFA" }]}
              >
                <SubscriptionIcon size={32} color="#0D7A74" />
              </View>
              <Text style={styles.modalTitle}>
                {t("settings.modals.subscription.title")}
              </Text>
              <Text style={styles.modalDesc}>
                {t("settings.modals.subscription.desc")}
              </Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>
                  {t("settings.modals.subscription.activePlan")}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setShowSubscriptionModal(false);
                  Alert.alert(
                    t("settings.subscription"),
                    t("settings.modals.subscription.flowOpened")
                  );
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  {t("settings.modals.subscription.upgradeGold")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowSubscriptionModal(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>
                  {t("settings.modals.subscription.close")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Trust Compatibilities Modal */}
        <Modal
          visible={showTrustModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTrustModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View
                style={[styles.modalIconCircle, { backgroundColor: "#E0F2FE" }]}
              >
                <TrustRosetteIcon size={32} color="#0284C7" />
              </View>
              <Text style={styles.modalTitle}>
                {t("settings.modals.trust.title")}
              </Text>
              <Text style={styles.modalDesc}>
                {t("settings.modals.trust.desc")}
              </Text>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setShowTrustModal(false)}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  {t("settings.modals.trust.gotIt")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Deactivate / Delete Account Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View
                style={[styles.modalIconCircle, { backgroundColor: "#FEE2E2" }]}
              >
                <Ionicons name="trash" size={30} color="#EF4444" />
              </View>
              <Text style={[styles.modalTitle, { color: "#EF4444" }]}>
                {t("settings.modals.delete.title")}
              </Text>
              <Text style={styles.modalDesc}>
                {t("settings.modals.delete.desc")}
              </Text>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: "#EF4444" }]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  {t("settings.modals.delete.deleteBtn")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>
                  {t("settings.modals.delete.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Logout Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View
                style={[styles.modalIconCircle, { backgroundColor: "#E6FFFA" }]}
              >
                <Ionicons name="log-out-outline" size={30} color="#0D7A74" />
              </View>
              <Text style={styles.modalTitle}>
                {t("settings.modals.logout.title")}
              </Text>
              <Text style={styles.modalDesc}>
                {t("settings.modals.logout.desc")}
              </Text>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleLogout}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  {t("settings.modals.logout.logoutBtn")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>
                  {t("settings.modals.logout.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFCFC",
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
    backgroundColor: "#FFFFFF",
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#EFF2F5",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,

  },
  iconContainer: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
    color: '#0F172A',
    flex: 1,
    flexShrink: 1,
  },
  deleteCardText: {
    color: "#EF4444",
  },
  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 13.5,
    fontFamily: "DM_Sans_400Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  planBadge: {
    backgroundColor: "#E6FFFA",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 18,
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "DM_Sans_500Medium",
    color: "#0D7A74",
  },
  modalPrimaryBtn: {
    width: "100%",
    backgroundColor: "#0D7A74",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
  },
  modalSecondaryBtn: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSecondaryBtnText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "DM_Sans_500Medium",
  },
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  languageBadgeText: {
    fontSize: 14,
    fontFamily: "DM_Sans_500Medium",
    color: "#0D7A74",
    marginRight: 2,
  },
  languageOptionBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  languageOptionActive: {
    borderColor: "#0D7A74",
    backgroundColor: "#F0FDFA",
  },
  languageOptionText: {
    fontSize: 15,
    fontFamily: "DM_Sans_500Medium",
    color: "#0F172A",
  },
  languageOptionTextActive: {
    color: "#0D7A74",
    fontFamily: "DM_Sans_700Bold",
  },
});
