import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getStoredUserProfile, updateStoredUserProfile } from '@/constants/userProfile';
import { updateCurrentProfile } from '@/services/profileApi';

interface NatureOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export const NATURE_OPTIONS: NatureOption[] = [
  { id: 'Caring', label: 'Caring', iconName: 'heart' },
  { id: 'Fun & Funny', label: 'Fun & Funny', iconName: 'happy' },
  { id: 'Peaceful', label: 'Peaceful', iconName: 'leaf' },
  { id: 'Deep Talks', label: 'Deep Talks', iconName: 'chatbubbles' },
  { id: 'Romantic', label: 'Romantic', iconName: 'rose' },
  { id: 'Adventurous', label: 'Adventurous', iconName: 'compass' },
  { id: 'Classy', label: 'Classy', iconName: 'sparkles' },
  { id: 'Chill', label: 'Chill', iconName: 'cafe' },
  { id: 'Positive', label: 'Positive', iconName: 'sunny' },
  { id: 'Creative', label: 'Creative', iconName: 'color-palette' },
];

export default function EditNatureScreen() {
  const router = useRouter();
  const profile = getStoredUserProfile();
  const initialSelected =
    profile.nature && profile.nature.length > 0
      ? profile.nature
      : profile.vibes && profile.vibes.length > 0
      ? profile.vibes
      : [];

  const [selectedTraits, setSelectedTraits] = useState<string[]>(initialSelected);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTrait = (id: string) => {
    if (selectedTraits.includes(id)) {
      setSelectedTraits(selectedTraits.filter((v) => v !== id));
    } else {
      if (selectedTraits.length < 5) {
        setSelectedTraits([...selectedTraits, id]);
      }
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      updateStoredUserProfile({ nature: selectedTraits, vibes: selectedTraits });
      await updateCurrentProfile({
        vibes: selectedTraits,
        nature: selectedTraits,
      } as any).catch((e: unknown) => {
        console.warn('Backend sync warning on nature update:', e);
      });
      router.back();
    } finally {
      setIsSubmitting(false);
    }
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
          <Text style={styles.headerTitle}>Edit My Nature</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveHeaderBtnText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleCountRow}>
            <Text style={styles.sectionHeading}>Your Nature Traits</Text>
            <Text style={styles.counterText}>{selectedTraits.length} / 5 selected</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select up to 5 traits that describe your personality, vibe, and daily lifestyle.
          </Text>

          {/* Nature Grid */}
          <View style={styles.gridContainer}>
            {NATURE_OPTIONS.map((item) => {
              const isSelected = selectedTraits.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.traitCard,
                    isSelected && styles.traitCardSelected,
                  ]}
                  onPress={() => toggleTrait(item.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && styles.iconCircleSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.iconName}
                      size={20}
                      color={isSelected ? '#0D7A74' : '#6B7280'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.traitLabel,
                      isSelected && styles.traitLabelSelected,
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  saveHeaderBtn: {
    backgroundColor: '#0D7A74',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
  },
  saveHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  titleCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D7A74',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  traitCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    position: 'relative',
    gap: 8,
  },
  traitCardSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D7A74',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleSelected: {
    backgroundColor: '#CCFBF1',
  },
  traitLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#374151',
  },
  traitLabelSelected: {
    color: '#0F766E',
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0D7A74',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
