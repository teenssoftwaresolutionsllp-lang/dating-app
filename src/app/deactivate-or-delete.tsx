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
import { DeactivateShieldIcon } from '@/components/SettingsIcons';

export default function DeactivateOrDeleteScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/settings');
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
          <Text style={styles.headerTitle}>Deactivate or Delete</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Pink Banner */}
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerText}>
              We're sorry to see you go. You can choose to deactivate your account temporarily or delete it permanently.
            </Text>
          </View>

          {/* Cards */}
          <View style={styles.cardsContainer}>
            {/* 1. Deactivate Account */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => router.push('/deactivate-account')}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <DeactivateShieldIcon size={24} color="#14B8A6" />
                </View>
                <View style={styles.cardTextWrapper}>
                  <Text style={styles.cardTitle}>Deactivate Account</Text>
                  <Text style={styles.cardDesc}>
                    Take a break from the app and hide your profile. You can reactivate your account anytime.
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#0D7A74" style={styles.chevron} />
            </TouchableOpacity>

            {/* 2. Delete Account */}
            <TouchableOpacity
              style={[styles.card, styles.deleteCard]}
              activeOpacity={0.75}
              onPress={() => router.push('/delete-account')}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconContainer, styles.deleteIconContainer]}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </View>
                <View style={styles.cardTextWrapper}>
                  <Text style={styles.cardTitle}>Delete Account</Text>
                  <Text style={styles.cardDesc}>
                    Permanently delete your account and all your data. This action cannot be undone.
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#0D7A74" style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  },
  bannerContainer: {
    backgroundColor: '#FFE4E6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bannerText: {
    fontSize: 12.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#1F2937',
    lineHeight: 18,
    textAlign: 'left',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  deleteCard: {
    backgroundColor: '#FFF7F7',
    borderColor: '#FEE2E2',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  deleteIconContainer: {
    // Red icon
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },
  chevron: {
    marginLeft: 6,
  },
});
