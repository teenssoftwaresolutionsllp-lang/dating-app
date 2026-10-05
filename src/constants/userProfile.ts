import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const PROFILE_STORAGE_KEY = "user_profile_data.json";
const PARTNER_STORAGE_KEY = "partner_preferences_data.json";

export interface UserProfile {
  name: string;
  dateOfBirth: string; // Stored Date of Birth (YYYY-MM-DD or ISO format)
  location: string;
  profession: string;
  company?: string;
  about: string;
  education: string;
  languages: string;
  religion: string;
  relationshipStatus: string;
  height: string;
  foodPreference?: string;
  drinking?: string;
  smoking?: string;
  interests: string[];
  lookingFor: string[];
  vibes?: string[];
  nature?: string[];
  avatarUri?: string;
  gender?: string;
}

export interface PartnerPreferences {
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  religionPreferences: string[];
  preferredInterests: string[];
  relationshipIntentions: string[];
}

/**
 * Calculates current age from a Date of Birth (string or Date).
 * Accurately checks if the birthday has occurred yet in the current year.
 */
export function calculateAge(dob: string | Date | null | undefined): number {
  if (!dob) return 23;

  let birthDate: Date;
  if (typeof dob === "string") {
    const trimmed = dob.trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      if (parts.length === 3) {
        // DD/MM/YYYY
        birthDate = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10),
        );
      } else {
        birthDate = new Date(trimmed);
      }
    } else if (trimmed.includes("-")) {
      const parts = trimmed.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        // YYYY-MM-DD
        birthDate = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10),
        );
      } else {
        birthDate = new Date(trimmed);
      }
    } else {
      birthDate = new Date(trimmed);
    }
  } else {
    birthDate = dob;
  }

  if (isNaN(birthDate.getTime())) {
    return 23;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : 23;
}

// Generate default Date of Birth so that it evaluates to age 23
const getDefaultDOB = (): string => {
  const now = new Date();
  const birthYear = now.getFullYear() - 23;
  return `${birthYear}-05-15`;
};

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Bunny",
  dateOfBirth: getDefaultDOB(),
  location: "Hyderabad, India",
  profession: "Software Engineer",
  about: "",
  education: "Graduation / B.Tech",
  languages: "English, Telugu",
  religion: "Hindu",
  relationshipStatus: "Single",
  height: `5'10" (178 cm)`,
  foodPreference: "",
  drinking: "",
  smoking: "",
  interests: ["Music", "Movies", "Travel", "Concerts", "Nature", "Gaming"],
  lookingFor: ["Serious Relationship", "Meaningful Connection"],
  vibes: [],
  nature: [],
};

export const INITIAL_PARTNER_PREFERENCES: PartnerPreferences = {
  minAge: 18,
  maxAge: 35,
  maxDistanceKm: 50,
  religionPreferences: ["Hindu"],
  preferredInterests: ["Music", "Movies", "Travel", "Food"],
  relationshipIntentions: ["Serious Relationship"],
};

// In-memory persistent user profile state
let storedProfile: UserProfile = { ...INITIAL_USER_PROFILE };
const userProfileListeners = new Set<(profile: UserProfile) => void>();

// Load persisted profile synchronously on Web or asynchronously on Native
function loadPersistedProfile() {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          storedProfile = { ...INITIAL_USER_PROFILE, ...parsed };
        }
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${PROFILE_STORAGE_KEY}`;
      FileSystem.readAsStringAsync(filePath)
        .then((raw) => {
          if (raw) {
            const parsed = JSON.parse(raw);
            storedProfile = { ...INITIAL_USER_PROFILE, ...parsed };
            userProfileListeners.forEach((listener) =>
              listener({ ...storedProfile }),
            );
          }
        })
        .catch(() => {});
    }
  } catch {}
}

loadPersistedProfile();

export function getStoredUserProfile(): UserProfile {
  return { ...storedProfile };
}

export function updateStoredUserProfile(
  partial: Partial<UserProfile>,
): UserProfile {
  storedProfile = { ...storedProfile, ...partial };
  userProfileListeners.forEach((listener) => listener({ ...storedProfile }));

  // Persist to storage
  try {
    const serialized = JSON.stringify(storedProfile);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, serialized);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${PROFILE_STORAGE_KEY}`;
      FileSystem.writeAsStringAsync(filePath, serialized).catch(() => {});
    }
  } catch {}

  return { ...storedProfile };
}

export function subscribeUserProfile(
  listener: (profile: UserProfile) => void,
): () => void {
  userProfileListeners.add(listener);
  return () => {
    userProfileListeners.delete(listener);
  };
}

// In-memory persistent partner preferences state
let storedPartnerPreferences: PartnerPreferences = {
  ...INITIAL_PARTNER_PREFERENCES,
};
const partnerPreferencesListeners = new Set<
  (prefs: PartnerPreferences) => void
>();

function loadPersistedPartnerPreferences() {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(PARTNER_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          storedPartnerPreferences = {
            ...INITIAL_PARTNER_PREFERENCES,
            ...parsed,
          };
        }
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${PARTNER_STORAGE_KEY}`;
      FileSystem.readAsStringAsync(filePath)
        .then((raw) => {
          if (raw) {
            const parsed = JSON.parse(raw);
            storedPartnerPreferences = {
              ...INITIAL_PARTNER_PREFERENCES,
              ...parsed,
            };
            partnerPreferencesListeners.forEach((listener) =>
              listener({ ...storedPartnerPreferences }),
            );
          }
        })
        .catch(() => {});
    }
  } catch {}
}

loadPersistedPartnerPreferences();

export function getStoredPartnerPreferences(): PartnerPreferences {
  return { ...storedPartnerPreferences };
}

export function updateStoredPartnerPreferences(
  partial: Partial<PartnerPreferences>,
): PartnerPreferences {
  storedPartnerPreferences = { ...storedPartnerPreferences, ...partial };
  partnerPreferencesListeners.forEach((listener) =>
    listener({ ...storedPartnerPreferences }),
  );

  // Persist to storage
  try {
    const serialized = JSON.stringify(storedPartnerPreferences);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(PARTNER_STORAGE_KEY, serialized);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${PARTNER_STORAGE_KEY}`;
      FileSystem.writeAsStringAsync(filePath, serialized).catch(() => {});
    }
  } catch {}

  return { ...storedPartnerPreferences };
}

export function subscribePartnerPreferences(
  listener: (prefs: PartnerPreferences) => void,
): () => void {
  partnerPreferencesListeners.add(listener);
  return () => {
    partnerPreferencesListeners.delete(listener);
  };
}
