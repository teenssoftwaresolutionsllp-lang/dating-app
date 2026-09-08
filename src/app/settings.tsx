import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  SubscriptionIcon,
  TermsDocIcon,
  SafetyBadgeIcon,
  TrustRosetteIcon,
} from '@/components/SettingsIcons';

export default function SettingsScreen() {
  const router = useRouter();

  // Dialog States
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tab)/me');
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    Alert.alert('Account Deactivated', 'Your account has been scheduled for deletion.', [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Scrollable Settings List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Subscription */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <SubscriptionIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>Subscription</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 2. Notifications */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push('/notification')}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 3. Terms of Use */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push('/terms-of-use')}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <TermsDocIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>Terms of Use</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 4. Terms and Security */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push('/terms-and-security')}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <TermsDocIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>Terms and Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 5. Safety Guidelines */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => router.push('/safety-guidelines')}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <SafetyBadgeIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>Safety Guidelines</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 6. Trust Compatibilities */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => setShowTrustModal(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <TrustRosetteIcon size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>Trust Compatibilities</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 7. Deactivate and Delete Account */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => setShowDeleteModal(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <Text style={[styles.cardText, styles.deleteCardText]}>
                Deactivate and Delete Account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>

          {/* 8. Logout */}
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.75}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-out-outline" size={24} color="#0D7A74" />
              </View>
              <Text style={styles.cardText}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0D7A74" />
          </TouchableOpacity>
        </ScrollView>

        {/* Subscription Modal */}
        <Modal
          visible={showSubscriptionModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSubscriptionModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={[styles.modalIconCircle, { backgroundColor: '#E6FFFA' }]}>
                <SubscriptionIcon size={32} color="#0D7A74" />
              </View>
              <Text style={styles.modalTitle}>Premium Subscription</Text>
              <Text style={styles.modalDesc}>
                Unlock unlimited likes, see who viewed your profile, advanced compatibility filters, and boost your profile!
              </Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Active Plan: Free Member</Text>
              </View>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setShowSubscriptionModal(false);
                  Alert.alert('Subscription', 'Upgrade flow opened!');
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>Upgrade to Gold</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowSubscriptionModal(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>Close</Text>
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
              <View style={[styles.modalIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <TrustRosetteIcon size={32} color="#0284C7" />
              </View>
              <Text style={styles.modalTitle}>Trust & Compatibility</Text>
              <Text style={styles.modalDesc}>
                Our smart matchmaking algorithm analyzes your shared interests, values, and lifestyle preferences to calculate authentic compatibility scores.
              </Text>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setShowTrustModal(false)}
              >
                <Text style={styles.modalPrimaryBtnText}>Got it</Text>
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
              <View style={[styles.modalIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash" size={30} color="#EF4444" />
              </View>
              <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Delete Account?</Text>
              <Text style={styles.modalDesc}>
                Are you sure you want to deactivate or permanently delete your account? All your matches and messages will be removed.
              </Text>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalPrimaryBtnText}>Delete Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
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
              <View style={[styles.modalIconCircle, { backgroundColor: '#E6FFFA' }]}>
                <Ionicons name="log-out-outline" size={30} color="#0D7A74" />
              </View>
              <Text style={styles.modalTitle}>Log Out</Text>
              <Text style={styles.modalDesc}>
                Are you sure you want to log out of your account?
              </Text>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleLogout}
              >
                <Text style={styles.modalPrimaryBtnText}>Log Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
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
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFCFC',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EFF2F5',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
    color: '#0F172A',
  },
  deleteCardText: {
    color: '#EF4444',
  },
  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  planBadge: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 18,
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
    color: '#0D7A74',
  },
  modalPrimaryBtn: {
    width: '100%',
    backgroundColor: '#0D7A74',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
  modalSecondaryBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
  },
});
