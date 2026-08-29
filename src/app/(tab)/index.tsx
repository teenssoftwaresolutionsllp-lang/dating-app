import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Discover</Text>
            <Text style={styles.title}>Find Your Match</Text>
          </View>
          <TouchableOpacity
            style={styles.onboardingButton}
            onPress={() => router.push('/(onboarding)/set-profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={24} color="#00F5D4" />
            <Text style={styles.onboardingButtonText}>Profile Setup</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardContainer}>
          <View style={styles.heroCard}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="heart" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.heroTitle}>Welcome to Spark</Text>
            <Text style={styles.heroSubtitle}>
              Connect with people nearby, discover potential matches, and start real conversations.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(onboarding)/set-profile')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>Get Started with Onboarding</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  onboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0FDFD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  onboardingButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#099268',
  },
  cardContainer: {
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FAFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A0F0ED',
  },
  heroIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#00F5D4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
});
