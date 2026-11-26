const VALID_ONBOARDING_ROUTES = new Set([
  'set-profile',
  'birthday',
  'location',
  'relationship',
  'languages',
  'qualification',
  'study',
  'profession',
  'company',
  'income',
  'verification',
  'photos',
  'interests',
  'food-preference',
  'lifestyle',
  'nature',
  'religion',
  'looking-for',
  'ideal-match',
  'subscription',
  'ready',
]);

const LEGACY_STEP_TO_ROUTE: Record<string, string> = {
  BASIC_DETAILS: 'set-profile',
  BIRTHDAY: 'birthday',
  LOCATION: 'location',
  RELATIONSHIP: 'relationship',
  LANGUAGES: 'languages',
  EDUCATION: 'qualification',
  KYC: 'verification',
  PHOTOS: 'photos',
  INTERESTS: 'interests',
  RELIGION: 'religion',
  LOOKING_FOR: 'looking-for',
  PREFERENCES: 'looking-for',
};

/**
 * Resolve a backend onboarding step identifier to a valid Expo Router path.
 */
export function resolveOnboardingRoute(step?: string | null): string {
  if (!step) {
    return '/(onboarding)/set-profile';
  }

  const trimmed = step.trim();
  if (trimmed === 'completed' || trimmed === 'COMPLETED') {
    return '/(tab)/matches';
  }

  if (VALID_ONBOARDING_ROUTES.has(trimmed)) {
    return `/(onboarding)/${trimmed}`;
  }

  const mapped = LEGACY_STEP_TO_ROUTE[trimmed.toUpperCase()];
  if (mapped && VALID_ONBOARDING_ROUTES.has(mapped)) {
    return `/(onboarding)/${mapped}`;
  }

  return '/(onboarding)/set-profile';
}
