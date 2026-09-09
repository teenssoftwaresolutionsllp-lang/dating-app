import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getStoredUserProfile, updateStoredUserProfile } from '@/constants/userProfile';

interface VibeOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const VIBE_OPTIONS: VibeOption[] = [
  { id: 'Movies', label: 'Movies', iconName: 'videocam-outline' },
  { id: 'Travel', label: 'Travel', iconName: 'compass-outline' },
  { id: 'Food', label: 'Food', iconName: 'restaurant-outline' },
  { id: 'Fitness', label: 'Fitness', iconName: 'barbell-outline' },
  { id: 'Music', label: 'Music', iconName: 'musical-notes-outline' },
  { id: 'Photography', label: 'Photography', iconName: 'camera-outline' },
  { id: 'Gaming', label: 'Gaming', iconName: 'game-controller-outline' },
  { id: 'Art', label: 'Art', iconName: 'color-palette-outline' },
  { id: 'Cooking', label: 'Cooking', iconName: 'flame-outline' },
  { id: 'Nature', label: 'Nature', iconName: 'leaf-outline' },
  { id: 'Coffee', label: 'Coffee', iconName: 'cafe-outline' },
  { id: 'Nightlife', label: 'Nightlife', iconName: 'moon-outline' },
  { id: 'Reading', label: 'Reading', iconName: 'book-outline' },
  { id: 'Tech', label: 'Tech', iconName: 'laptop-outline' },
  { id: 'Pets', label: 'Pets', iconName: 'paw-outline' },
  { id: 'Yoga', label: 'Yoga', iconName: 'body-outline' },
];

export default function EditVibesScreen() {
  const router = useRouter();
  const profile = getStoredUserProfile();
  const [selectedVibes, setSelectedVibes] = useState<string[]>(
    profile.vibes && profile.vibes.length > 0
      ? profile.vibes
      : ['Movies', 'Travel', 'Food', 'Fitness', 'Music']
  );

  const toggleVibe = (id: string) => {
    if (selectedVibes.includes(id)) {
      if (selectedVibes.length > 1) {
        setSelectedVibes(selectedVibes.filter((v) => v !== id));
      }
    } else {
      if (selectedVibes.length < 6) {
        setSelectedVibes([...selectedVibes, id]);
      }
    }
  };

  const handleSave = () => {
    updateStoredUserProfile({ vibes: selectedVibes });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#0D7A74" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit My Vibes</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>Your Everyday Vibes</Text>
          <Text style={styles.sectionSubtitle}>
            Select up to 5 activities and hobbies that describe your daily vibe and lifestyle.
          </Text>

          {/* Vibes Grid */}
          <View style={styles.gridContainer}>
            {VIBE_OPTIONS.map((item) => {
              const isSelected = selectedVibes.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.vibeCard,
                    isSelected && styles.vibeCardSelected,
                  ]}
                  onPress={() => toggleVibe(item.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected ? styles.iconCircleSelected : styles.iconCircleUnselected,
                    ]}
                  >
                    <Ionicons
                      name={item.iconName}
                      size={24}
                      color={isSelected ? '#0D7A74' : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.vibeLabel,
                      isSelected && styles.vibeLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Save Button */}
          <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.bottomSaveBtnText}>Save Vibes ({selectedVibes.length} selected)</Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
  },
  saveHeaderBtn: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  saveHeaderBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0D7A74',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  vibeCard: {
    width: '30.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  vibeCardSelected: {
    borderColor: '#0D7A74',
    backgroundColor: '#F0FDFA',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleUnselected: {
    backgroundColor: '#F1F5F9',
  },
  iconCircleSelected: {
    backgroundColor: '#CCFBF1',
  },
  vibeLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
    color: '#475569',
    textAlign: 'center',
  },
  vibeLabelSelected: {
    color: '#0D7A74',
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0D7A74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSaveBtn: {
    backgroundColor: '#0D7A74',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0D7A74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
});
