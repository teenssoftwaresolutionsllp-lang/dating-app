import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CustomTabBar } from '@/components/CustomTabBar';
import { PhotoActionSheetModal } from '@/components/PhotoActionSheetModal';
import { ASSET_IMAGES } from '@/constants/datingData';
import {
  UserProfile,
  PartnerPreferences,
  calculateAge,
  getStoredUserProfile,
  updateStoredUserProfile,
  subscribeUserProfile,
  getStoredPartnerPreferences,
  updateStoredPartnerPreferences,
  subscribePartnerPreferences,
} from '@/constants/userProfile';
import {
  getMyProfile,
  getCurrentProfile,
  updateCurrentProfile,
  updateEducation,
  updateDatingPreferences,
  uploadPhotos,
  type BackendProfile,
} from '@/services/profileApi';
import { formatApiImageUrl } from '@/services/api';

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
  Caring: 'heart-outline',
  'Fun & Funny': 'happy-outline',
  Peaceful: 'leaf-outline',
  'Deep Talks': 'chatbubbles-outline',
  Romantic: 'rose-outline',
  Adventurous: 'compass-outline',
  Classy: 'sparkles-outline',
  Chill: 'cafe-outline',
  Positive: 'sunny-outline',
  Creative: 'color-palette-outline',
};

function getVibeIcon(vibe: string): keyof typeof Ionicons.glyphMap {
  return VIBE_ICON_MAP[vibe] || 'sparkles-outline';
}

function parseHeightToCm(height: string): number | null {
  if (!height) return null;
  const match = height.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.round(value * 30.48) : null;
}

function normalizeCompleteProfile(data: any, current: UserProfile): { user: UserProfile; partner: Partial<PartnerPreferences> } {
  if (!data) return { user: current, partner: {} };
  const p = data.profile || {};
  const edu = data.education || {};
  const photos = Array.isArray(data.photos) ? data.photos : [];
  const primaryPhoto = photos.find((ph: any) => ph.isPrimary) || photos[0];
  const prefs = data.datingPreferences || {};

  const langs =
    Array.isArray(data.languages) && data.languages.length > 0
      ? data.languages
          .map((l: any) => (typeof l === 'string' ? l : l.name))
          .filter(Boolean)
          .join(', ')
      : current.languages;

  const ints =
    Array.isArray(data.interests) && data.interests.length > 0
      ? data.interests.map((i: any) => (typeof i === 'string' ? i : i.name)).filter(Boolean)
      : current.interests;

  const locationParts = [p.city, p.state, p.country].filter(Boolean);
  const locationStr = locationParts.length > 0 ? locationParts.join(', ') : current.location;

  const educationStr =
    edu.educationLevel || edu.qualification
      ? [edu.educationLevel, edu.qualification].filter(Boolean).join(' - ')
      : current.education;

  const user: UserProfile = {
    ...current,
    name: p.name || current.name || 'User',
    dateOfBirth: p.dateOfBirth || current.dateOfBirth,
    gender: p.gender || current.gender,
    religion: p.religion || current.religion,
    about: p.bio !== undefined && p.bio !== null && p.bio !== '' ? p.bio : current.about,
    relationshipStatus: p.relationshipStatus || current.relationshipStatus,
    foodPreference: p.foodPreference || current.foodPreference || 'Foodie / Veg',
    drinking: p.drinking || current.drinking || 'Socially',
    smoking: p.smoking || current.smoking || 'No',
    vibes: Array.isArray(p.vibes) && p.vibes.length > 0 ? p.vibes : current.vibes,
    location: locationStr || current.location,
    profession: edu.profession || edu.occupation || current.profession,
    company: edu.companyName || current.company,
    education: educationStr || current.education,
    languages: langs || current.languages,
    interests: ints && ints.length > 0 ? ints : current.interests,
    avatarUri: primaryPhoto?.url || current.avatarUri,
  };

  const partner: Partial<PartnerPreferences> = {};
  if (prefs.maxAge) partner.maxAge = prefs.maxAge;
  if (prefs.minAge) partner.minAge = prefs.minAge;
  if (prefs.maxDistanceKm) partner.maxDistanceKm = prefs.maxDistanceKm;
  if (Array.isArray(prefs.religionPreferences) && prefs.religionPreferences.length > 0) {
    partner.religionPreferences = prefs.religionPreferences;
  }
  if (Array.isArray(prefs.relationshipIntentions) && prefs.relationshipIntentions.length > 0) {
    partner.relationshipIntentions = prefs.relationshipIntentions;
  }

  return { user, partner };
}

