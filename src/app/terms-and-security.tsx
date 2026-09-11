import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SubscriptionIcon } from '@/components/SettingsIcons';

interface SecurityItem {
  id: string;
  title: string;
  subtitle: string;
  details: string;
}

const SECURITY_ITEMS: SecurityItem[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use and protect your data',
    details:
      'We respect your privacy. We collect essential information such as your name, date of birth, preferences, and verified photos to provide personalized matchmaking services. We never sell your personal data to third parties.',
  },
  {
    id: 'dataSecurity',
    title: 'Data Security',
    subtitle: 'Our Security practices and measures',
    details:
      'All data transmitted is encrypted using standard TLS/SSL protocols. Photos and sensitive profile data are securely stored in encrypted cloud storage with multi-layered access controls.',
  },
  {
    id: 'accountSecurity',
    title: 'Account Security',
    subtitle: 'Tips to keep your account safe',
    details:
      'Enable two-factor authentication via SMS OTP. Never share your OTP codes or passwords with anyone. Beware of phishing links or requests for monetary transfers.',
  },
  {
    id: 'blockedUsers',
    title: 'Blocked Users',
    subtitle: 'Manage users you have blocked',
    details:
      'You currently have 0 blocked users. When you block a user, they will no longer be able to see your profile, send messages, or appear in your matches.',
  },
  {
    id: 'reportProblem',
    title: 'Report a Problem',
    subtitle: 'Report issues or inappropriate behavior',
    details:
      'If you experience technical issues, fake profiles, harassment, or inappropriate behavior, you can report them directly to our 24/7 moderation team.',
  },
  {
    id: 'dataDownload',
    title: 'Data Download',
    subtitle: 'Request a copy of your data',
    details:
      'Under data protection guidelines, you can request an archive containing all your profile info, chat logs, and preferences. An export link will be sent to your registered email.',
  },
];

export default function TermsAndSecurityScreen() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState<SecurityItem | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/settings');
    }
  };

  const handleAction = (item: SecurityItem) => {
    if (item.id === 'dataDownload') {
      Alert.alert(
        'Request Data Archive',
        'Would you like us to generate and email your personal data archive?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Request',
            onPress: () =>
              Alert.alert('Request Submitted', 'You will receive a download link within 24 hours.'),
          },
        ]
      );
    } else {
      setActiveItem(item);
    }
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
          <Text style={styles.headerTitle}>Terms and Security</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* List Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {SECURITY_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.cardItem}
              activeOpacity={0.75}
              onPress={() => handleAction(item)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <SubscriptionIcon size={24} color="#0D7A74" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Detail Modal */}
        <Modal
          visible={!!activeItem}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveItem(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={[styles.modalIconCircle, { backgroundColor: '#E6FFFA' }]}>
                <SubscriptionIcon size={30} color="#0D7A74" />
              </View>
              <Text style={styles.modalTitle}>{activeItem?.title}</Text>
              <Text style={styles.modalDesc}>{activeItem?.details}</Text>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setActiveItem(null)}
              >
                <Text style={styles.modalPrimaryBtnText}>Close</Text>
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
    paddingTop: 0,
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
    paddingVertical: 16,
    paddingHorizontal: 18,
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
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
  },
  /* Modal */
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 20,
  },
  modalPrimaryBtn: {
    width: '100%',
    backgroundColor: '#0D7A74',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
});
