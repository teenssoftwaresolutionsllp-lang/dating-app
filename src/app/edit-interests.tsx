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

const ALL_AVAILABLE_INTERESTS = [
  'Music',
  'Movies',
  'Travel',
  'Concerts',
  'Nature',
  'Gaming',
  'Photography',
  'Fitness',
  'Cooking',
  'Art & Design',
  'Dance',
  'Food',
  'Books',
  'Sports',
  'Pets',
  'Coding',
  'Fashion',
  'Coffee',
  'Anime',
  'Yoga',
  'Volunteering',
  'Hiking',
  'Board Games',
  'Astronomy',
];

export default function EditInterestsScreen() {
  const router = useRouter();
  const profile = getStoredUserProfile();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile.interests && profile.interests.length > 0
      ? profile.interests
      : ['Music', 'Movies', 'Travel', 'Concerts', 'Nature', 'Gaming']
  );

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((item) => item !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = () => {
    updateStoredUserProfile({ interests: selectedInterests });
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
          <Text style={styles.headerTitle}>Edit My Interests</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>What are you passionate about?</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the interests that make you unique and help connect with people who share your passions.
          </Text>

          {/* Chips Grid */}
          <View style={styles.interestsWrap}>
            {ALL_AVAILABLE_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.interestChipText,
                      isSelected && styles.interestChipTextSelected,
                    ]}
                  >
                    {interest}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#0D7A74"
                      style={{ marginLeft: 6 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Save Button */}
          <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.bottomSaveBtnText}>
              Save Interests ({selectedInterests.length} selected)
            </Text>
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
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  interestChipSelected: {
    backgroundColor: '#E6FFFA',
    borderColor: '#0D7A74',
  },
  interestChipText: {
    fontSize: 13.5,
    fontFamily: 'DM_Sans_500Medium',
    color: '#334155',
  },
  interestChipTextSelected: {
    color: '#0D7A74',
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
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