export default function MeScreen({ showTabBar = true, showHeaderBar = true }: MeScreenProps = {}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const [partnerPrefs, setPartnerPrefs] = useState<PartnerPreferences>(() => getStoredPartnerPreferences());
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(() => getStoredUserProfile());
  const [editPartnerForm, setEditPartnerForm] = useState<PartnerPreferences>(() => getStoredPartnerPreferences());
  const [showToast, setShowToast] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const unsubProfile = subscribeUserProfile((updated) => {
      setProfile(updated);
      setEditForm(updated);
    });

    const unsubPartner = subscribePartnerPreferences((updated) => {
      setPartnerPrefs(updated);
      setEditPartnerForm(updated);
    });

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const fullData = await getMyProfile().catch(() => null);
        if (fullData) {
          const { user, partner } = normalizeCompleteProfile(fullData, getStoredUserProfile());
          updateStoredUserProfile(user);
          setProfile(user);
          setEditForm(user);
          if (Object.keys(partner).length > 0) {
            const updatedPartner = updateStoredPartnerPreferences(partner);
            setPartnerPrefs(updatedPartner);
            setEditPartnerForm(updatedPartner);
          }
        } else {
          const backendProfile = await getCurrentProfile().catch(() => null);
          if (backendProfile) {
            const locParts = [backendProfile.city, backendProfile.state, backendProfile.country].filter(Boolean);
            const mapped = updateStoredUserProfile({
              name: backendProfile.name || profile.name,
              dateOfBirth: backendProfile.dateOfBirth || profile.dateOfBirth,
              location: locParts.length > 0 ? locParts.join(', ') : profile.location,
              about: backendProfile.bio || profile.about,
              religion: backendProfile.religion || profile.religion,
              relationshipStatus: backendProfile.relationshipStatus || profile.relationshipStatus,
              gender: backendProfile.gender || profile.gender,
            });
            setProfile(mapped);
            setEditForm(mapped);
          }
        }
      } catch (error) {
        const fallbackUser = getStoredUserProfile();
        const fallbackPartner = getStoredPartnerPreferences();
        setProfile(fallbackUser);
        setEditForm(fallbackUser);
        setPartnerPrefs(fallbackPartner);
        setEditPartnerForm(fallbackPartner);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    void loadProfile();
    return () => {
      unsubProfile();
      unsubPartner();
    };
  }, []);

  const handlePhotoSelected = async (uri: string) => {
    setImageError(false);
    const updated = updateStoredUserProfile({ avatarUri: uri });
    setProfile(updated);
    setEditForm((prev) => ({ ...prev, avatarUri: uri }));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);

    // Sync uploaded photo with backend database
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append('photo', blob, 'avatar.jpg');
      } else {
        formData.append('photo', {
          uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
      }
      const uploaded = await uploadPhotos(formData);
      if (Array.isArray(uploaded) && uploaded.length > 0 && uploaded[0].url) {
        updateStoredUserProfile({ avatarUri: uploaded[0].url });
      }
    } catch (e) {
      console.warn('Backend sync warning on photo upload:', e);
    }
  };

  // Open Edit View
  const handleOpenEdit = () => {
    setEditForm({ ...profile });
    setEditPartnerForm({ ...partnerPrefs });
    setIsEditing(true);
  };

  // Save Edit Changes
  const handleSaveEdit = async () => {
    const updated = { ...editForm };
    const updatedPartner = { ...editPartnerForm };

    try {
      const backendPayload = {
        name: updated.name,
        dateOfBirth: updated.dateOfBirth,
        gender: updated.gender || 'female',
        bio: updated.about,
        relationshipStatus: updated.relationshipStatus,
        religion: updated.religion,
        heightCm: parseHeightToCm(updated.height),
        city: updated.location?.split(',')[0]?.trim() || undefined,
        state: updated.location?.split(',')[1]?.trim() || undefined,
        country: updated.location?.split(',')[2]?.trim() || undefined,
      };

      await updateCurrentProfile(backendPayload).catch((e) => {
        console.warn('Backend sync warning on profile update:', e);
      });

      await updateEducation({
        profession: updated.profession,
        occupation: updated.profession,
        companyName: updated.company,
      }).catch((e) => {
        console.warn('Backend sync warning on education update:', e);
      });

      await updateDatingPreferences({
        maxAge: updatedPartner.maxAge,
        minAge: updatedPartner.minAge,
        maxDistanceKm: updatedPartner.maxDistanceKm,
        religionPreferences: updatedPartner.religionPreferences,
      }).catch((e) => {
        console.warn('Backend sync warning on dating preferences update:', e);
      });

      const savedUser = updateStoredUserProfile(updated);
      const savedPartner = updateStoredPartnerPreferences(updatedPartner);
      setProfile(savedUser);
      setEditForm(savedUser);
      setPartnerPrefs(savedPartner);
      setEditPartnerForm(savedPartner);
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      const fallbackUser = updateStoredUserProfile(updated);
      const fallbackPartner = updateStoredPartnerPreferences(updatedPartner);
      setProfile(fallbackUser);
      setEditForm(fallbackUser);
      setPartnerPrefs(fallbackPartner);
      setEditPartnerForm(fallbackPartner);
      setIsEditing(false);
      Alert.alert('Profile sync warning', 'Your local profile was saved, but the backend could not be reached.');
    }
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

  const avatarSource =
    profile.avatarUri?.trim() && !imageError
      ? { uri: formatApiImageUrl(profile.avatarUri) }
      : ASSET_IMAGES.userProfile;

  const editAvatarSource =
    editForm.avatarUri?.trim()
      ? { uri: formatApiImageUrl(editForm.avatarUri) }
      : (profile.avatarUri?.trim()
          ? { uri: formatApiImageUrl(profile.avatarUri) }
          : ASSET_IMAGES.userProfile);

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
              <Text style={styles.editHeaderTitle}>Edit Profile & Preferences</Text>
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
                  source={editAvatarSource}
                  style={styles.editAvatarImage}
                  contentFit="cover"
                  placeholder={ASSET_IMAGES.userProfile}
                  transition={150}
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
              <Text style={styles.editSectionTitle}>User Personal Details</Text>

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

              <View style={styles.formRowTwoColumns}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Profession</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.profession}
                    onChangeText={(val) => setEditForm({ ...editForm, profession: val })}
                    placeholder="Your occupation"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Company</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.company || ''}
                    onChangeText={(val) => setEditForm({ ...editForm, company: val })}
                    placeholder="Company name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* About Bio Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>About Me</Text>
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
              <Text style={styles.editSectionTitle}>Profile Attributes</Text>

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
              <Text style={styles.editSectionTitle}>My Interests</Text>
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

              {/* Partner Preferences Section in Edit Mode */}
              <Text style={styles.editSectionTitle}>Ideal Partner Match Preferences</Text>

              <View style={styles.formRowTwoColumns}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Partner Max Age</Text>
                  <TextInput
                    style={styles.formInput}
                    value={String(editPartnerForm.maxAge)}
                    onChangeText={(val) => {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setEditPartnerForm({ ...editPartnerForm, maxAge: num });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="35"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Max Distance (km)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={String(editPartnerForm.maxDistanceKm)}
                    onChangeText={(val) => {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setEditPartnerForm({ ...editPartnerForm, maxDistanceKm: num });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Partner Religion Preference</Text>
                <TextInput
                  style={styles.formInput}
                  value={editPartnerForm.religionPreferences?.[0] || 'Open to all'}
                  onChangeText={(val) => setEditPartnerForm({ ...editPartnerForm, religionPreferences: [val] })}
                  placeholder="Open to all, Hindu, etc."
                  placeholderTextColor="#9CA3AF"
                />
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

  const userAge = calculateAge(profile.dateOfBirth);
  const displayName = profile.name?.trim() || 'User';
  const displayLocation = profile.location?.trim() || 'Location not set';
  const displayProfession = profile.company?.trim()
    ? `${profile.profession?.trim() || 'Profession'} at ${profile.company.trim()}`
    : (profile.profession?.trim() || 'Profession not set');

  // RENDER MAIN PROFILE SCREEN
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Bar */}
        {showHeaderBar && (
          <View style={styles.topHeaderNav}>
            <View style={styles.headerIconButtonSpacer} />
            <Text style={styles.headerTitle}>My Profile</Text>
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
            <Text style={styles.toastBannerText}>Profile & preferences updated successfully!</Text>
          </View>
        )}

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoadingProfile && (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>Syncing profile…</Text>
            </View>
          )}

          {/* User Profile Card Header */}
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={avatarSource}
                style={styles.avatarImage}
                contentFit="cover"
                placeholder={ASSET_IMAGES.userProfile}
                transition={150}
                onError={() => setImageError(true)}
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
              <Text style={styles.profileName}>{displayName}, {userAge}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 4 }} />
            </View>

            {/* Subtitle Rows */}
            <View style={styles.infoSubRow}>
              <Ionicons name="location-sharp" size={15} color="#374151" />
              <Text style={styles.infoSubText}>{displayLocation}</Text>
            </View>

            <View style={styles.infoSubRow}>
              <Ionicons name="briefcase-outline" size={15} color="#374151" />
              <Text style={styles.infoSubText}>{displayProfession}</Text>
            </View>

            {/* Profile Completion Progress Bar */}
            <View style={styles.completionContainer}>
              <View style={styles.completionHeaderRow}>
                <Text style={styles.completionTitle}>Profile Completion</Text>
                <Text style={styles.completionPercentage}>100%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '100%' }]} />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.completeLinkTouch}
                onPress={handleOpenEdit}
              >
                <Text style={styles.completeLinkText}>Edit Full Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 1: About Me */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <TouchableOpacity onPress={() => router.push('/edit-about')} activeOpacity={0.7}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.aboutCard}>
              {profile.about?.trim() ? (
                <Text style={styles.aboutCardText}>{`"${profile.about.trim()}"`}</Text>
              ) : (
                <Text style={[styles.aboutCardText, { fontStyle: 'italic', color: '#6B7280' }]}>
                  No bio added yet. Tap Edit to introduce yourself to your matches!
                </Text>
              )}
            </View>
          </View>

          {/* Section 2: My Nature */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Nature</Text>
              <TouchableOpacity
                onPress={() => router.push('/edit-nature' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.vibesRow}>
              {(profile.nature && profile.nature.length > 0
                ? profile.nature
                : profile.vibes && profile.vibes.length > 0
                ? profile.vibes
                : ['Caring', 'Fun & Funny', 'Peaceful', 'Deep Talks', 'Positive']
              ).map((trait, index) => (
                <View key={index} style={styles.vibeItem}>
                  <View style={styles.vibeIconCircle}>
                    <Ionicons name={getVibeIcon(trait)} size={22} color="#0F766E" />
                  </View>
                  <Text style={styles.vibeLabel} numberOfLines={1}>
                    {trait}
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
              {(profile.lookingFor && profile.lookingFor.length > 0
                ? profile.lookingFor
                : ['Meaningful Connection']
              ).map((item, idx) => (
                <View key={idx} style={styles.lookingForPill}>
                  <Ionicons name="heart" size={16} color="#0F766E" style={{ marginRight: 6 }} />
                  <Text style={styles.lookingForPillText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section 4: Profile Details Grid (User's Own Attributes) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Personal Profile Details</Text>
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
                <Text style={styles.detailBoxValue}>{profile.education || 'Not specified'}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="language-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Languages</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.languages || 'Not specified'}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <MaterialCommunityIcons name="hands-pray" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Religion</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.religion || 'Not specified'}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="briefcase-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Profession</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.profession || 'Not specified'}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="heart-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Relationship Status</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.relationshipStatus || 'Single'}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="body-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Height</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.height || `5'10" (178 cm)`}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="restaurant-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Food Preferences</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.foodPreference || 'Foodie / Veg'}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="wine-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Drink</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.drinking || 'Socially'}</Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="cloud-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>Smoke</Text>
                </View>
                <Text style={styles.detailBoxValue}>{profile.smoking || 'No'}</Text>
              </View>
            </View>
          </View>

          {/* Section 5: My Interests (User's Own Hobbies) */}
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
              {(profile.interests && profile.interests.length > 0
                ? profile.interests
                : ['Music', 'Movies', 'Travel']
              ).map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{interest}</Text>
                  <Ionicons name="checkmark-circle" size={16} color="#00E676" style={{ marginLeft: 6 }} />
                </View>
              ))}
            </View>
          </View>

          {/* Section 6: Dedicated Ideal Partner Match Preferences */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.partnerTitleRow}>
                <Ionicons name="sparkles" size={17} color="#E11D48" />
                <Text style={[styles.sectionTitle, { color: '#BE123C' }]}>Ideal Partner Preferences</Text>
              </View>
              <TouchableOpacity onPress={handleOpenEdit} activeOpacity={0.7}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.partnerCard}>
              <View style={styles.partnerGrid}>
                <View style={styles.partnerItem}>
                  <View style={styles.partnerItemIconCircle}>
                    <Ionicons name="people-outline" size={16} color="#BE123C" />
                  </View>
                  <View style={styles.partnerItemTextWrap}>
                    <Text style={styles.partnerItemLabel}>Age Range</Text>
                    <Text style={styles.partnerItemValue}>{partnerPrefs.minAge} – {partnerPrefs.maxAge} yrs</Text>
                  </View>
                </View>

                <View style={styles.partnerItem}>
                  <View style={styles.partnerItemIconCircle}>
                    <Ionicons name="navigate-outline" size={16} color="#BE123C" />
                  </View>
                  <View style={styles.partnerItemTextWrap}>
                    <Text style={styles.partnerItemLabel}>Maximum Distance</Text>
                    <Text style={styles.partnerItemValue}>Within {partnerPrefs.maxDistanceKm} km</Text>
                  </View>
                </View>

                <View style={styles.partnerItem}>
                  <View style={styles.partnerItemIconCircle}>
                    <MaterialCommunityIcons name="hands-pray" size={16} color="#BE123C" />
                  </View>
                  <View style={styles.partnerItemTextWrap}>
                    <Text style={styles.partnerItemLabel}>Religion Preference</Text>
                    <Text style={styles.partnerItemValue}>
                      {partnerPrefs.religionPreferences && partnerPrefs.religionPreferences.length > 0
                        ? partnerPrefs.religionPreferences.join(', ')
                        : 'Open to all'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Partner Preferred Interests Chips */}
              {partnerPrefs.preferredInterests && partnerPrefs.preferredInterests.length > 0 && (
                <View style={styles.partnerInterestsWrap}>
                  <Text style={styles.partnerInterestsLabel}>Preferred Partner Interests</Text>
                  <View style={styles.partnerInterestsChipsRow}>
                    {partnerPrefs.preferredInterests.map((item, idx) => (
                      <View key={idx} style={styles.partnerInterestPill}>
                        <Ionicons name="heart" size={13} color="#E11D48" />
                        <Text style={styles.partnerInterestPillText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Section 7: Identity Verified Banner */}
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
    paddingTop: 10,
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
  headerIconButtonSpacer: {
    width: 34,
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
  loadingState: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  loadingText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DM_Sans_500Medium',
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
  partnerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  /* Partner Match Preferences Card */
  partnerCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    gap: 14,
  },
  partnerGrid: {
    gap: 10,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  partnerItemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerItemTextWrap: {
    flex: 1,
  },
  partnerItemLabel: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 11.5,
    color: '#9F1239',
  },
  partnerItemValue: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 13,
    color: '#111827',
  },
  partnerInterestsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FECDD3',
    paddingTop: 10,
    gap: 8,
  },
  partnerInterestsLabel: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 12,
    color: '#9F1239',
  },
  partnerInterestsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  partnerInterestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
    gap: 5,
  },
  partnerInterestPillText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 12,
    color: '#BE123C',
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
    fontSize: 16,
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
    marginTop: 14,
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
