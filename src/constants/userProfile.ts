import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const PROFILE_STORAGE_KEY = "user_profile_data.json";
const PARTNER_STORAGE_KEY = "partner_preferences_data.json";
const ONBOARDING_PROFILE_DRAFT_KEY = "onboarding_profile_draft.json";
const ONBOARDING_PARTNER_DRAFT_KEY = "onboarding_partner_draft.json";

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
  incomeRange?: string;
  qualification?: string;
  study?: string;
  studyOtherText?: string;
  locationCity?: string | null;
  locationSearchQuery?: string;
  locationId?: string | null;
  locationPlaceId?: string | null;
  verificationDocType?: string;
  govIdUploaded?: boolean;
  govIdUri?: string | null;
  govIdMethod?: "upload" | "camera" | null;
  selfieVerified?: boolean;
  selfieUri?: string | null;
  photos?: (string | null)[];
  selectedPlan?: "monthly" | "yearly";
}

export interface PartnerPreferences {
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  maxDistanceLabel?: string;
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

function omitUndefined<T extends Record<string, any>>(
  partial: Partial<T>,
): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const key of Object.keys(partial) as (keyof T)[]) {
    if (partial[key] !== undefined) {
      cleaned[key] = partial[key];
    }
  }
  return cleaned;
}

function loadPersistedJson<T>(
  key: string,
  onSync: (parsed: T) => void,
  onAsync: (parsed: T) => void,
) {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          onSync(JSON.parse(raw));
        }
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${key}`;
      FileSystem.readAsStringAsync(filePath)
        .then((raw) => {
          if (raw) {
            onAsync(JSON.parse(raw));
          }
        })
        .catch(() => {});
    }
  } catch {}
}

function persistJson(key: string, value: unknown) {
  try {
    const serialized = JSON.stringify(value);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, serialized);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${key}`;
      FileSystem.writeAsStringAsync(filePath, serialized).catch(() => {});
    }
  } catch {}
}

