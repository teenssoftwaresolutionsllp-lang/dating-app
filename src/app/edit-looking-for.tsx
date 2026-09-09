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

interface LookingForOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const LOOKING_FOR_OPTIONS: LookingForOption[] = [
  {
    id: 'Serious Relationship',
    title: 'Serious Relationship',
    description: 'Looking for a committed long-term partner',
    icon: 'heart',
  },
  {
    id: 'Meaningful Connection',
    title: 'Meaningful Connection',
    description: 'Deep conversations, shared values, and mutual growth',
    icon: 'sparkles',
  },
  {
    id: 'Long-term Partner',
    title: 'Long-term Partner',
    description: 'Ready to build a future together',
    icon: 'infinite',
  },
  {
    id: 'Marriage / Matrimony',
    title: 'Marriage / Matrimony',
    description: 'Looking to find life partner and settle down',
    icon: 'ribbon',
  },
  {
    id: 'Casual Dating',
    title: 'Casual Dating',
    description: 'Fun dates, socializing, and getting to know each other',
    icon: 'wine',
  },
  {
    id: 'New Friends',
    title: 'New Friends',
    description: 'Expanding circle with like-minded people',
    icon: 'people',
  },
  {
    id: 'Open to Explore',
    title: 'Open to Explore',
    description: 'Letting connections happen naturally',
    icon: 'compass',
  },
];

export default function EditLookingForScreen() {
  const router = useRouter();
  const profile = getStoredUserProfile();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    profile.lookingFor && profile.lookingFor.length > 0
      ? profile.lookingFor
      : ['Serious Relationship', 'Meaningful Connection']
  );

  const toggleOption = (id: string) => {
    if (selectedOptions.includes(id)) {
      if (selectedOptions.length > 1) {
        setSelectedOptions(selectedOptions.filter((item) => item !== id));
      }
    } else {
      setSelectedOptions([...selectedOptions, id]);
    }
  };

  const handleSave = () => {
    updateStoredUserProfile({ lookingFor: selectedOptions });
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
          <Text style={styles.headerTitle}>{"What I'm Looking For"}</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>Relationship Goals</Text>
          <Text style={styles.sectionSubtitle}>
            Be clear about what you are seeking so we can find matches aligned with your intentions.
          </Text>

          {/* Options List */}
          <View style={styles.optionsList}>
            {LOOKING_FOR_OPTIONS.map((item) => {
              const isSelected = selectedOptions.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => toggleOption(item.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected ? styles.iconCircleSelected : styles.iconCircleUnselected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isSelected ? '#0D7A74' : '#64748B'}
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected && styles.optionTitleSelected,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.optionDesc}>{item.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkboxCircle,
                      isSelected && styles.checkboxCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Save Button */}
          <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.bottomSaveBtnText}>Save Goals ({selectedOptions.length} selected)</Text>
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
    paddingTop: 0,
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
  optionsList: {
    gap: 12,
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#0D7A74',
    backgroundColor: '#F0FDFA',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleUnselected: {
    backgroundColor: '#F1F5F9',
  },
  iconCircleSelected: {
    backgroundColor: '#CCFBF1',
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#0D7A74',
  },
  optionDesc: {
    fontSize: 12,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
    lineHeight: 16,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleSelected: {
    backgroundColor: '#0D7A74',
    borderColor: '#0D7A74',
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
