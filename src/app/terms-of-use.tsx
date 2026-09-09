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

interface TermsSection {
  title: string;
  content: string;
}

const TERMS_DATA: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By using our app, you agree to these Terms of Use. If you do not agree, please do not use our app.',
  },
  {
    title: '2. Use of the App',
    content:
      'You must be at least 18 years old to use this app. You agree to use the app only for lawful purposes and in a way that does not infringe the rights of others.',
  },
  {
    title: '3. User Content',
    content:
      'You are responsible for the content you share on our app. Do not post anything that is harmful, abusive, offensive, or against the law.',
  },
  {
    title: '4. Respectful Behavior',
    content:
      'Treat other users with respect. Harassment, bullying, threats, hate speech, or inappropriate behavior are not allowed.',
  },
  {
    title: '5. Account Termination',
    content:
      'We may suspend or terminate your account if you violate these Terms or misuse the app.',
  },
];

export default function TermsOfUseScreen() {
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
          <Text style={styles.headerTitle}>Terms of Use</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Scroll Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Badge Icon & Last Updated Date */}
          <View style={styles.topGraphicWrapper}>
            <View style={styles.iconCircleWrapper}>
              <LargeDocShieldIcon size={56} color="#4FD1C5" />
            </View>
            <Text style={styles.lastUpdatedText}>Last Updated, 20 May 2024</Text>
          </View>

          {/* Terms Sections */}
          <View style={styles.sectionsContainer}>
            {TERMS_DATA.map((section, index) => (
              <View key={index} style={styles.sectionItem}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
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
    marginVertical: 18,
  },
  iconCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 12.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
  },
  sectionsContainer: {
    marginTop: 12,
    gap: 22,
  },
  sectionItem: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    lineHeight: 22,
  },
  sectionContent: {
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    lineHeight: 20,
  },
});
