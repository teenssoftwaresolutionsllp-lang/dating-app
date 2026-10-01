import { apiRequest } from "./api";

export interface BackendProfile {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string | null;
  gender: string;
  religion?: string | null;
  heightCm?: number | null;
  bio?: string | null;
  relationshipStatus?: string | null;
  foodPreference?: string | null;
  drinking?: string | null;
  smoking?: string | null;
  vibes?: string[] | null;
  nature?: string[] | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationData {
  educationLevel?: string;
  qualification?: string;
  profession?: string;
  occupation?: string;
  companyName?: string;
  incomeRange?: string;
}

export interface DatingPreferencesData {
  minAge?: number;
  maxAge?: number;
  maxDistanceKm?: number;
  preferredGenders?: string[];
  preferredInterestIds?: number[];
  relationshipIntentions?: string[];
  religionPreferences?: string[];
  communityPreferences?: string[];
  verifiedOnly?: boolean;
}

export interface CatalogItem {
  id: number;
  name: string;
  category?: string;
}

export interface PopularLocationRecord {
  locationId: string;
  name: string;
}

export interface LocationSuggestion {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
}

export async function getPopularLocations(): Promise<PopularLocationRecord[]> {
  try {
    return await apiRequest<PopularLocationRecord[]>(
      "/api/v1/locations/popular",
    );
  } catch {
    return [];
  }
}

export async function autocompleteLocation(
  input: string,
): Promise<LocationSuggestion[]> {
  try {
    return await apiRequest<LocationSuggestion[]>(
      "/api/v1/locations/autocomplete",
      {
        method: "POST",
        body: JSON.stringify({ input }),
      },
    );
  } catch {
    return [];
  }
}

export async function savePopularLocation(locationId: string) {
  return apiRequest("/api/v1/users/me/location/selection", {
    method: "POST",
    body: JSON.stringify({ locationId }),
  });
}

export async function saveGoogleLocation(placeId: string) {
  return apiRequest("/api/v1/users/me/location", {
    method: "POST",
    body: JSON.stringify({ placeId }),
  });
}

// 1. Core Profile
export async function getCurrentProfile(): Promise<BackendProfile | null> {
  const payload = await apiRequest<{ profile: BackendProfile | null }>(
    "/api/v1/profile/me",
    {
      method: "GET",
    },
  );
  return payload.profile ?? null;
}

export async function getMyProfile(): Promise<any> {
  return apiRequest("/api/v1/profile/my-profile", {
    method: "GET",
    cache: "no-store",
  });
}

export async function updateCurrentProfile(
  payload: Partial<BackendProfile> & { location?: string },
): Promise<BackendProfile | null> {
  const response = await apiRequest<{ profile: BackendProfile | null }>(
    "/api/v1/profile/update-profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return response.profile ?? null;
}

// 2. Catalogs (Languages & Interests)
export async function getLanguagesCatalog(): Promise<CatalogItem[]> {
  try {
    const data = await apiRequest<{ languages: CatalogItem[] }>(
      "/api/v1/profile/languages",
    );
    return data.languages ?? [];
  } catch {
    return [];
  }
}

export async function getInterestsCatalog(): Promise<CatalogItem[]> {
  try {
    const data = await apiRequest<{ interests: CatalogItem[] }>(
      "/api/v1/profile/interests",
    );
    return data.interests ?? [];
  } catch {
    return [];
  }
}

export async function updateLanguages(
  languageIds: number[],
): Promise<number[]> {
  return apiRequest<number[]>("/api/v1/profile/languages", {
    method: "PATCH",
    body: JSON.stringify({ languageIds }),
  });
}

export async function updateInterests(
  interestIds: number[],
): Promise<number[]> {
  return apiRequest<number[]>("/api/v1/profile/interests", {
    method: "PUT",
    body: JSON.stringify({ interestIds }),
  });
}

// 3. Education & Work
export async function updateEducation(payload: EducationData) {
  return apiRequest("/api/v1/profile/education", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// 4. KYC Verification
export async function verifyKycDocumentApi(formData: FormData) {
  return apiRequest<{ valid: boolean; message: string }>(
    "/api/v1/profile/kyc/verify-document",
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function verifySelfieApi(formData: FormData) {
  return apiRequest<{ valid: boolean; message: string }>(
    "/api/v1/profile/kyc/verify-selfie",
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function submitKyc(formData: FormData) {
  return apiRequest<{ status: string }>("/api/v1/profile/kyc", {
    method: "POST",
    body: formData,
  });
}

export async function getKycStatus(): Promise<{ status: string } | null> {
  try {
    return await apiRequest<{ status: string }>("/api/v1/profile/kyc");
  } catch {
    return null;
  }
}

// 5. Photos
export async function validatePhotoApi(formData: FormData) {
  return apiRequest<{ valid: boolean; message: string; metadata?: any }>(
    "/api/v1/profile/photos/validate-photo",
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function uploadPhotos(formData: FormData) {
  return apiRequest<any[]>("/api/v1/profile/photos", {
    method: "POST",
    body: formData,
  });
}

export async function getPhotos() {
  return apiRequest<any[]>("/api/v1/profile/photos");
}

export async function deletePhoto(photoId: string) {
  return apiRequest(`/api/v1/profile/photos/${photoId}`, {
    method: "DELETE",
  });
}

// 6. Dating Preferences
export async function updateDatingPreferences(payload: DatingPreferencesData) {
  return apiRequest("/api/v1/profile/dating-preferences", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// 7. Onboarding Status & Completion
export async function getOnboardingStatus(): Promise<{
  onboardingStep: string;
  completed: boolean;
}> {
  return apiRequest("/api/v1/profile/onboarding/status");
}

export async function completeOnboarding(): Promise<{
  completed: boolean;
  missingSteps: string[];
}> {
  return apiRequest("/api/v1/profile/onboarding/complete", {
    method: "POST",
  });
}
