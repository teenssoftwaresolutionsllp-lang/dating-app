import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';
import {
  getOnboardingProfileDraft,
  updateOnboardingProfileDraft,
} from '@/constants/userProfile';

type PlanType = 'monthly' | 'yearly';

export default function SubscriptionScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // Devices with viewport < 812 (including Samsung with 3-button navigation bar) use compact scaling
  const isCompact = screenHeight < 812;

  const initialDraft = getOnboardingProfileDraft();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    initialDraft.selectedPlan === 'monthly' || initialDraft.selectedPlan === 'yearly'
      ? initialDraft.selectedPlan
      : 'yearly',
  );

  const benefits = [
    {
      id: 'unlimited-likes',
      title: t('onboarding.steps.subscription.benefit1Title'),
      subtitle: t('onboarding.steps.subscription.benefit1Sub'),
    },
    {
      id: 'see-who-liked',
      title: t('onboarding.steps.subscription.benefit2Title'),
      subtitle: t('onboarding.steps.subscription.benefit2Sub'),
    },
    {
      id: 'advanced-filters',
      title: t('onboarding.steps.subscription.benefit3Title'),
      subtitle: t('onboarding.steps.subscription.benefit3Sub'),
    },
    {
      id: 'ad-free',
      title: t('onboarding.steps.subscription.benefit4Title'),
      subtitle: t('onboarding.steps.subscription.benefit4Sub'),
    },
  ];

  const handleNext = () => {
    updateOnboardingProfileDraft({ selectedPlan });
    router.push('/(onboarding)/ready' as any);
  };
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/ideal-match');
    }
  };

  const responsiveHeaderHeight = isCompact ? 136 : 156;
  const bottomBarPadding = 54;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: isDark ? theme.background : '#FFFFFF' }]}
      edges={['left', 'right']}
    >
      <StatusBar style="dark" />

      <View style={styles.responsiveContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isCompact && styles.scrollContentCompact,
            { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          {/* Top Header Banner with exact background image and artwork */}
          <View
            style={[
              styles.headerBanner,
              {
                paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 12 : 8),
                minHeight: responsiveHeaderHeight,
              },
              isCompact && styles.headerBannerCompact,
            ]}
          >
            <Image
              source={require('@/assets/images/subscription-header-bg.png')}
              style={styles.headerBgImage}
              resizeMode="cover"
            />

            {/* Symmetrically aligned Top Bar: Back Button on left, Skip Button on right */}
            <View style={styles.topBar}>
              <Pressable
                onPress={handleBack}
                style={[styles.backButton, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="chevron-back-outline" size={24} color="#111827" />
              </Pressable>

              <Pressable
                onPress={handleNext}
                style={[styles.skipButton, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Skip subscription"
              >
                <Text style={styles.skipText}>{t('onboarding.steps.subscription.skip')}</Text>
                <Ionicons name="chevron-forward" size={15} color="#111827" />
              </Pressable>
            </View>

            {/* Header Title & Subtitle */}
            <View style={styles.headerTextCol}>
              <Text style={[styles.mainTitle, isCompact && styles.mainTitleCompact]}>{t('onboarding.steps.subscription.findBetter')}</Text>
              <Text style={[styles.mainTitle, isCompact && styles.mainTitleCompact]}>{t('onboarding.steps.subscription.connectDeeper')}</Text>
              <Text style={[styles.subTitle, isCompact && styles.subTitleCompact]}>{t('onboarding.steps.subscription.subTitle')}</Text>
            </View>
          </View>

          {/* Main Body Content grouped naturally at top */}
          <View style={styles.bodyContent}>
            <View>
              {/* "Choose your plan" Title */}
              <Text style={[styles.sectionHeaderTitle, isCompact && styles.sectionHeaderTitleCompact]}>
                {t('onboarding.steps.subscription.choosePlan')}
              </Text>

              {/* Plan Cards */}
              <View style={[styles.plansContainer, isCompact && styles.plansContainerCompact]}>
                {/* 1. Monthly Plan Card */}
                <Pressable
                  onPress={() => {
                    setSelectedPlan('monthly');
                    updateOnboardingProfileDraft({ selectedPlan: 'monthly' });
                  }}
                  style={[
                    styles.planCard,
                    isCompact && styles.planCardCompact,
                    selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardUnselected,
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedPlan === 'monthly' }}
                  accessibilityLabel="Monthly plan Rs. 299 per month"
                >
                  <View style={styles.planCardContent}>
                    <Text style={[styles.planTitle, isCompact && styles.planTitleCompact]}>{t('onboarding.steps.subscription.monthly')}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceBold, isCompact && styles.priceBoldCompact]}>{t('onboarding.steps.subscription.monthlyPrice')}</Text>
                      <Text style={[styles.priceUnit, isCompact && styles.priceUnitCompact]}>{t('onboarding.steps.subscription.perMonth')}</Text>
                    </View>
                  </View>

                  {/* Radio Button */}
                  <View
                    style={[
                      styles.radioOuter,
                      isCompact && styles.radioOuterCompact,
                      selectedPlan === 'monthly' ? styles.radioOuterSelected : styles.radioOuterUnselected,
                    ]}
                  >
                    {selectedPlan === 'monthly' && <View style={[styles.radioInner, isCompact && styles.radioInnerCompact]} />}
                  </View>
                </Pressable>

                {/* 2. Yearly Plan Card */}
                <Pressable
                  onPress={() => {
                    setSelectedPlan('yearly');
                    updateOnboardingProfileDraft({ selectedPlan: 'yearly' });
                  }}
                  style={[
                    styles.planCard,
                    isCompact && styles.planCardCompact,
                    selectedPlan === 'yearly' ? styles.planCardSelected : styles.planCardUnselected,
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedPlan === 'yearly' }}
                  accessibilityLabel="Yearly plan Rs. 1999 per year, Just Rs. 167 per month"
                >
                  <View style={styles.planCardContent}>
                    <Text style={[styles.planTitle, isCompact && styles.planTitleCompact]}>{t('onboarding.steps.subscription.yearly')}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceBold, isCompact && styles.priceBoldCompact]}>{t('onboarding.steps.subscription.yearlyPrice')}</Text>
                      <Text style={[styles.priceUnit, isCompact && styles.priceUnitCompact]}>{t('onboarding.steps.subscription.perYear')}</Text>
                    </View>
                    <Text style={[styles.discountSubtext, isCompact && styles.discountSubtextCompact]}>{t('onboarding.steps.subscription.yearlySubtext')}</Text>
                  </View>

                  {/* Radio Button */}
                  <View
                    style={[
                      styles.radioOuter,
                      isCompact && styles.radioOuterCompact,
                      selectedPlan === 'yearly' ? styles.radioOuterSelected : styles.radioOuterUnselected,
                    ]}
                  >
                    {selectedPlan === 'yearly' && <View style={[styles.radioInner, isCompact && styles.radioInnerCompact]} />}
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Premium Benefits Section: positioned with balanced breathing room */}
            <View style={[styles.benefitsCard, isCompact && styles.benefitsCardCompact]}>
              <Text style={[styles.benefitsTitle, isCompact && styles.benefitsTitleCompact]}>{t('onboarding.steps.subscription.premiumBenefits')}</Text>

              <View style={[styles.benefitsList, isCompact && styles.benefitsListCompact]}>
                {benefits.map((benefit, index) => (
                  <View
                    key={benefit.id}
                    style={[
                      styles.benefitRow,
                      index === benefits.length - 1 && styles.benefitRowLast,
                    ]}
                  >
                    <View style={[styles.heartIconBadge, isCompact && styles.heartIconBadgeCompact]}>
                      <Ionicons name="heart" size={isCompact ? 14 : 16} color="#FF1493" />
                    </View>
                    <View style={styles.benefitTextCol}>
                      <Text style={[styles.benefitItemTitle, isCompact && styles.benefitItemTitleCompact]}>{benefit.title}</Text>
                      <Text style={[styles.benefitItemSubtitle, isCompact && styles.benefitItemSubtitleCompact]}>{benefit.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Subscription CTA Button matching exact responsive positioning */}
        <View style={[styles.bottomBar, { paddingBottom: bottomBarPadding }]}>
          <TouchableOpacity
            style={[styles.subscriptionButton, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}
            onPress={handleNext}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Subscription"
          >
            <Text style={styles.subscriptionButtonText}>{t('onboarding.steps.subscription.subscribeBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentCompact: {
    paddingBottom: 4,
  },
  headerBanner: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 16,
    minHeight: 156,
  },
  headerBannerCompact: {
    minHeight: 136,
    paddingBottom: 8,
  },
  headerBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    zIndex: 2,
  },
  topBarSpacer: {
    flex: 1,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    gap: 2,
  },
  skipText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 14,
    color: '#111827',
  },
  headerTextCol: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingRight: 110,
    zIndex: 2,
  },
  mainTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 23,
    lineHeight: 28,
    color: '#111827',
    letterSpacing: -0.4,
  },
  mainTitleCompact: {
    fontSize: 21,
    lineHeight: 26,
  },
  subTitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#8E95A2',
    marginTop: 6,
    letterSpacing: -0.2,
  },
  subTitleCompact: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  bodyContent: {
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  sectionHeaderTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 17.5,
    color: '#111827',
    marginTop: 18,
    marginBottom: 14,
  },
  sectionHeaderTitleCompact: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  plansContainer: {
    gap: 10,
  },
  plansContainerCompact: {
    gap: 8,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  planCardCompact: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  planCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  planCardSelected: {
    backgroundColor: '#DFF6F5',
    borderColor: '#A0EDE8',
  },
  planCardContent: {
    flex: 1,
  },
  planTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 15,
    color: '#111827',
    marginBottom: 3,
  },
  planTitleCompact: {
    fontSize: 14,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceBold: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 17,
    color: '#111827',
  },
  priceBoldCompact: {
    fontSize: 16,
  },
  priceUnit: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  priceUnitCompact: {
    fontSize: 12,
  },
  discountSubtext: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 11.5,
    color: '#00838F',
    marginTop: 3,
  },
  discountSubtextCompact: {
    fontSize: 10.5,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioOuterCompact: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 10,
  },
  radioOuterUnselected: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderWidth: 2.5,
    borderColor: '#00ACC1',
    backgroundColor: '#FFFFFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ACC1',
  },
  radioInnerCompact: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  benefitsCard: {
    backgroundColor: '#E8F3F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 14,
  },
  benefitsCardCompact: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  benefitsTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16.5,
    color: '#111827',
    marginBottom: 14,
  },
  benefitsTitleCompact: {
    fontSize: 15,
    marginBottom: 8,
  },
  benefitsList: {
    gap: 12,
  },
  benefitsListCompact: {
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitRowLast: {},
  heartIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconBadgeCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitItemTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 14,
    color: '#111827',
  },
  benefitItemTitleCompact: {
    fontSize: 13,
  },
  benefitItemSubtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
    lineHeight: 15,
  },
  benefitItemSubtitleCompact: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  bottomBar: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  subscriptionButton: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#00F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionButtonText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 15.5,
    color: '#000000',
  },
});
