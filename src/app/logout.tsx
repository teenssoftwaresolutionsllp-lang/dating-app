import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LogoutDoorGraphic, LogoutModalIcon } from '@/components/SettingsIcons';
import { clearUserAuth } from '@/utils/authPersistence';
import { logout } from '@/utils/api';

export default function LogoutScreen() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBack = () => {
    if (showConfirm) {
      setShowConfirm(false);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/settings');
    }
  };

  const handleConfirmLogout = async () => {
    setShowConfirm(false);
    try {
      await logout();
    } catch {
      await clearUserAuth();
    }
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.safeArea, showConfirm && styles.safeAreaDimmed]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={showConfirm ? '#C4C4C4' : '#FFFFFF'}
      />
      <View style={[styles.container, showConfirm && styles.containerDimmed]}>
        {/* Header */}
        <View style={[styles.header, showConfirm && styles.headerDimmed]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0D7A74" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Logout</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Center Content (Image 1) */}
        <View style={styles.content}>
          <View style={styles.centerSection}>
            <View style={styles.doorGraphicWrapper}>
              <LogoutDoorGraphic size={72} color="#0D7A74" />
            </View>
            <Text style={styles.mainTitle}>Logout from your account</Text>
            <Text style={styles.subTitle}>
              You will need to login again to access your{'\n'}account
            </Text>
          </View>
        </View>

        {/* Bottom Button (Image 1) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={() => setShowConfirm(true)}
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmation Modal (Image 2) */}
        <Modal
          visible={showConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            {/* Modal Card */}
            <View style={styles.dialogCard}>
              {/* Exit Icon in Circle */}
              <View style={styles.iconCircle}>
                <LogoutModalIcon size={44} color="#0D7A74" />
              </View>

              {/* Title */}
              <Text style={styles.dialogTitle}>Logout ?</Text>

              {/* Description */}
              <Text style={styles.dialogDesc}>
                Are you sure you want to logout from your account
              </Text>

              {/* Buttons Stack */}
              <View style={styles.btnStack}>
                <TouchableOpacity
                  style={styles.dialogLogoutBtn}
                  activeOpacity={0.8}
                  onPress={handleConfirmLogout}
                >
                  <Text style={styles.dialogLogoutBtnText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dialogCancelBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowConfirm(false)}
                >
                  <Text style={styles.dialogCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 0,
  },
  safeAreaDimmed: {
    backgroundColor: '#C4C4C4',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  containerDimmed: {
    backgroundColor: '#C4C4C4',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  headerDimmed: {
    backgroundColor: '#C4C4C4',
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerSection: {
    alignItems: 'center',
    marginTop: -40,
  },
  doorGraphicWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 12.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  logoutBtn: {
    backgroundColor: '#00F5D4',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F5D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutBtnText: {
    fontSize: 16,
    fontFamily: 'DM_Sans_700Bold',
    fontWeight: '700',
    color: '#000000',
  },

  /* Modal / Confirmation Dialog (Image 2) */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogDesc: {
    fontSize: 12,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  btnStack: {
    width: '100%',
    gap: 12,
  },
  dialogLogoutBtn: {
    backgroundColor: '#00F5D4',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F5D4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  dialogLogoutBtnText: {
    fontSize: 15,
    fontFamily: 'DM_Sans_700Bold',
    fontWeight: '700',
    color: '#000000',
  },
  dialogCancelBtn: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelBtnText: {
    fontSize: 15,
    fontFamily: 'DM_Sans_700Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
});
