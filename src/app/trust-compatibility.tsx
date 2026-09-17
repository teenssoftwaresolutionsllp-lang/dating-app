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
import { TrustHandsGraphic } from '@/components/SettingsIcons';

interface ContentItem {
  title: string;
  description: string;
}

const TRUST_ITEMS: ContentItem[] = [
  {
    title: 'Profile Verification',
    description: 'Verified profiles help you connect with genuine users.',
  },
  {
    title: 'Compatibility Matching',
    description: 'We suggest matches based on your interests and preferences.',
  },
  {
    title: 'Community Standards',
    description: 'We encourage respectful, honest, and positive interactions.',
  },
  {
    title: 'Transparency',
    description: "We're open about how our app works and how we use your information.",
  },
  {
    title: 'Safe & Meaningful Connections',
    description: "We're committed to helping you build meaningful and trusted connections.",
  },
];

export default function TrustCompatibilityScreen() {
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
          <Text style={styles.headerTitle}>Trust Compatibility</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* Scroll Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Graphic */}
          <View style={styles.topGraphicWrapper}>
            <View style={styles.iconWrapper}>
              <TrustHandsGraphic size={64} color="#0D7A74" />
            </View>
            <Text style={styles.mainHeading}>Building Connections You Can Trust</Text>
            <Text style={styles.subHeading}>
              We use smart technology and human review to create a safe and trustworthy community.
            </Text>
          </View>

          {/* Guidelines List */}
          <View style={styles.itemsContainer}>
            {TRUST_ITEMS.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topGraphicWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 28,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 18.5,
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
    paddingHorizontal: 16,
  },
  itemsContainer: {
    gap: 22,
    marginTop: 4,
  },
  itemRow: {
    gap: 5,
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
  },
  itemDescription: {
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    lineHeight: 19,
  },
});
