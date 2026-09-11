export interface UserProfile {
  name: string;
  dateOfBirth: string; // Stored Date of Birth (YYYY-MM-DD or ISO format)
  location: string;
  profession: string;
  about: string;
  education: string;
  languages: string;
  religion: string;
  relationshipStatus: string;
  height: string;
  interests: string[];
  lookingFor: string[];
  vibes?: string[];
  avatarUri?: string;
}

/**
 * Calculates current age from a Date of Birth (string or Date).
 * Accurately checks if the birthday has occurred yet in the current year.
 */
export function calculateAge(dob: string | Date | null | undefined): number {
  if (!dob) return 23;

  let birthDate: Date;
  if (typeof dob === 'string') {
    const trimmed = dob.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        // DD/MM/YYYY
        birthDate = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10)
        );
      } else {
        birthDate = new Date(trimmed);
      }
    } else if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        // YYYY-MM-DD
        birthDate = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
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

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
  name: 'Bunny',
  dateOfBirth: getDefaultDOB(),
  location: 'Hyderabad, India',
  profession: 'Software Engineer',
  about:
    "I'm a positive and easy-going person who enjoys good conversations, music, traveling, and spending time with family and friends. Looking for someone genuine and kind to share beautiful moments with.",
  education: 'Graduation / B.Tech',
  languages: 'English, Telugu',
  religion: 'Hindu',
  relationshipStatus: 'Single',
  height: `5'10" (178 cm)`,
  interests: ['Music', 'Movies', 'Travel', 'Concerts', 'Nature', 'Gaming'],
  lookingFor: ['Serious Relationship', 'Meaningful Connection'],
  vibes: ['Movies', 'Travel', 'Food', 'Fitness', 'Music'],
};

// In-memory persistent user profile state
let storedProfile: UserProfile = { ...INITIAL_USER_PROFILE };
const listeners = new Set<(profile: UserProfile) => void>();

export function getStoredUserProfile(): UserProfile {
  return { ...storedProfile };
}

export function updateStoredUserProfile(partial: Partial<UserProfile>): UserProfile {
  storedProfile = { ...storedProfile, ...partial };
  listeners.forEach((listener) => listener({ ...storedProfile }));
  return { ...storedProfile };
}

export function subscribeUserProfile(listener: (profile: UserProfile) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
