import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import {
  GovernmentIdIcon,
  SelfieScanIcon,
} from '@/components/illustrations/verification-icons';

export default function VerificationScreen() {
  const router = useRouter();
  const [govIdUploaded, setGovIdUploaded] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);

  const handleNext = () => {
    router.push('/photos' as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.82} />

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
              onPress={() => setGovIdUploaded(!govIdUploaded)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <GovernmentIdIcon size={46} color="#6B7280" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Government ID</Text>
                <Text style={styles.cardSubtitle}>
                  {govIdUploaded ? 'ID uploaded successfully' : 'Upload a valid government-issued ID'}
                </Text>
              </View>
              <View style={[styles.actionCircle, govIdUploaded && styles.actionCircleDone]}>
                <Ionicons
                  name={govIdUploaded ? 'checkmark' : 'chevron-forward'}
                  size={18}
                  color={govIdUploaded ? '#FFFFFF' : '#000000'}
                />
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Selfie Verification Item */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => setSelfieVerified(!selfieVerified)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <SelfieScanIcon size={46} color="#6B7280" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Selfie Verification</Text>
                <Text style={styles.cardSubtitle}>
                  {selfieVerified ? 'Selfie confirmed' : "Take a quick selfie to confirm it's you"}
                </Text>
              </View>
              <View style={[styles.actionCircle, selfieVerified && styles.actionCircleDone]}>
                <Ionicons
                  name={selfieVerified ? 'checkmark' : 'chevron-forward'}
                  size={18}
                  color={selfieVerified ? '#FFFFFF' : '#000000'}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Security Notice Banner */}
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed" size={16} color="#16A34A" />
            <Text style={styles.securityText}>
              Your information is private and secure.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  cardsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextContent: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00F5D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCircleDone: {
    backgroundColor: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
    width: '100%',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },
});
