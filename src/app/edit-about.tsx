import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getStoredUserProfile, updateStoredUserProfile } from '@/constants/userProfile';

const SUGGESTIONS = [
  'Passionate about photography & road trips 🚗📸',
  'Love trying new coffee shops & listening to jazz ☕🎷',
  'Looking for someone to share weekend brunches & deep talks ✨',
  'Fitness enthusiast and amateur chef 🍳💪',
];

export default function EditAboutScreen() {
  const router = useRouter();
  const profile = getStoredUserProfile();
  const [aboutText, setAboutText] = useState(profile.about || '');

  const handleSave = () => {
    updateStoredUserProfile({ about: aboutText.trim() });
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (!aboutText.trim()) {
      setAboutText(suggestion);
    } else {
      setAboutText(`${aboutText} ${suggestion}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="#0D7A74" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit About</Text>
            <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveHeaderBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionHeading}>About You</Text>
            <Text style={styles.sectionSubtitle}>
              Write a short bio to introduce yourself, your passions, and what brings you joy.
            </Text>

            {/* Bio Text Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={6}
                value={aboutText}
                onChangeText={setAboutText}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#94A3B8"
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{aboutText.length} / 500</Text>
            </View>

            {/* Quick Inspiration Prompts */}
            <Text style={styles.suggestionsHeading}>Quick Inspiration Ideas</Text>
            <View style={styles.suggestionsWrapper}>
              {SUGGESTIONS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => handleAddSuggestion(item)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#0D7A74" />
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom Save Button */}
            <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.bottomSaveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  textArea: {
    height: 140,
    fontSize: 14.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#0F172A',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 8,
    fontFamily: 'DM_Sans_400Regular',
  },
  suggestionsHeading: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  suggestionsWrapper: {
    gap: 10,
    marginBottom: 30,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    color: '#334155',
    lineHeight: 18,
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
