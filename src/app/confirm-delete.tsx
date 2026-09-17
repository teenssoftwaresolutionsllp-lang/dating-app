import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WarningTriangleGraphic } from '@/components/SettingsIcons';
import { clearUserAuth } from '@/utils/authPersistence';

export default function ConfirmDeleteScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/delete-account');
    }
  };

  const handleConfirmDelete = async () => {
    await clearUserAuth();
    Alert.alert(
      'Account Deleted',
      'Your account and all associated data have been permanently deleted.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Confirm Delete</Text>
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
            <Text style={styles.dialogTitle}>Are you sure? ?</Text>

            {/* Subtitle */}
            <Text style={styles.dialogDesc}>
              This will permanently delete your account and all your data. This action cannot be undone.
            </Text>

            {/* Action Buttons */}
            <View style={styles.btnStack}>
              <TouchableOpacity
                style={styles.deleteBtn}
                activeOpacity={0.85}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.7}
                onPress={handleBack}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
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
    backgroundColor: '#C4C4C4',
    paddingTop: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#C4C4C4',
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
  dimmedOverlay: {
    flex: 1,
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
  iconContainer: {
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  deleteBtn: {
    backgroundColor: '#FF0000',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 15,
    fontFamily: 'DM_Sans_700Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'DM_Sans_700Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
});
