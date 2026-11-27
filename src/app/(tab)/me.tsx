import React, { useEffect, useState } from "react";
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
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { CustomTabBar } from "@/components/CustomTabBar";
import { PhotoActionSheetModal } from "@/components/PhotoActionSheetModal";
import { ASSET_IMAGES } from "@/constants/datingData";
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
} from "@/constants/userProfile";
import {
  getMyProfile,
  getCurrentProfile,
  getSelectedLocation,
  updateCurrentProfile,
  updateEducation,
  updateDatingPreferences,
  getMyPhotos,
  uploadPhotos,
  replaceProfilePhoto,
  deleteProfilePhoto,
  getInterestsCatalog,
  updateInterests,
  type CatalogItem,
  type ProfilePhotoItem,
  type SelectedLocation,
} from "@/services/profileApi";
import { formatApiImageUrl } from "@/services/api";

interface MeScreenProps {
  showTabBar?: boolean;
  showHeaderBar?: boolean;
}

const ALL_INTEREST_OPTIONS = [
  "Music",
  "Movies",
  "Travel",
  "Concerts",
  "Nature",
  "Gaming",
  "Photography",
  "Fitness",
  "Cooking",
  "Art & Design",
];

const VIBE_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Caring: "heart-outline",
  "Fun & Funny": "happy-outline",
  Peaceful: "leaf-outline",
  "Deep Talks": "chatbubbles-outline",
  Romantic: "rose-outline",
  Adventurous: "compass-outline",
  Classy: "sparkles-outline",
  Chill: "cafe-outline",
  Positive: "sunny-outline",
  Creative: "color-palette-outline",
};

function getVibeIcon(vibe: string): keyof typeof Ionicons.glyphMap {
  return VIBE_ICON_MAP[vibe] || "sparkles-outline";
}

function parseHeightToCm(height: string): number | null {
  if (!height) return null;
  const match = height.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.round(value * 30.48) : null;
}