function removePersistedJson(key: string) {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${key}`;
      FileSystem.deleteAsync(filePath, { idempotent: true }).catch(() => {});
    }
  } catch {}
}

// In-memory persistent user profile state
let storedProfile: UserProfile = { ...INITIAL_USER_PROFILE };
let onboardingProfileDraft: Partial<UserProfile> = {};
let hasProfileSessionWrites = false;
const userProfileListeners = new Set<(profile: UserProfile) => void>();

loadPersistedJson<Partial<UserProfile>>(
  PROFILE_STORAGE_KEY,
  (parsed) => {
    storedProfile = { ...INITIAL_USER_PROFILE, ...parsed };
  },
  (parsed) => {
    if (hasProfileSessionWrites) return;
    storedProfile = { ...INITIAL_USER_PROFILE, ...parsed };
    userProfileListeners.forEach((listener) => listener({ ...storedProfile }));
  },
);

loadPersistedJson<Partial<UserProfile>>(
  ONBOARDING_PROFILE_DRAFT_KEY,
  (parsed) => {
    onboardingProfileDraft = omitUndefined(parsed);
  },
  (parsed) => {
    if (hasProfileSessionWrites) return;
    onboardingProfileDraft = omitUndefined(parsed);
  },
);

export function getStoredUserProfile(): UserProfile {
  return { ...storedProfile };
}

export function getOnboardingProfileDraft(): Partial<UserProfile> {
  return { ...onboardingProfileDraft };
}

export function updateStoredUserProfile(
  partial: Partial<UserProfile>,
): UserProfile {
  hasProfileSessionWrites = true;
  const cleanPartial = omitUndefined(partial);
  storedProfile = { ...storedProfile, ...cleanPartial };
  userProfileListeners.forEach((listener) => listener({ ...storedProfile }));
  persistJson(PROFILE_STORAGE_KEY, storedProfile);
  return { ...storedProfile };
}

export function updateOnboardingProfileDraft(
  partial: Partial<UserProfile>,
): UserProfile {
  hasProfileSessionWrites = true;
  const cleanPartial = omitUndefined(partial);
  onboardingProfileDraft = { ...onboardingProfileDraft, ...cleanPartial };
  persistJson(ONBOARDING_PROFILE_DRAFT_KEY, onboardingProfileDraft);
  return updateStoredUserProfile(cleanPartial);
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
let onboardingPartnerDraft: Partial<PartnerPreferences> = {};
let hasPartnerSessionWrites = false;
const partnerPreferencesListeners = new Set<
  (prefs: PartnerPreferences) => void
>();

loadPersistedJson<Partial<PartnerPreferences>>(
  PARTNER_STORAGE_KEY,
  (parsed) => {
    storedPartnerPreferences = { ...INITIAL_PARTNER_PREFERENCES, ...parsed };
  },
  (parsed) => {
    if (hasPartnerSessionWrites) return;
    storedPartnerPreferences = { ...INITIAL_PARTNER_PREFERENCES, ...parsed };
    partnerPreferencesListeners.forEach((listener) =>
      listener({ ...storedPartnerPreferences }),
    );
  },
);

loadPersistedJson<Partial<PartnerPreferences>>(
  ONBOARDING_PARTNER_DRAFT_KEY,
  (parsed) => {
    onboardingPartnerDraft = omitUndefined(parsed);
  },
  (parsed) => {
    if (hasPartnerSessionWrites) return;
    onboardingPartnerDraft = omitUndefined(parsed);
  },
);

export function getStoredPartnerPreferences(): PartnerPreferences {
  return { ...storedPartnerPreferences };
}

export function getOnboardingPartnerDraft(): Partial<PartnerPreferences> {
  return { ...onboardingPartnerDraft };
}

export function updateStoredPartnerPreferences(
  partial: Partial<PartnerPreferences>,
): PartnerPreferences {
  hasPartnerSessionWrites = true;
  const cleanPartial = omitUndefined(partial);
  storedPartnerPreferences = { ...storedPartnerPreferences, ...cleanPartial };
  partnerPreferencesListeners.forEach((listener) =>
    listener({ ...storedPartnerPreferences }),
  );
  persistJson(PARTNER_STORAGE_KEY, storedPartnerPreferences);
  return { ...storedPartnerPreferences };
}

export function updateOnboardingPartnerDraft(
  partial: Partial<PartnerPreferences>,
): PartnerPreferences {
  hasPartnerSessionWrites = true;
  const cleanPartial = omitUndefined(partial);
  onboardingPartnerDraft = { ...onboardingPartnerDraft, ...cleanPartial };
  persistJson(ONBOARDING_PARTNER_DRAFT_KEY, onboardingPartnerDraft);
  return updateStoredPartnerPreferences(cleanPartial);
}

export function subscribePartnerPreferences(
  listener: (prefs: PartnerPreferences) => void,
): () => void {
  partnerPreferencesListeners.add(listener);
  return () => {
    partnerPreferencesListeners.delete(listener);
  };
}

export function resetOnboardingDrafts(): void {
  hasProfileSessionWrites = true;
  hasPartnerSessionWrites = true;
  storedProfile = { ...INITIAL_USER_PROFILE };
  storedPartnerPreferences = { ...INITIAL_PARTNER_PREFERENCES };
  onboardingProfileDraft = {};
  onboardingPartnerDraft = {};
  removePersistedJson(PROFILE_STORAGE_KEY);
  removePersistedJson(PARTNER_STORAGE_KEY);
  removePersistedJson(ONBOARDING_PROFILE_DRAFT_KEY);
  removePersistedJson(ONBOARDING_PARTNER_DRAFT_KEY);
  userProfileListeners.forEach((listener) => listener({ ...storedProfile }));
  partnerPreferencesListeners.forEach((listener) =>
    listener({ ...storedPartnerPreferences }),
  );
}
