import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES = ['All', 'Nearby', 'New Members', 'Online Now', 'Popular'];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Explore</Text>
          <Text style={styles.subtitle}>Discover new matches around you</Text>
        </View>

        {/* Categories Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.exploreGrid}>
          <View style={styles.placeholderCard}>
            <Ionicons name="compass-outline" size={48} color="#00F5D4" />
            <Text style={styles.cardTitle}>Find Matches</Text>
            <Text style={styles.cardDesc}>
              Browse through profiles and start connecting with people nearby.
            </Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoriesRow: {
    gap: 10,
    paddingBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryPillSelected: {
    backgroundColor: '#00F5D4',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryTextSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  exploreGrid: {
    marginTop: 8,
  },
  placeholderCard: {
    backgroundColor: '#FAFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A0F0ED',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