function normalizeCompleteProfile(
  data: any,
  current: UserProfile,
  selectedLocation: SelectedLocation | null,
): { user: UserProfile; partner: Partial<PartnerPreferences> } {
  if (!data) return { user: current, partner: {} };
  const p = data.profile || {};
  const edu = data.education || {};
  const photos = Array.isArray(data.photos) ? data.photos : [];
  const primaryPhoto = photos.find((ph: any) => ph.isPrimary) || photos[0];
  const prefs = data.datingPreferences || {};

  const langs =
    Array.isArray(data.languages) && data.languages.length > 0
      ? data.languages
          .map((l: any) => (typeof l === "string" ? l : l.name))
          .filter(Boolean)
          .join(", ")
      : current.languages;

  const ints =
    Array.isArray(data.interests) && data.interests.length > 0
      ? data.interests
          .map((i: any) => (typeof i === "string" ? i : i.name))
          .filter(Boolean)
      : current.interests;

  const locationParts = [
    selectedLocation?.city,
    selectedLocation?.state,
    selectedLocation?.country,
  ].filter(Boolean);
  const locationStr =
    locationParts.length > 0 ? locationParts.join(", ") : current.location;

  const educationStr =
    edu.educationLevel || edu.qualification
      ? [edu.educationLevel, edu.qualification].filter(Boolean).join(" - ")
      : current.education;

  const user: UserProfile = {
    ...current,
    name: p.name || current.name || "User",
    dateOfBirth: p.dateOfBirth || current.dateOfBirth,
    gender: p.gender || current.gender,
    religion: p.religion || current.religion,
    about:
      p.bio !== undefined && p.bio !== null && p.bio !== ""
        ? p.bio
        : current.about,
    relationshipStatus: p.relationshipStatus || current.relationshipStatus,
    foodPreference:
      p.foodPreference || current.foodPreference || "Foodie / Veg",
    drinking: p.drinking || current.drinking || "Socially",
    smoking: p.smoking || current.smoking || "No",
    vibes:
      Array.isArray(p.vibes) && p.vibes.length > 0 ? p.vibes : current.vibes,
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
  if (
    Array.isArray(prefs.religionPreferences) &&
    prefs.religionPreferences.length > 0
  ) {
    partner.religionPreferences = prefs.religionPreferences;
  }
  if (
    Array.isArray(prefs.relationshipIntentions) &&
    prefs.relationshipIntentions.length > 0
  ) {
    partner.relationshipIntentions = prefs.relationshipIntentions;
  }

  return { user, partner };
}

export default function MeScreen({
  showTabBar = true,
  showHeaderBar = true,
}: MeScreenProps = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>(() =>
    getStoredUserProfile(),
  );
  const [partnerPrefs, setPartnerPrefs] = useState<PartnerPreferences>(() =>
    getStoredPartnerPreferences(),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(() =>
    getStoredUserProfile(),
  );
  const [editPartnerForm, setEditPartnerForm] = useState<PartnerPreferences>(
    () => getStoredPartnerPreferences(),
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    "Profile & preferences updated successfully!",
  );
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoSheetMode, setPhotoSheetMode] = useState<
    "primary" | "add_gallery" | "replace_gallery"
  >("primary");
  const [galleryPhotos, setGalleryPhotos] = useState<ProfilePhotoItem[]>([]);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] =
    useState<ProfilePhotoItem | null>(null);
  const [showGalleryMenuModal, setShowGalleryMenuModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [galleryBusyId, setGalleryBusyId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [interestsCatalog, setInterestsCatalog] = useState<CatalogItem[]>([]);

  const availableInterests =
    interestsCatalog.length > 0
      ? interestsCatalog.map((c) => c.name)
      : ALL_INTEREST_OPTIONS;

  useEffect(() => {
    getInterestsCatalog().then((items) => {
      if (items && items.length > 0) {
        setInterestsCatalog(items);
      }
    });
  }, []);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const syncPhotosFromServer = (photosList: ProfilePhotoItem[]) => {
    const sorted = [...photosList].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
    const primary = sorted.find((p) => p.isPrimary);
    const gallery = sorted.filter((p) => !p.isPrimary).slice(0, 3);
    setGalleryPhotos(gallery);

    if (primary?.url) {
      const updated = updateStoredUserProfile({ avatarUri: primary.url });
      setProfile(updated);
      setEditForm(updated);
    }
  };

  const buildPhotoFormData = async (uri: string, filename: string) => {
    const formData = new FormData();
    if (Platform.OS === "web") {
      const res = await fetch(uri);
      const blob = await res.blob();
      formData.append("photo", blob, filename);
    } else {
      formData.append("photo", {
        uri,
        name: filename,
        type: "image/jpeg",
      } as any);
    }
    return formData;
  };

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
        const [fullData, selectedLocation] = await Promise.all([
          getMyProfile().catch(() => null),
          getSelectedLocation(),
        ]);
        if (fullData) {
          const { user, partner } = normalizeCompleteProfile(
            fullData,
            getStoredUserProfile(),
            selectedLocation,
          );
          updateStoredUserProfile(user);
          setProfile(user);
          setEditForm(user);
          if (Array.isArray(fullData.photos)) {
            syncPhotosFromServer(fullData.photos);
          }
          if (Object.keys(partner).length > 0) {
            const updatedPartner = updateStoredPartnerPreferences(partner);
            setPartnerPrefs(updatedPartner);
            setEditPartnerForm(updatedPartner);
          }
        } else {
          const [backendProfile, photosList] = await Promise.all([
            getCurrentProfile().catch(() => null),
            getMyPhotos().catch(() => [] as ProfilePhotoItem[]),
          ]);
          if (photosList.length > 0) {
            syncPhotosFromServer(photosList);
          }
          if (backendProfile) {
            const locParts = [
              selectedLocation?.city,
              selectedLocation?.state,
              selectedLocation?.country,
            ].filter(Boolean);
            const mapped = updateStoredUserProfile({
              name: backendProfile.name || profile.name,
              dateOfBirth: backendProfile.dateOfBirth || profile.dateOfBirth,
              location:
                locParts.length > 0 ? locParts.join(", ") : profile.location,
              about: backendProfile.bio || profile.about,
              religion: backendProfile.religion || profile.religion,
              relationshipStatus:
                backendProfile.relationshipStatus || profile.relationshipStatus,
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

  const openPrimaryPhotoPicker = () => {
    setPhotoSheetMode("primary");
    setSelectedGalleryPhoto(null);
    setShowPhotoModal(true);
  };

  const openAddGalleryPhotoPicker = () => {
    if (galleryPhotos.length >= 3) {
      Alert.alert(
        "Gallery Limit Reached",
        "You can keep up to 3 gallery photos. Use the three-dots menu on any photo to update or delete it.",
      );
      return;
    }
    setPhotoSheetMode("add_gallery");
    setSelectedGalleryPhoto(null);
    setShowPhotoModal(true);
  };

  const handleConfirmDeleteGalleryPhoto = async () => {
    if (!selectedGalleryPhoto) return;
    const targetId = selectedGalleryPhoto.id;
    setShowDeleteConfirmModal(false);
    setGalleryBusyId(targetId);

    try {
      await deleteProfilePhoto(targetId);
      const updatedPhotos = await getMyPhotos().catch(() =>
        galleryPhotos.filter((p) => p.id !== targetId),
      );
      syncPhotosFromServer(updatedPhotos);
      triggerToast("Gallery photo deleted!");
    } catch (e: any) {
      Alert.alert(
        "Delete Failed",
        e?.message || "Could not delete gallery photo. Please try again.",
      );
    } finally {
      setGalleryBusyId(null);
      setSelectedGalleryPhoto(null);
    }
  };

  const handlePhotoSelected = async (uri: string) => {
    if (photoSheetMode === "add_gallery") {
      setGalleryBusyId("adding");
      try {
        const formData = await buildPhotoFormData(uri, `gallery_${Date.now()}.jpg`);
        formData.append("isPrimary", "false");
        const uploaded = await uploadPhotos(formData);
        const latestPhotos = await getMyPhotos().catch(() => uploaded);
        syncPhotosFromServer(latestPhotos);
        triggerToast("Gallery photo added!");
      } catch (e: any) {
        Alert.alert(
          "Upload Failed",
          e?.message || "Could not add gallery photo. Please try another photo.",
        );
      } finally {
        setGalleryBusyId(null);
      }
      return;
    }

    if (photoSheetMode === "replace_gallery" && selectedGalleryPhoto) {
      const targetId = selectedGalleryPhoto.id;
      setGalleryBusyId(targetId);
      try {
        const formData = await buildPhotoFormData(uri, `gallery_${Date.now()}.jpg`);
        await replaceProfilePhoto(targetId, formData);
        const latestPhotos = await getMyPhotos().catch(() => []);
        if (latestPhotos.length > 0) {
          syncPhotosFromServer(latestPhotos);
        }
        triggerToast("Gallery photo updated!");
      } catch (e: any) {
        Alert.alert(
          "Update Failed",
          e?.message || "Could not update gallery photo. Please try another photo.",
        );
      } finally {
        setGalleryBusyId(null);
        setSelectedGalleryPhoto(null);
      }
      return;
    }

    // Main Profile Photo update (replaces and deletes previous main profile photo)
    const previousAvatar = profile.avatarUri;
    setImageError(false);
    const updated = updateStoredUserProfile({ avatarUri: uri });
    setProfile(updated);
    setEditForm((prev) => ({ ...prev, avatarUri: uri }));

    try {
      const formData = await buildPhotoFormData(uri, "avatar.jpg");
      formData.append("isPrimary", "true");
      const uploaded = await uploadPhotos(formData);
      const latestPhotos = await getMyPhotos().catch(() => uploaded);
      syncPhotosFromServer(latestPhotos);
      triggerToast("Main profile photo updated!");
    } catch (e: any) {
      console.warn("Backend sync warning on photo upload:", e);
      updateStoredUserProfile({ avatarUri: previousAvatar });
      setProfile((prev) => ({ ...prev, avatarUri: previousAvatar }));
      setEditForm((prev) => ({ ...prev, avatarUri: previousAvatar }));
      Alert.alert(
        "Photo Verification Failed",
        e?.message ||
          "Main profile photo must match your verified KYC selfie. Please upload a clear photo of yourself.",
      );
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
        gender: updated.gender || "female",
        bio: updated.about,
        relationshipStatus: updated.relationshipStatus,
        religion: updated.religion,
        heightCm: parseHeightToCm(updated.height),
        city: updated.location?.split(",")[0]?.trim() || undefined,
        state: updated.location?.split(",")[1]?.trim() || undefined,
        country: updated.location?.split(",")[2]?.trim() || undefined,
      };

      await updateCurrentProfile(backendPayload).catch((e) => {
        console.warn("Backend sync warning on profile update:", e);
      });

      await updateEducation({
        profession: updated.profession,
        occupation: updated.profession,
        companyName: updated.company,
      }).catch((e) => {
        console.warn("Backend sync warning on education update:", e);
      });

      await updateDatingPreferences({
        maxAge: updatedPartner.maxAge,
        minAge: updatedPartner.minAge,
        maxDistanceKm: updatedPartner.maxDistanceKm,
        religionPreferences: updatedPartner.religionPreferences,
      }).catch((e) => {
        console.warn("Backend sync warning on dating preferences update:", e);
      });

      const interestIds = updated.interests
        .map(
          (name) =>
            interestsCatalog.find(
              (c) => c.name.toLowerCase() === name.toLowerCase(),
            )?.id,
        )
        .filter((id): id is number => typeof id === "number");

      if (interestIds.length > 0) {
        await updateInterests(interestIds).catch((e) => {
          console.warn("Backend sync warning on interests update:", e);
        });
      }

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
      Alert.alert(
        "Profile sync warning",
        "Your local profile was saved, but the backend could not be reached.",
      );
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
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const avatarSource =
    profile.avatarUri?.trim() && !imageError
      ? { uri: formatApiImageUrl(profile.avatarUri) }
      : ASSET_IMAGES.userProfile;

  const editAvatarSource = editForm.avatarUri?.trim()
    ? { uri: formatApiImageUrl(editForm.avatarUri) }
    : profile.avatarUri?.trim()
      ? { uri: formatApiImageUrl(profile.avatarUri) }
      : ASSET_IMAGES.userProfile;

  const photoActionSheetModal = (
    <PhotoActionSheetModal
      visible={showPhotoModal}
      onClose={() => setShowPhotoModal(false)}
      onPhotoSelected={handlePhotoSelected}
      title={
        photoSheetMode === "primary"
          ? "Change Main Profile Photo"
          : photoSheetMode === "replace_gallery"
            ? "Update Gallery Photo"
            : "Add Gallery Photo"
      }
      subtitle={
        photoSheetMode === "primary"
          ? "Replaces your current main profile photo on Matches"
          : "Choose an option for your profile gallery"
      }
      aspect={photoSheetMode === "primary" ? [1, 1] : [4, 5]}
    />
  );

  // RENDER INTERACTIVE EDIT PROFILE SCREEN
  if (isEditing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            {/* Edit Screen Header with Back & Save */}
            <View style={styles.editHeaderNav}>
              <TouchableOpacity
                style={styles.backBtnTouch}
                onPress={handleCancelEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.editHeaderTitle}>
                Edit Profile & Preferences
              </Text>
              <TouchableOpacity
                style={styles.saveBtnTouch}
                onPress={handleSaveEdit}
                activeOpacity={0.8}
              >
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
                  onPress={openPrimaryPhotoPicker}
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
                  onChangeText={(val) =>
                    setEditForm({ ...editForm, name: val })
                  }
                  placeholder="Enter name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formRowTwoColumns}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Age</Text>
                  <TextInput
                    style={[styles.formInput, styles.readOnlyInput]}
                    value={String(
                      calculateAge(editForm.dateOfBirth || profile.dateOfBirth),
                    )}
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
                    onChangeText={(val) =>
                      setEditForm({ ...editForm, location: val })
                    }
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
                    onChangeText={(val) =>
                      setEditForm({ ...editForm, profession: val })
                    }
                    placeholder="Your occupation"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Company</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.company || ""}
                    onChangeText={(val) =>
                      setEditForm({ ...editForm, company: val })
                    }
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
                  onChangeText={(val) =>
                    setEditForm({ ...editForm, about: val })
                  }
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
                  onChangeText={(val) =>
                    setEditForm({ ...editForm, education: val })
                  }
                  placeholder="Highest qualification"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Languages</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.languages}
                  onChangeText={(val) =>
                    setEditForm({ ...editForm, languages: val })
                  }
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
                    onChangeText={(val) =>
                      setEditForm({ ...editForm, religion: val })
                    }
                    placeholder="Religion"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Height</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.height}
                    onChangeText={(val) =>
                      setEditForm({ ...editForm, height: val })
                    }
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
                  onChangeText={(val) =>
                    setEditForm({ ...editForm, relationshipStatus: val })
                  }
                  placeholder="Status"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Select Interests */}
              <Text style={styles.editSectionTitle}>My Interests</Text>
              <View style={styles.interestsSelectionWrap}>
                {availableInterests.map((item) => {
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
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#0F766E"
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Partner Preferences Section in Edit Mode */}
              <Text style={styles.editSectionTitle}>
                Ideal Partner Match Preferences
              </Text>

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
                        setEditPartnerForm({
                          ...editPartnerForm,
                          maxDistanceKm: num,
                        });
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Partner Religion Preference
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={
                    editPartnerForm.religionPreferences?.[0] || "Open to all"
                  }
                  onChangeText={(val) =>
                    setEditPartnerForm({
                      ...editPartnerForm,
                      religionPreferences: [val],
                    })
                  }
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
            {photoActionSheetModal}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const userAge = calculateAge(profile.dateOfBirth);
  const displayName = profile.name?.trim() || "User";
  const displayLocation = profile.location?.trim() || "Location not set";
  const displayProfession = profile.company?.trim()
    ? `${profile.profession?.trim() || "Profession"} at ${profile.company.trim()}`
    : profile.profession?.trim() || "Profession not set";

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
              onPress={() => router.push("/settings")}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={22} color="#0F766E" />
            </TouchableOpacity>
          </View>
        )}

        {/* Success Save Toast Banner */}
        {showToast && (
          <View style={styles.toastBanner}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.toastBannerText}>
              {toastMessage}
            </Text>
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
                onPress={openPrimaryPhotoPicker}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Name & Verified Badge */}
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>
                {displayName}, {userAge}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#3B82F6"
                style={{ marginLeft: 4 }}
              />
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
                <Text style={styles.completionTitle}>{t('profile.profileCompletion')}</Text>
                <Text style={styles.completionPercentage}>100%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: "100%" }]} />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.completeLinkTouch}
                onPress={handleOpenEdit}
              >
                <Text style={styles.completeLinkText}>{t('profile.editFullProfile')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Gallery Section (Up to 3 Additional Photos) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.galleryTitleRow}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <View style={styles.galleryCountBadge}>
                  <Text style={styles.galleryCountText}>
                    {galleryPhotos.length}/3
                  </Text>
                </View>
              </View>
              {galleryPhotos.length < 3 && (
                <TouchableOpacity
                  onPress={openAddGalleryPhotoPicker}
                  activeOpacity={0.75}
                >
                  <Text style={styles.editText}>+ Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.galleryGrid}>
              {[0, 1, 2].map((slotIdx) => {
                const photo = galleryPhotos[slotIdx];
                if (photo) {
                  const isBusy = galleryBusyId === photo.id;
                  return (
                    <View key={photo.id} style={styles.galleryCard}>
                      <Image
                        source={{ uri: formatApiImageUrl(photo.url) }}
                        style={styles.galleryImage}
                        contentFit="cover"
                        transition={150}
                      />
                      <TouchableOpacity
                        style={styles.galleryDotsButton}
                        onPress={() => {
                          setSelectedGalleryPhoto(photo);
                          setShowGalleryMenuModal(true);
                        }}
                        activeOpacity={0.8}
                        disabled={isBusy}
                        accessibilityLabel={`Manage gallery photo ${slotIdx + 1}`}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={15}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                      {isBusy && (
                        <View style={styles.galleryBusyOverlay}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  );
                }

                const isAddingSlot =
                  slotIdx === galleryPhotos.length && galleryBusyId === "adding";
                return (
                  <TouchableOpacity
                    key={`empty-slot-${slotIdx}`}
                    style={styles.galleryEmptyCard}
                    onPress={openAddGalleryPhotoPicker}
                    activeOpacity={0.75}
                    disabled={galleryBusyId !== null}
                  >
                    {isAddingSlot ? (
                      <ActivityIndicator size="small" color="#0F766E" />
                    ) : (
                      <>
                        <View style={styles.galleryAddIconCircle}>
                          <Ionicons name="add" size={20} color="#0F766E" />
                        </View>
                        <Text style={styles.galleryAddText}>Add Photo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.galleryHelperText}>
              These gallery photos appear after your main profile photo on the Matches screen.
            </Text>
          </View>

          {/* Section 1: About Me */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('profile.aboutMe')}</Text>
              <TouchableOpacity
                onPress={() => router.push("/edit-about")}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.aboutCard}>
              {profile.about?.trim() ? (
                <Text
                  style={styles.aboutCardText}
                >{`"${profile.about.trim()}"`}</Text>
              ) : (
                <Text
                  style={[
                    styles.aboutCardText,
                    { fontStyle: "italic", color: "#6B7280" },
                  ]}
                >
                  {t('profile.noBioYet')}
                </Text>
              )}
            </View>
          </View>

          {/* Section 2: My Nature */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('profile.myNature')}</Text>
              <TouchableOpacity
                onPress={() => router.push("/edit-nature" as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.vibesRow}>
              {(profile.nature && profile.nature.length > 0
                ? profile.nature
                : profile.vibes && profile.vibes.length > 0
                  ? profile.vibes
                  : [
                      "Caring",
                      "Fun & Funny",
                      "Peaceful",
                      "Deep Talks",
                      "Positive",
                    ]
              ).map((trait, index) => (
                <View key={index} style={styles.vibeItem}>
                  <View style={styles.vibeIconCircle}>
                    <Ionicons
                      name={getVibeIcon(trait)}
                      size={22}
                      color="#0F766E"
                    />
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
              <Text style={styles.sectionTitle}>{t('profile.lookingFor')}</Text>
              <TouchableOpacity
                onPress={() => router.push("/edit-looking-for")}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lookingForChipsContainer}>
              {(profile.lookingFor && profile.lookingFor.length > 0
                ? profile.lookingFor
                : ["Meaningful Connection"]
              ).map((item, idx) => (
                <View key={idx} style={styles.lookingForPill}>
                  <Ionicons
                    name="heart"
                    size={16}
                    color="#0F766E"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.lookingForPillText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section 4: Profile Details Grid (User's Own Attributes) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('profile.personalDetails')}</Text>
              <TouchableOpacity
                onPress={() => router.push("/edit-details")}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="school-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>{t('profile.education')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.education || t('profile.notSpecified')}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="language-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>{t('profile.languages')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.languages || t('profile.notSpecified')}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <MaterialCommunityIcons
                    name="hands-pray"
                    size={18}
                    color="#0F766E"
                  />
                  <Text style={styles.detailBoxTitle}>{t('profile.religion')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.religion || t('profile.notSpecified')}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons
                    name="briefcase-outline"
                    size={18}
                    color="#0F766E"
                  />
                  <Text style={styles.detailBoxTitle}>{t('profile.profession')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.profession || t('profile.notSpecified')}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="heart-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>{t('profile.relationshipStatus')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.relationshipStatus || "Single"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="body-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>{t('profile.height')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.height || `5'10" (178 cm)`}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons
                    name="restaurant-outline"
                    size={18}
                    color="#0F766E"
                  />
                  <Text style={styles.detailBoxTitle}>{t('profile.foodPreferences')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.foodPreference || "Foodie / Veg"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="wine-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>{t('profile.drink')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.drinking || "Socially"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailBoxHeader}>
                  <Ionicons name="cloud-outline" size={18} color="#0F766E" />
                  <Text style={styles.detailBoxTitle}>{t('profile.smoke')}</Text>
                </View>
                <Text style={styles.detailBoxValue}>
                  {profile.smoking || "No"}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 5: My Interests (User's Own Hobbies) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('profile.myInterests')}</Text>
              <TouchableOpacity
                onPress={() => router.push("/edit-interests")}
                activeOpacity={0.7}
              >
                <Text style={styles.editText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.interestsWrap}>
              {(profile.interests && profile.interests.length > 0
                ? profile.interests
                : ["Music", "Movies", "Travel"]
              ).map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{interest}</Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#00E676"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Section 6: Dedicated Ideal Partner Match Preferences */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.partnerTitleRow}>
                <Ionicons name="sparkles" size={17} color="#E11D48" />
                <Text style={[styles.sectionTitle, { color: "#BE123C" }]}>
                  {t('profile.idealPartnerPreferences')}
                </Text>
              </View>
              <TouchableOpacity onPress={handleOpenEdit} activeOpacity={0.7}>
                <Text style={styles.editText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.partnerCard}>
              <View style={styles.partnerGrid}>
                <View style={styles.partnerItem}>
                  <View style={styles.partnerItemIconCircle}>
                    <Ionicons name="people-outline" size={16} color="#BE123C" />
                  </View>
                  <View style={styles.partnerItemTextWrap}>
                    <Text style={styles.partnerItemLabel}>{t('profile.ageRange')}</Text>
                    <Text style={styles.partnerItemValue}>
                      {partnerPrefs.minAge} – {partnerPrefs.maxAge} yrs
                    </Text>
                  </View>
                </View>

                <View style={styles.partnerItem}>
                  <View style={styles.partnerItemIconCircle}>
                    <Ionicons
                      name="navigate-outline"
                      size={16}
                      color="#BE123C"
                    />
                  </View>
                  <View style={styles.partnerItemTextWrap}>
                    <Text style={styles.partnerItemLabel}>
                      {t('profile.maxDistance')}
                    </Text>
                    <Text style={styles.partnerItemValue}>
                      {t('profile.withinDistance', { distance: partnerPrefs.maxDistanceKm })}
                    </Text>
                  </View>
                </View>

                <View style={styles.partnerItem}>
                  <View style={styles.partnerItemIconCircle}>
                    <MaterialCommunityIcons
                      name="hands-pray"
                      size={16}
                      color="#BE123C"
                    />
                  </View>
                  <View style={styles.partnerItemTextWrap}>
                    <Text style={styles.partnerItemLabel}>
                      {t('profile.religionPreference')}
                    </Text>
                    <Text style={styles.partnerItemValue}>
                      {partnerPrefs.religionPreferences &&
                      partnerPrefs.religionPreferences.length > 0
                        ? partnerPrefs.religionPreferences.join(", ")
                        : t('profile.openToAll')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Partner Preferred Interests Chips */}
              {partnerPrefs.preferredInterests &&
                partnerPrefs.preferredInterests.length > 0 && (
                  <View style={styles.partnerInterestsWrap}>
                    <Text style={styles.partnerInterestsLabel}>
                      {t('profile.preferredInterests')}
                    </Text>
                    <View style={styles.partnerInterestsChipsRow}>
                      {partnerPrefs.preferredInterests.map((item, idx) => (
                        <View key={idx} style={styles.partnerInterestPill}>
                          <Ionicons name="heart" size={13} color="#E11D48" />
                          <Text style={styles.partnerInterestPillText}>
                            {item}
                          </Text>
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
              <Text style={styles.verifiedBannerTitle}>{t('profile.identityVerified')}</Text>
              <Text style={styles.verifiedBannerSubtitle}>
                {t('profile.identityVerifiedSubtitle')}
              </Text>
            </View>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#166534"
            />
          </View>
        </ScrollView>

        {/* Photo Picker Action Sheet Modal */}
        {photoActionSheetModal}

        {/* Three-dots Gallery Photo Options Sheet */}
        <Modal
          visible={showGalleryMenuModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGalleryMenuModal(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setShowGalleryMenuModal(false)}
          >
            <View style={styles.sheetBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.gallerySheetContainer}>
                  <View style={styles.gallerySheetHandle} />
                  <View style={styles.gallerySheetHeaderRow}>
                    {selectedGalleryPhoto?.url ? (
                      <Image
                        source={{
                          uri: formatApiImageUrl(selectedGalleryPhoto.url),
                        }}
                        style={styles.gallerySheetThumb}
                        contentFit="cover"
                      />
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gallerySheetTitle}>
                        Gallery Photo
                      </Text>
                      <Text style={styles.gallerySheetSubtitle}>
                        Update or remove this photo from your Matches gallery
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.galleryMenuOption}
                    activeOpacity={0.75}
                    onPress={() => {
                      setShowGalleryMenuModal(false);
                      setPhotoSheetMode("replace_gallery");
                      setShowPhotoModal(true);
                    }}
                  >
                    <View
                      style={[
                        styles.galleryMenuIconCircle,
                        { backgroundColor: "#E6FFFA" },
                      ]}
                    >
                      <Ionicons
                        name="images-outline"
                        size={20}
                        color="#0F766E"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.galleryMenuOptionTitle}>
                        Update Photo
                      </Text>
                      <Text style={styles.galleryMenuOptionSub}>
                        Replace with a new photo from camera or library
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.galleryMenuOption}
                    activeOpacity={0.75}
                    onPress={() => {
                      setShowGalleryMenuModal(false);
                      setShowDeleteConfirmModal(true);
                    }}
                  >
                    <View
                      style={[
                        styles.galleryMenuIconCircle,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#DC2626"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.galleryMenuOptionTitle,
                          { color: "#DC2626" },
                        ]}
                      >
                        Delete Photo
                      </Text>
                      <Text style={styles.galleryMenuOptionSub}>
                        Remove permanently from your profile & Matches
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.gallerySheetCancelBtn}
                    onPress={() => setShowGalleryMenuModal(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.gallerySheetCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Confirm Delete Gallery Photo Modal */}
        <Modal
          visible={showDeleteConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirmModal(false)}
        >
          <View style={styles.confirmBackdrop}>
            <View style={styles.confirmCard}>
              <View style={styles.confirmIconCircle}>
                <Ionicons name="trash-outline" size={24} color="#DC2626" />
              </View>
              <Text style={styles.confirmTitle}>Delete Gallery Photo?</Text>
              <Text style={styles.confirmMessage}>
                This photo will be removed from your Me gallery and your Matches profile cards.
              </Text>
              <View style={styles.confirmActionsRow}>
                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  onPress={() => setShowDeleteConfirmModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteBtn}
                  onPress={handleConfirmDeleteGalleryPhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {showTabBar && <CustomTabBar />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
  },
  topHeaderNav: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  headerIconButtonSpacer: {
    width: 34,
  },
  headerIconButton: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  toastBanner: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    elevation: 4,
  },
  toastBannerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
  },
  loadingState: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  loadingText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "DM_Sans_500Medium",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  /* Profile Header Card */
  profileHeaderCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F1F5F9",
  },
  cameraEditBadge: {
    position: "absolute",
    bottom: 2,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profileName: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  infoSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  infoSubText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13,
    color: "#4B5563",
  },
  /* Completion Progress Bar */
  completionContainer: {
    width: "100%",
    marginTop: 18,
    backgroundColor: "#FAFAFA",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  completionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  completionTitle: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  completionPercentage: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 13,
    fontWeight: "700",
    color: "#0F766E",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0F766E",
    borderRadius: 4,
  },
  completeLinkTouch: {
    alignSelf: "flex-end",
  },
  completeLinkText: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 12,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  /* Section Layouts */
  sectionContainer: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  partnerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  editText: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 13,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  /* About Card */
  aboutCard: {
    backgroundColor: "#E6FFFA",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  aboutCardText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13.5,
    lineHeight: 20,
    color: "#1F2937",
  },
  /* Vibes Row */
  vibesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vibeItem: {
    alignItems: "center",
    width: "18%",
  },
  vibeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6FFFA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  vibeLabel: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 11.5,
    fontWeight: "600",
    color: "#374151",
  },
  /* Looking For */
  lookingForChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  lookingForPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FFFA",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  lookingForPillText: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 13,
    fontWeight: "600",
    color: "#0F766E",
  },
  /* Details Grid */
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailBox: {
    width: "48%",
    backgroundColor: "#E6FFFA",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  detailBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  detailBoxTitle: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  detailBoxValue: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
    color: "#4B5563",
    marginLeft: 24,
  },
  /* Interests Wrap */
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  interestChipText: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 13,
    color: "#374151",
  },
  /* Partner Match Preferences Card */
  partnerCard: {
    backgroundColor: "#FFF1F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    gap: 14,
  },
  partnerGrid: {
    gap: 10,
  },
  partnerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  partnerItemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE4E6",
    justifyContent: "center",
    alignItems: "center",
  },
  partnerItemTextWrap: {
    flex: 1,
  },
  partnerItemLabel: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 11.5,
    color: "#9F1239",
  },
  partnerItemValue: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 13,
    color: "#111827",
  },
  partnerInterestsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#FECDD3",
    paddingTop: 10,
    gap: 8,
  },
  partnerInterestsLabel: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 12,
    color: "#9F1239",
  },
  partnerInterestsChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  partnerInterestPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECDD3",
    gap: 5,
  },
  partnerInterestPillText: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 12,
    color: "#BE123C",
  },
  /* Identity Verified Banner */
  verifiedBannerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 12,
  },
  verifiedLeftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#BBF7D0",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedTextContainer: {
    flex: 1,
  },
  verifiedBannerTitle: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 2,
  },
  verifiedBannerSubtitle: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11.5,
    color: "#15803D",
    lineHeight: 16,
  },
  /* EDIT PROFILE SCREEN STYLES */
  editHeaderNav: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtnTouch: {
    padding: 6,
  },
  editHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "DM_Sans_700Bold",
  },
  saveBtnTouch: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E6FFFA",
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F766E",
    fontFamily: "DM_Sans_700Bold",
  },
  editScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  editAvatarRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  editAvatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: "#F1F5F9",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FFFA",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    gap: 6,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F766E",
  },
  editSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "DM_Sans_700Bold",
    marginTop: 14,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRowTwoColumns: {
    flexDirection: "row",
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    fontFamily: "DM_Sans_500Medium",
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    fontFamily: "DM_Sans_400Regular",
  },
  readOnlyInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    borderColor: "#E5E7EB",
  },
  multilineInput: {
    height: 90,
    paddingTop: 10,
  },
  interestsSelectionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  editInterestChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editInterestChipSelected: {
    backgroundColor: "#E6FFFA",
    borderColor: "#0F766E",
  },
  editInterestText: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "DM_Sans_400Regular",
  },
  editInterestTextSelected: {
    color: "#0F766E",
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
  },
  fullSaveButton: {
    backgroundColor: "#0F766E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fullSaveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "DM_Sans_700Bold",
  },
  /* Gallery Section Styles */
  galleryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  galleryCountBadge: {
    backgroundColor: "#E6FFFA",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  galleryCountText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0F766E",
    fontFamily: "DM_Sans_700Bold",
  },
  galleryGrid: {
    flexDirection: "row",
    gap: 10,
  },
  galleryCard: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryDotsButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryBusyOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryEmptyCard: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 6,
  },
  galleryAddIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E6FFFA",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryAddText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#0F766E",
    fontFamily: "DM_Sans_500Medium",
  },
  galleryHelperText: {
    marginTop: 8,
    fontSize: 11.5,
    color: "#64748B",
    fontFamily: "DM_Sans_400Regular",
  },
  /* Gallery Three-Dots Menu Sheet & Confirm Modal */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  gallerySheetContainer: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  gallerySheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 14,
  },
  gallerySheetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  gallerySheetThumb: {
    width: 48,
    height: 58,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  gallerySheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "DM_Sans_700Bold",
  },
  gallerySheetSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    fontFamily: "DM_Sans_400Regular",
    marginTop: 2,
  },
  galleryMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 12,
  },
  galleryMenuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryMenuOptionTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "DM_Sans_700Bold",
  },
  galleryMenuOptionSub: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "DM_Sans_400Regular",
    marginTop: 1,
  },
  gallerySheetCancelBtn: {
    marginTop: 4,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  gallerySheetCancelText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#475569",
    fontFamily: "DM_Sans_700Bold",
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  confirmIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "DM_Sans_700Bold",
    marginBottom: 6,
  },
  confirmMessage: {
    fontSize: 13.5,
    color: "#6B7280",
    fontFamily: "DM_Sans_400Regular",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },
  confirmActionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "DM_Sans_700Bold",
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DM_Sans_700Bold",
  },
});
