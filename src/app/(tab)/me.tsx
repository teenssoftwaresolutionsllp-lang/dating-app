import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CustomTabBar } from '@/components/CustomTabBar';
import { PhotoActionSheetModal } from '@/components/PhotoActionSheetModal';
import { ASSET_IMAGES } from '@/constants/datingData';
import {
  UserProfile,
  calculateAge,
  getStoredUserProfile,
  updateStoredUserProfile,
  subscribeUserProfile,
} from '@/constants/userProfile';

interface MeScreenProps {
  showTabBar?: boolean;
  showHeaderBar?: boolean;
}

const ALL_INTEREST_OPTIONS = [
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
];

const VIBE_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Movies: 'videocam-outline',
  Travel: 'compass-outline',
  Food: 'restaurant-outline',
  Fitness: 'barbell-outline',
  Music: 'musical-notes-outline',
  Photography: 'camera-outline',
  Gaming: 'game-controller-outline',
  Art: 'color-palette-outline',
  Cooking: 'flame-outline',
  Nature: 'leaf-outline',
  Coffee: 'cafe-outline',
  Nightlife: 'moon-outline',
  Reading: 'book-outline',
  Tech: 'laptop-outline',
  Pets: 'paw-outline',
  Yoga: 'body-outline',
};

function getVibeIcon(vibe: string): keyof typeof Ionicons.glyphMap {
  return VIBE_ICON_MAP[vibe] || 'sparkles-outline';
}

