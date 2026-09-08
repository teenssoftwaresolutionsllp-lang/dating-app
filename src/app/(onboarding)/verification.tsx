import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Platform,
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
  const [govIdMethod, setGovIdMethod] = useState<'upload' | 'camera' | null>(null);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [showGovIdModal, setShowGovIdModal] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);

  const handleSelectGovIdMethod = (method: 'upload' | 'camera') => {
    setGovIdMethod(method);
    setGovIdUploaded(true);
    setShowGovIdModal(false);
  };

  const handleSelectSelfieCamera = () => {
    setSelfieVerified(true);
    setShowSelfieModal(false);
  };

  const handleNext = () => {
    router.push('/(onboarding)/photos' as any);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/income' as any);
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
            >
              <View style={styles.iconContainer}>
                <GovernmentIdIcon size={46} color="#6B7280" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Government ID</Text>
                <Text style={styles.cardSubtitle}>
                  {govIdUploaded
                    ? govIdMethod === 'camera'
                      ? 'ID photo captured successfully'
                      : 'ID uploaded successfully'
                    : 'Upload a valid government-issued ID'}
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
              onPress={() => setShowSelfieModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <SelfieScanIcon size={46} color="#6B7280" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>Selfie Verification</Text>
                <Text style={styles.cardSubtitle}>
                  {selfieVerified ? 'Selfie confirmed via camera' : "Take a quick selfie to confirm it's you"}
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

      {/* Modal / Options Sheet for First Verification (Government ID) */}
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
                <Text style={styles.modalTitle}>Government ID</Text>
                <Text style={styles.modalSubtitle}>Choose an option to verify your ID</Text>

                <View style={styles.modalOptionsList}>
                  {/* Upload Photo Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={() => handleSelectGovIdMethod('upload')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons name="images-outline" size={22} color="#0F766E" />
                    </View>
                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>Upload Photo</Text>
                      <Text style={styles.modalOptionDesc}>Choose a photo from your library</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  {/* Open Camera Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={() => handleSelectGovIdMethod('camera')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons name="camera-outline" size={22} color="#0F766E" />
                    </View>
                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>Open Camera</Text>
                      <Text style={styles.modalOptionDesc}>Take a photo of your ID card</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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

      {/* Modal / Options Sheet for Selfie Verification */}
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
                <Text style={styles.modalSubtitle}>Take a selfie to confirm your identity</Text>

                <View style={styles.modalOptionsList}>
                  {/* Open Camera Option */}
                  <TouchableOpacity
                    style={styles.modalOptionCard}
                    onPress={handleSelectSelfieCamera}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionIconCircle}>
                      <Ionicons name="camera-outline" size={22} color="#0F766E" />
                    </View>
                    <View style={styles.modalOptionTextWrap}>
                      <Text style={styles.modalOptionTitle}>Open Camera</Text>
                      <Text style={styles.modalOptionDesc}>Take a selfie directly with your camera</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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
    fontFamily: 'DM_Sans_700Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 18,
    paddingHorizontal: 12,
    fontFamily: 'DM_Sans_400Regular',
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
    fontFamily: 'DM_Sans_700Bold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    fontFamily: 'DM_Sans_400Regular',
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
    fontFamily: 'DM_Sans_500Medium',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheetContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'DM_Sans_700Bold',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    fontFamily: 'DM_Sans_400Regular',
  },
  modalOptionsList: {
    gap: 12,
    marginBottom: 16,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOptionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalOptionTextWrap: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'DM_Sans_700Bold',
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DM_Sans_400Regular',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'DM_Sans_500Medium',
  },
});
