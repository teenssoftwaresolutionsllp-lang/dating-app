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

const EDUCATION_OPTIONS = [
  'Graduation / B.Tech',
  'Master / M.Tech / MBA',
  'Doctorate / Ph.D',
  'Diploma / Vocational',
  'High School',
];

const RELIGION_OPTIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Jain',
  'Buddhist',
  'Spiritual',
  'Atheist / Agnostic',
];

const RELATIONSHIP_OPTIONS = [
  'Single',
  'Never Married',
  'Divorced',
  'Separated',
  'Widowed',
];

export default function EditDetailsScreen() {
  const router = useRouter();
  const profile = getStoredUserProfile();

  const [education, setEducation] = useState(profile.education || 'Graduation / B.Tech');
  const [languages, setLanguages] = useState(profile.languages || 'English, Telugu');
  const [religion, setReligion] = useState(profile.religion || 'Hindu');
  const [profession, setProfession] = useState(profile.profession || 'Software Engineer');
  const [relationshipStatus, setRelationshipStatus] = useState(
    profile.relationshipStatus || 'Single'
  );
  const [height, setHeight] = useState(profile.height || `5'10" (178 cm)`);

  const handleSave = () => {
    updateStoredUserProfile({
      education: education.trim(),
      languages: languages.trim(),
      religion: religion.trim(),
      profession: profession.trim(),
      relationshipStatus: relationshipStatus.trim(),
      height: height.trim(),
    });
    router.back();
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
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="#0D7A74" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile Details</Text>
            <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveHeaderBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionHeading}>Key Details</Text>
            <Text style={styles.sectionSubtitle}>
              Update your education, profession, height, languages, and personal background.
            </Text>

            {/* Profession Input */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Profession / Occupation</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="briefcase-outline" size={20} color="#0D7A74" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={profession}
                  onChangeText={setProfession}
                  placeholder="e.g. Software Engineer"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Education Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Education</Text>
              <View style={styles.chipsWrap}>
                {EDUCATION_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.choiceChip,
                      education === item && styles.choiceChipSelected,
                    ]}
                    onPress={() => setEducation(item)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.choiceChipText,
                        education === item && styles.choiceChipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Languages Input */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Languages Spoken</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="language-outline" size={20} color="#0D7A74" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={languages}
                  onChangeText={setLanguages}
                  placeholder="e.g. English, Telugu, Hindi"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Height & Religion Row */}
            <View style={styles.twoColumnRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Height</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="body-outline" size={18} color="#0D7A74" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={height}
                    onChangeText={setHeight}
                    placeholder={'e.g. 5\'10" (178 cm)'}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Religion</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="sparkles-outline" size={18} color="#0D7A74" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={religion}
                    onChangeText={setReligion}
                    placeholder="e.g. Hindu"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>

            {/* Relationship Status */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Relationship Status</Text>
              <View style={styles.chipsWrap}>
                {RELATIONSHIP_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.choiceChip,
                      relationshipStatus === item && styles.choiceChipSelected,
                    ]}
                    onPress={() => setRelationshipStatus(item)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.choiceChipText,
                        relationshipStatus === item && styles.choiceChipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bottom Save Button */}
            <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.bottomSaveBtnText}>Save Profile Details</Text>
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
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#0F172A',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  choiceChipSelected: {
    backgroundColor: '#E6FFFA',
    borderColor: '#0D7A74',
  },
  choiceChipText: {
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    color: '#475569',
  },
  choiceChipTextSelected: {
    color: '#0D7A74',
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
  bottomSaveBtn: {
    backgroundColor: '#0D7A74',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
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