export default function MeScreen({ showTabBar = true, showHeaderBar = true }: MeScreenProps = {}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(() => getStoredUserProfile());
  const [showToast, setShowToast] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeUserProfile((updated) => {
      setProfile(updated);
    });
    return unsubscribe;
  }, []);

  const handlePhotoSelected = (uri: string) => {
    const updated = updateStoredUserProfile({ avatarUri: uri });
    setProfile(updated);
    setEditForm((prev) => ({ ...prev, avatarUri: uri }));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // Open Edit View
  const handleOpenEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  // Save Edit Changes
  const handleSaveEdit = () => {
    const updated = updateStoredUserProfile({ ...editForm });
    setProfile(updated);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Toggle Interest Chip in Edit Mode
  const toggleInterest = (interest: string) => {
    setEditForm((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  // RENDER INTERACTIVE EDIT PROFILE SCREEN
  if (isEditing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            {/* Edit Screen Header with Back & Save */}
            <View style={styles.editHeaderNav}>
              <TouchableOpacity style={styles.backBtnTouch} onPress={handleCancelEdit} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.editHeaderTitle}>Edit Profile</Text>
              <TouchableOpacity style={styles.saveBtnTouch} onPress={handleSaveEdit} activeOpacity={0.8}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.editScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Change Avatar Row */}
              <View style={styles.editAvatarRow}>
                <Image
                  source={editForm.avatarUri ? { uri: editForm.avatarUri } : (profile.avatarUri ? { uri: profile.avatarUri } : ASSET_IMAGES.userProfile)}
                  style={styles.editAvatarImage}
                />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={() => setShowPhotoModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={16} color="#0F766E" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Basic Info Inputs */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.name}
                  onChangeText={(val) => setEditForm({ ...editForm, name: val })}
                  placeholder="Enter name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formRowTwoColumns}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Age</Text>
                  <TextInput
                    style={[styles.formInput, styles.readOnlyInput]}
                    value={String(calculateAge(editForm.dateOfBirth || profile.dateOfBirth))}
                    editable={false}
                    selectTextOnFocus={false}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 2 }]}>
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.location}
                    onChangeText={(val) => setEditForm({ ...editForm, location: val })}
                    placeholder="City, Country"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Profession</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.profession}
                  onChangeText={(val) => setEditForm({ ...editForm, profession: val })}
                  placeholder="Your occupation"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* About Bio Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>About Bio</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  value={editForm.about}
                  onChangeText={(val) => setEditForm({ ...editForm, about: val })}
                  multiline
                  numberOfLines={4}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>

              {/* Profile Details Inputs */}
              <Text style={styles.editSectionTitle}>Profile Details</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Education</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.education}
                  onChangeText={(val) => setEditForm({ ...editForm, education: val })}
                  placeholder="Highest qualification"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Languages</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.languages}
                  onChangeText={(val) => setEditForm({ ...editForm, languages: val })}
                  placeholder="Languages spoken"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formRowTwoColumns}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Religion</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.religion}
                    onChangeText={(val) => setEditForm({ ...editForm, religion: val })}
                    placeholder="Religion"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Height</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.height}
                    onChangeText={(val) => setEditForm({ ...editForm, height: val })}
                    placeholder="Height"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Relationship Status</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.relationshipStatus}
                  onChangeText={(val) => setEditForm({ ...editForm, relationshipStatus: val })}
                  placeholder="Status"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Select Interests */}
              <Text style={styles.editSectionTitle}>Select Interests</Text>
              <View style={styles.interestsSelectionWrap}>
                {ALL_INTEREST_OPTIONS.map((item) => {
                  const isSelected = editForm.interests.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.editInterestChip,
                        isSelected && styles.editInterestChipSelected,
                      ]}
                      onPress={() => toggleInterest(item)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.editInterestText,
                          isSelected && styles.editInterestTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color="#0F766E" style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bottom Action Save Button */}
              <TouchableOpacity
                style={styles.fullSaveButton}
                onPress={handleSaveEdit}
                activeOpacity={0.85}
              >
                <Text style={styles.fullSaveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // RENDER MAIN BOY PROFILE SCREEN
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Bar */}
        {showHeaderBar && (
          <View style={styles.topHeaderNav}>
            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
              <Ionicons name="card-outline" size={22} color="#0F766E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={22} color="#0F766E" />
            </TouchableOpacity>
          </View>
        )}

        {/* Success Save Toast Banner */}
        {showToast && (
          <View style={styles.toastBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.toastBannerText}>Profile updated successfully!</Text>
          </View>
        )}

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card Header */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={profile.avatarUri ? { uri: profile.avatarUri } : ASSET_IMAGES.userProfile}
                style={styles.avatarImage}
              />
              <TouchableOpacity
                style={styles.cameraEditBadge}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Name & Verified Badge */}
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{profile.name}, {calculateAge(profile.dateOfBirth)}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 4 }} />
            </View>

            {/* Subtitle Rows */}
            <View style={styles.infoSubRow}>
              <Ionicons name="location-sharp" size={15} color="#374151" />
              <Text style={styles.infoSubText}>{profile.location}</Text>
            </View>

            <View style={styles.infoSubRow}>
              <Ionicons name="briefcase-outline" size={15} color="#374151" />
              <Text style={styles.infoSubText}>{profile.profession}</Text>
            </View>

            {/* Profile Completion Progress Bar */}
            <View style={styles.completionContainer}>
              <View style={styles.completionHeaderRow}>
                <Text style={styles.completionTitle}>Profile Completion</Text>
                <Text style={styles.completionPercentage}>80%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '80%' }]} />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.completeLinkTouch}
                onPress={() => router.push('/(onboarding)/set-profile')}
              >
                <Text style={styles.completeLinkText}>Complete Your Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 1: About */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>About</Text>
              <TouchableOpacity onPress={() => router.push('/edit-about')} activeOpacity={0.7}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutCardText}>{`"${profile.about}"`}</Text>
            </View>
          </View>

          {/* Section 2: My Vibes */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Vibes</Text>
              <TouchableOpacity
                onPress={() => router.push('/edit-vibes')}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.vibesRow}>
              {(profile.vibes && profile.vibes.length > 0
                ? profile.vibes
                : ['Movies', 'Travel', 'Food', 'Fitness', 'Music']
              ).map((vibe, index) => (
                <View key={index} style={styles.vibeItem}>
                  <View style={styles.vibeIconCircle}>
                    <Ionicons name={getVibeIcon(vibe)} size={22} color="#0F766E" />
                  </View>
                  <Text style={styles.vibeLabel} numberOfLines={1}>
                    {vibe}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section 3: What I'm Looking For */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{"What I'm Looking For"}</Text>
              <TouchableOpacity
                onPress={() => router.push('/edit-looking-for')}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lookingForChipsContainer}>
              {profile.lookingFor.map((item, idx) => (
                <View key={idx} style={styles.lookingForPill}>
                  <Ionicons name="heart" size={16} color="#0F766E" style={{ marginRight: 6 }} />
                  <Text style={styles.lookingForPillText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section 4: Profile Details Grid */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Profile Details</Text>
              <TouchableOpacity
                onPress={() => router.push('/edit-details')}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="school-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Education</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.education}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="language-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Languages</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.languages}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="sparkles-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Religion</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.religion}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="briefcase-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Profession</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.profession}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="heart-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Relationship Status</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.relationshipStatus}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="body-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Height</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.height}</Text>
              </View>
            </View>
          </View>

          {/* Section 5: My Interests */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Interests</Text>
              <TouchableOpacity
                onPress={() => router.push('/edit-interests')}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.interestsWrap}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{interest}</Text>
                  <Ionicons name="checkmark-circle" size={16} color="#00E676" style={{ marginLeft: 6 }} />
                </View>
              ))}
            </View>
          </View>

          {/* Section 6: Identity Verified Banner */}
          <View style={styles.verifiedBannerCard}>
            <View style={styles.verifiedLeftIcon}>
              <Ionicons name="shield-checkmark" size={26} color="#166534" />
            </View>
            <View style={styles.verifiedTextContainer}>
              <Text style={styles.verifiedBannerTitle}>Identity Verified</Text>
              <Text style={styles.verifiedBannerSubtitle}>
                Your identity has been verified to keep your profile trustworthy.
              </Text>
            </View>
            <Ionicons name="checkmark-circle-outline" size={24} color="#166534" />
          </View>
        </ScrollView>

        {/* Photo Picker Action Sheet Modal */}
        <PhotoActionSheetModal
          visible={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          onPhotoSelected={handlePhotoSelected}
        />

        {showTabBar && <CustomTabBar />}
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
    paddingTop:30,
  },
  topHeaderNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerIconButton: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  toastBanner: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    elevation: 4,
  },
  toastBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  /* Profile Header Card */
  profileHeaderCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F1F5F9',
  },
  cameraEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  infoSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  infoSubText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    color: '#4B5563',
  },
  /* Completion Progress Bar */
  completionContainer: {
    width: '100%',
    marginTop: 18,
    backgroundColor: '#FAFAFA',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  completionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  completionPercentage: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0F766E',
    borderRadius: 4,
  },
  completeLinkTouch: {
    alignSelf: 'flex-end',
  },
  completeLinkText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 12,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  /* Section Layouts */
  sectionContainer: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  editText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  /* About Card */
  aboutCard: {
    backgroundColor: '#E6FFFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  aboutCardText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13.5,
    lineHeight: 20,
    color: '#1F2937',
  },
  /* Vibes Row */
  vibesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vibeItem: {
    alignItems: 'center',
    width: '18%',
  },
  vibeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  vibeLabel: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 11.5,
    fontWeight: '600',
    color: '#374151',
  },
  /* Looking For */
  lookingForChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  lookingForPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  lookingForPillText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
    fontWeight: '600',
    color: '#0F766E',
  },
  /* Details Grid */
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailBox: {
    width: '48%',
    backgroundColor: '#E6FFFA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  detailBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailBoxTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  detailBoxValue: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 24,
  },
  /* Interests Wrap */
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  interestChipText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
    color: '#374151',
  },
  /* Identity Verified Banner */
  verifiedBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 12,
  },
  verifiedLeftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedTextContainer: {
    flex: 1,
  },
  verifiedBannerTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  verifiedBannerSubtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 11.5,
    color: '#15803D',
    lineHeight: 16,
  },
  /* EDIT PROFILE SCREEN STYLES */
  editHeaderNav: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtnTouch: {
    padding: 6,
  },
  editHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'DM_Sans_700Bold',
  },
  saveBtnTouch: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E6FFFA',
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
    fontFamily: 'DM_Sans_700Bold',
  },
  editScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  editAvatarRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: '#F1F5F9',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 6,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
  },
  editSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'DM_Sans_700Bold',
    marginTop: 12,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRowTwoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    fontFamily: 'DM_Sans_500Medium',
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'DM_Sans_400Regular',
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    borderColor: '#E5E7EB',
  },
  multilineInput: {
    height: 90,
    paddingTop: 10,
  },
  interestsSelectionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  editInterestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editInterestChipSelected: {
    backgroundColor: '#E6FFFA',
    borderColor: '#0F766E',
  },
  editInterestText: {
    fontSize: 13,
    color: '#4B5563',
    fontFamily: 'DM_Sans_400Regular',
  },
  editInterestTextSelected: {
    color: '#0F766E',
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
  fullSaveButton: {
    backgroundColor: '#0F766E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fullSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
  },
});
