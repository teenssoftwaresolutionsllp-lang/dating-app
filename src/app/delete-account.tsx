import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DeleteTrashGraphic } from '@/components/SettingsIcons';

const WARNINGS = [
  'Your profile will be deleted',
  'All chats and matches will be lost',
  'Your data will be permanently removed',
  "You won't be able to recover your account",
];

export default function DeleteAccountScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/deactivate-or-delete');
    }
  };

  const handleDeletePress = () => {
    router.push('/confirm-delete');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
          <Text style={styles.headerTitle}>Delete</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Main Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Graphic */}
          <View style={styles.topGraphicWrapper}>
            <View style={styles.iconWrapper}>
              <DeleteTrashGraphic size={72} color="#FF0000" />
            </View>
            <Text style={styles.mainHeading}>Delete your account permanently</Text>
            <Text style={styles.subHeading}>
              This action cannot be undone. All your data will be permanently deleted.
            </Text>
          </View>

          {/* Warning Checklist */}
          <View style={styles.checklistContainer}>
            {WARNINGS.map((item, index) => (
              <View key={index} style={styles.checkItem}>
                <View style={styles.crossCircle}>
                  <Ionicons name="close" size={14} color="#EF4444" />
                </View>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.85}
            onPress={handleDeletePress}
          >
            <Text style={styles.deleteBtnText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  topGraphicWrapper: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 12.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  checklistContainer: {
    gap: 18,
    paddingHorizontal: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  crossCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 13.5,
    fontFamily: 'DM_Sans_500Medium',
    color: '#1F2937',
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  deleteBtn: {
    backgroundColor: '#FF0000',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteBtnText: {
    fontSize: 16,
    fontFamily: 'DM_Sans_700Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
