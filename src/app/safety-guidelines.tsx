import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LargeDocShieldIcon } from '@/components/SettingsIcons';

interface GuidelineItem {
  title: string;
  description: string;
}

const SAFETY_GUIDELINES: GuidelineItem[] = [
  {
    title: 'Be Yourself',
    description: 'Use genuine information and be honest while creating your profile.',
  },
  {
    title: 'Protect Your Privacy',
    description:
      "Don't share personal information such as your address, phone number, or financial details too soon.",
  },
  {
    title: 'Report & Block',
    description:
      'If you notice suspicious, abusive, or inappropriate behavior, report or block the user.',
  },
  {
    title: 'Meet safety',
    description:
      'For your first meeting, choose a public place and let someone you trust know about your plans.',
  },
];

export default function SafetyGuidelinesScreen() {
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
          <Text style={styles.headerTitle}>Safety Guidelines</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Scroll Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Graphic */}
          <View style={styles.topGraphicWrapper}>
            <View style={styles.iconCircleWrapper}>
              <LargeDocShieldIcon size={56} color="#4FD1C5" />
            </View>
            <Text style={styles.mainHeading}>Your Safety is our Priority</Text>
            <Text style={styles.subHeading}>
              Follow these guidelines to have a safe and respectful experience.
            </Text>
          </View>

          {/* Guidelines List */}
          <View style={styles.guidelinesContainer}>
            {SAFETY_GUIDELINES.map((item, index) => (
              <View key={index} style={styles.guidelineItem}>
                <Text style={styles.guidelineTitle}>{item.title}</Text>
                <Text style={styles.guidelineDescription}>{item.description}</Text>
              </View>
            ))}
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
    paddingTop: Platform.OS === 'android' ? 24 : 0,
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topGraphicWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 28,
  },
  iconCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  guidelinesContainer: {
    gap: 24,
  },
  guidelineItem: {
    gap: 6,
  },
  guidelineTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
  },
  guidelineDescription: {
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    lineHeight: 20,
  },
});
