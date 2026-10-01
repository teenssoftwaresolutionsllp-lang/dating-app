import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingHeader } from '@/components/onboarding-header';
import {
  completeOnboarding,
  getMyProfile,
  getCurrentProfile,
  getSelectedLocation,
  updateCurrentProfile,
  type SelectedLocation,
} from '@/services/profileApi';
import { OnboardingFooter } from '@/components/onboarding-footer';
import { setUserLoggedIn } from '@/utils/authPersistence';
import {
  UserProfile,
  calculateAge,
  getStoredUserProfile,
  updateStoredUserProfile,
  subscribeUserProfile,
} from '@/constants/userProfile';
import { ASSET_IMAGES } from '@/constants/datingData';

const NATURE_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Caring: 'heart',
  'Fun & Funny': 'happy',
  Peaceful: 'leaf',
  'Deep Talks': 'chatbubbles',
  Romantic: 'rose',
  Adventurous: 'compass',
  Classy: 'sparkles',
  Chill: 'cafe',
  Positive: 'sunny',
  Creative: 'color-palette',
};

// Vibrant celebratory color palette for ribbons, stars, hearts, and balls
const CELEBRATION_COLORS = [
  '#FF2D55', // Vibrant Rose Pink
  '#FF385C', // Match Coral
  '#FF4757', // Radiant Watermelon
  '#FFD700', // Metallic Gold
  '#FFA502', // Sunny Amber
  '#FFD32A', // Golden Spark
  '#00D2D3', // Bright Turquoise
  '#00E5FF', // Electric Cyan
  '#54A0FF', // Sky Blue
  '#9B51E0', // Deep Orchid Purple
  '#AF52DE', // Electric Violet
  '#2ED573', // Emerald Mint
  '#FF6B81', // Blush Pink
  '#FFFFFF', // Pure White Sparkle
];

type ParticleType = 'ribbon' | 'star' | 'love' | 'ball';

interface CelebrationParticle {
  id: number;
  type: ParticleType;
  dx: number;
  dy: number;
  driftX: number;
  driftY: number;
  color: string;
  size: number;
  width: number;
  height: number;
  rotation: number;
  spinAmount: number;
  iconName: string;
  iconSet: 'Ionicons' | 'MaterialCommunityIcons';
}

// Generate 120 explosion particles: ribbons, stars, love hearts, and ball confetti
function generateCelebrationBlast(screenWidth: number, screenHeight: number): CelebrationParticle[] {
  const count = 120;
  const types: ParticleType[] = ['ribbon', 'star', 'love', 'ball'];

  const starIcons = [
    { set: 'Ionicons' as const, name: 'star' },
    { set: 'Ionicons' as const, name: 'sparkles' },
    { set: 'MaterialCommunityIcons' as const, name: 'star-four-points' },
  ];

  const loveIcons = [
    { set: 'Ionicons' as const, name: 'heart' },
    { set: 'Ionicons' as const, name: 'heart-sharp' },
    { set: 'MaterialCommunityIcons' as const, name: 'cards-heart' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];

    // Full 360-degree radial blast angle
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
    const maxRadius = Math.max(screenWidth, screenHeight) * 0.65;
    const distance = 90 + Math.random() * maxRadius;
    const speed = 0.8 + Math.random() * 0.55;

    // Confetti air drift & gravity downward
    const driftX = (Math.random() - 0.5) * 70;
    const driftY = 40 + Math.random() * 130;

    const color = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];
    const size = 14 + Math.random() * 12;

    const ribbonWidth = 5 + Math.random() * 4;
    const ribbonHeight = 18 + Math.random() * 22;

    const starChoice = starIcons[Math.floor(Math.random() * starIcons.length)];
    const loveChoice = loveIcons[Math.floor(Math.random() * loveIcons.length)];

    let iconName = '';
    let iconSet: 'Ionicons' | 'MaterialCommunityIcons' = 'Ionicons';
    if (type === 'star') {
      iconName = starChoice.name;
      iconSet = starChoice.set;
    } else if (type === 'love') {
      iconName = loveChoice.name;
      iconSet = loveChoice.set;
    }

    const initialRotation = Math.floor(Math.random() * 360);
    const spinAmount = (Math.random() > 0.5 ? 1 : -1) * (420 + Math.floor(Math.random() * 720));

    return {
      id: i,
      type,
      dx: Math.cos(angle) * distance * speed,
      dy: Math.sin(angle) * distance * speed,
      driftX,
      driftY,
      color,
      size,
      width: ribbonWidth,
      height: ribbonHeight,
      rotation: initialRotation,
      spinAmount,
      iconName,
      iconSet,
    };
  });
}

function mergeBackendProfileIntoStored(
  data: any,
  current: UserProfile,
  selectedLocation: SelectedLocation | null,
): UserProfile {
  if (!data) return current;
  const p = data.profile || {};
  const edu = data.education || {};
  const photos = Array.isArray(data.photos) ? data.photos : [];
  const primaryPhoto = photos.find((ph: any) => ph.isPrimary) || photos[0];

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

  const locationParts = [
    selectedLocation?.city,
    selectedLocation?.state,
    selectedLocation?.country,
  ].filter(Boolean);
  const locationStr = locationParts.length > 0 ? locationParts.join(', ') : current.location;

  const educationStr =
    edu.educationLevel || edu.qualification
      ? [edu.educationLevel, edu.qualification].filter(Boolean).join(' - ')
      : current.education;

  return {
    ...current,
    name: p.name || current.name || 'User',
    dateOfBirth: p.dateOfBirth || current.dateOfBirth,
    gender: p.gender || current.gender,
    religion: p.religion || current.religion,
    about: p.bio || current.about,
    relationshipStatus: p.relationshipStatus || current.relationshipStatus,
    foodPreference: p.foodPreference || current.foodPreference,
    drinking: p.drinking || current.drinking,
    smoking: p.smoking || current.smoking,
    vibes: Array.isArray(p.vibes) && p.vibes.length > 0 ? p.vibes : current.vibes,
    nature: Array.isArray(p.nature) && p.nature.length > 0 ? p.nature : (Array.isArray(p.vibes) ? p.vibes : current.nature),
    location: locationStr || current.location,
    profession: edu.profession || edu.occupation || current.profession,
    company: edu.companyName || current.company,
    education: educationStr || current.education,
    languages: langs || current.languages,
    interests: ints && ints.length > 0 ? ints : current.interests,
    avatarUri: primaryPhoto?.url || current.avatarUri,
  };
}

export default function ProfileReadyScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Load user profile details entered during onboarding
  const [profile, setProfile] = useState<UserProfile>(() => getStoredUserProfile());

  const [particles] = useState<CelebrationParticle[]>(() =>
    generateCelebrationBlast(windowWidth || 400, windowHeight || 800)
  );

  // 1. Top Progress Bar Fill Animation (0.65 -> 1.0)
  const [progressBarAnim] = useState(() => new Animated.Value(0.65));

  // 2. Blast Radial Expansion (NO fog, NO circles, ONLY Ribbons, Stars, Hearts, Balls!)
  const [blastExpansion] = useState(() => new Animated.Value(0));
  const [blastOverlayOpacity] = useState(() => new Animated.Value(1));

  // 3. Profile Card & Content Reveal Values
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleTranslateY] = useState(() => new Animated.Value(25));

  const [subtitleOpacity] = useState(() => new Animated.Value(0));
  const [subtitleTranslateY] = useState(() => new Animated.Value(20));

  const [cardOpacity] = useState(() => new Animated.Value(0));
  const [cardTranslateY] = useState(() => new Animated.Value(35));
  const [cardScale] = useState(() => new Animated.Value(0.9));

  const [footerOpacity] = useState(() => new Animated.Value(0));
  const [footerTranslateY] = useState(() => new Animated.Value(20));

  // Sync profile data from memory and backend
  useEffect(() => {
    const unsubscribe = subscribeUserProfile((updated) => {
      setProfile(updated);
    });

    const loadBackendData = async () => {
      try {
        const [fullData, selectedLocation] = await Promise.all([
          getMyProfile().catch(() => null),
          getSelectedLocation(),
        ]);
        if (fullData) {
          const merged = mergeBackendProfileIntoStored(
            fullData,
            getStoredUserProfile(),
            selectedLocation,
          );
          updateStoredUserProfile(merged);
          setProfile(merged);
        } else {
          const basic = await getCurrentProfile().catch(() => null);
          if (basic) {
            const locParts = [
              selectedLocation?.city,
              selectedLocation?.state,
              selectedLocation?.country,
            ].filter(Boolean);
            const merged = updateStoredUserProfile({
              name: basic.name || profile.name,
              dateOfBirth: basic.dateOfBirth || profile.dateOfBirth,
              gender: basic.gender || profile.gender,
              religion: basic.religion || profile.religion,
              about: basic.bio || profile.about,
              location: locParts.length > 0 ? locParts.join(', ') : profile.location,
            });
            setProfile(merged);
          }
        }
      } catch (err) {
        console.warn('Profile fetch warning on ready screen:', err);
      }
    };

    void loadBackendData();
    return unsubscribe;
  }, []);

  useEffect(() => {
    // STEP 1: Top progress completes to 100% (450ms)
    Animated.timing(progressBarAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      // STEP 2: CELEBRATION BLAST TRIGGERS (Ribbons, Stars, Love, Balls exploding outward)
      Animated.parallel([
        Animated.timing(blastExpansion, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.sequence([
          Animated.delay(850),
          Animated.timing(blastOverlayOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),

        // STEP 3: Profile Card & Content Pop in cleanly as blast expands
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(titleOpacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.spring(titleTranslateY, {
              toValue: 0,
              friction: 6,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.timing(subtitleOpacity, {
              toValue: 1,
              duration: 450,
              delay: 80,
              useNativeDriver: true,
            }),
            Animated.spring(subtitleTranslateY, {
              toValue: 0,
              friction: 6,
              tension: 50,
              delay: 80,
              useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 500,
              delay: 150,
              useNativeDriver: true,
            }),
            Animated.spring(cardTranslateY, {
              toValue: 0,
              friction: 6.5,
              tension: 45,
              delay: 150,
              useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
              toValue: 1,
              friction: 5.5,
              tension: 45,
              delay: 150,
              useNativeDriver: true,
            }),
            Animated.timing(footerOpacity, {
              toValue: 1,
              duration: 400,
              delay: 260,
              useNativeDriver: true,
            }),
            Animated.spring(footerTranslateY, {
              toValue: 0,
              friction: 6,
              tension: 45,
              delay: 260,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });
  }, [
    blastExpansion,
    blastOverlayOpacity,
    cardOpacity,
    cardScale,
    cardTranslateY,
    footerOpacity,
    footerTranslateY,
    progressBarAnim,
    subtitleOpacity,
    subtitleTranslateY,
    titleOpacity,
    titleTranslateY,
  ]);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile.about || '');
  const [isSavingBio, setIsSavingBio] = useState(false);

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      const updated = updateStoredUserProfile({ about: bioDraft.trim() });
      setProfile(updated);
      await updateCurrentProfile({ bio: bioDraft.trim() }).catch((e: unknown) => {
        console.warn('Backend sync warning on bio save:', e);
      });
      setIsEditingBio(false);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleLetsDate = async () => {
    try {
      await completeOnboarding().catch((e: unknown) => {
        console.warn('Backend sync warning on complete onboarding:', e);
      });
      await setUserLoggedIn(true, { isOnboardingCompleted: true });
    } catch (err) {
      console.warn('Error completing onboarding:', err);
    } finally {
      router.replace('/(tab)/matches' as any);
    }
  };

  const handleEditProfile = () => {
    router.push('/(onboarding)/set-profile' as any);
  };

  const userAge = calculateAge(profile.dateOfBirth);
  const displayName = profile.name?.trim() || 'User';
  const displayLocation = profile.location?.trim() || 'Location not set';
  const displayProfession = profile.profession?.trim() || 'Profession';
  const displayCompany = profile.company?.trim();
  const displayProfessionText = displayCompany
    ? `${displayProfession} at ${displayCompany}`
    : displayProfession;

  const displayReligion = profile.religion?.trim() || 'Religion';
  const displayLanguages = profile.languages?.trim() || 'Language';
  const displayEducation = profile.education?.trim() || 'Education';
  const displayInterests =
    Array.isArray(profile.interests) && profile.interests.length > 0
      ? profile.interests
      : ['Music', 'Movies', 'Travel'];

  const displayAbout =
    profile.about?.trim() ||
    "I'm looking for meaningful connections, great conversations, and someone to share life's best adventures with.";

  const imageSource = profile.avatarUri
    ? { uri: profile.avatarUri }
    : ASSET_IMAGES.userProfile || require('@/assets/images/user-profile.jpg');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Top Animated Progress Bar */}
        <OnboardingHeader progress={1.0} />

        {/* CELEBRATION BLAST OVERLAY (Ribbons, Stars, Hearts, Ball Shapes ONLY - NO Circle, NO Fog) */}
        <Animated.View
          style={[
            styles.screenCenterBlastContainer,
            {
              opacity: blastOverlayOpacity,
            },
          ]}
          pointerEvents="none"
        >
          {particles.map((p) => {
            const translateX = blastExpansion.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0, p.dx * 0.78, p.dx + p.driftX],
            });

            const translateY = blastExpansion.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0, p.dy * 0.78, p.dy + p.driftY],
            });

            const rotate = blastExpansion.interpolate({
              inputRange: [0, 1],
              outputRange: [`${p.rotation}deg`, `${p.rotation + p.spinAmount}deg`],
            });

            const opacity = blastExpansion.interpolate({
              inputRange: [0, 0.08, 0.75, 1],
              outputRange: [0, 1, 0.95, 0],
            });

            const scale = blastExpansion.interpolate({
              inputRange: [0, 0.18, 0.7, 1],
              outputRange: [0.15, 1.28, 1, 0.7],
            });

            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.particleWrapper,
                  {
                    transform: [{ translateX }, { translateY }, { rotate }, { scale }],
                    opacity,
                  },
                ]}
              >
                {/* 1. RIBBONS */}
                {p.type === 'ribbon' && (
                  <View
                    style={{
                      width: p.width,
                      height: p.height,
                      borderRadius: 3,
                      backgroundColor: p.color,
                      transform: [{ skewX: '18deg' }],
                    }}
                  />
                )}

                {/* 2. STARS */}
                {p.type === 'star' && (
                  <>
                    {p.iconSet === 'Ionicons' ? (
                      <Ionicons name={p.iconName as any} size={p.size} color={p.color} />
                    ) : (
                      <MaterialCommunityIcons name={p.iconName as any} size={p.size} color={p.color} />
                    )}
                  </>
                )}

                {/* 3. LOVE / HEARTS */}
                {p.type === 'love' && (
                  <>
                    {p.iconSet === 'Ionicons' ? (
                      <Ionicons name={p.iconName as any} size={p.size} color={p.color} />
                    ) : (
                      <MaterialCommunityIcons name={p.iconName as any} size={p.size} color={p.color} />
                    )}
                  </>
                )}

                {/* 4. BALL SHAPES */}
                {p.type === 'ball' && (
                  <View
                    style={{
                      width: p.size * 0.75,
                      height: p.size * 0.75,
                      borderRadius: (p.size * 0.75) / 2,
                      backgroundColor: p.color,
                      shadowColor: p.color,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.35,
                      shadowRadius: 2,
                      elevation: 3,
                    }}
                  />
                )}
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Main Content Area */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Animated.Text
            style={[
              styles.title,
              { color: theme.text },
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            Your profile is ready!
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.subtitle,
              { color: theme.textSecondary },
              {
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleTranslateY }],
              },
            ]}
          >
            You’re all set. Your profile is ready to help you meet people who match your vibe.
          </Animated.Text>

          {/* User Profile Card Preview */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1C1E22' : '#FFFFFF',
                borderColor: isDark ? '#2E3137' : '#E8EAED',
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
              },
            ]}
          >
            {/* Avatar and Main User Info */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={imageSource}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              </View>

              <View style={styles.infoColumn}>
                <View style={styles.nameRow}>
                  <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
                    {displayName}, {userAge}
                  </Text>
                  <Ionicons name="checkmark-circle" size={20} color="#2E86DE" style={styles.verifiedIcon} />
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-sharp" size={15} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {displayLocation}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="briefcase-outline" size={14} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {displayProfessionText}
                  </Text>
                </View>
              </View>
            </View>

            {/* User's Personal About Section (Interactive Bio Editor) */}
            <View
              style={[
                styles.aboutContainer,
                {
                  backgroundColor: isDark ? '#25282F' : '#F7F8FA',
                  borderColor: isDark ? '#363A42' : '#EDF0F2',
                },
              ]}
            >
              <View style={styles.aboutHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={14} color={theme.primaryButton} />
                  <Text style={[styles.aboutHeaderTitle, { color: theme.textSecondary }]}>About Me</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setBioDraft(profile.about || '');
                    setIsEditingBio(!isEditingBio);
                  }}
                  activeOpacity={0.7}
                  hitSlop={8}
                  style={styles.editBioBtn}
                >
                  <Ionicons name={isEditingBio ? 'close' : 'create-outline'} size={15} color="#0D7A74" />
                  <Text style={styles.editBioBtnText}>
                    {isEditingBio ? 'Cancel' : (profile.about?.trim() ? 'Edit' : 'Add Bio')}
                  </Text>
                </TouchableOpacity>
              </View>

              {isEditingBio ? (
                <View style={styles.bioEditContainer}>
                  <TextInput
                    style={[
                      styles.bioEditInput,
                      {
                        color: theme.text,
                        backgroundColor: isDark ? '#1C1E22' : '#FFFFFF',
                        borderColor: isDark ? '#363A42' : '#E5E7EB',
                      },
                    ]}
                    value={bioDraft}
                    onChangeText={setBioDraft}
                    placeholder="Write a short bio about yourself..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    maxLength={300}
                    textAlignVertical="top"
                  />
                  <View style={styles.bioEditActionRow}>
                    <Text style={[styles.bioEditCharCount, { color: theme.textSecondary }]}>
                      {bioDraft.length} / 300
                    </Text>
                    <TouchableOpacity
                      style={[styles.bioSaveBtn, { backgroundColor: theme.primaryButton }]}
                      onPress={handleSaveBio}
                      disabled={isSavingBio}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.bioSaveBtnText}>{isSavingBio ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={[styles.aboutText, { color: theme.text }]} numberOfLines={4}>
                  {profile.about?.trim() || "Add your bio to introduce yourself, share what you love, and attract the right matches."}
                </Text>
              )}
            </View>

            {/* My Nature Section */}
            {Boolean(
              (profile.nature && profile.nature.length > 0) ||
              (profile.vibes && profile.vibes.length > 0)
            ) && (
              <View style={styles.interestsContainer}>
                <Text style={[styles.interestsSectionLabel, { color: theme.textSecondary }]}>My Nature</Text>
                <View style={styles.interestsRow}>
                  {(profile.nature || profile.vibes || []).map((trait) => (
                    <View
                      key={trait}
                      style={[
                        styles.interestPill,
                        {
                          backgroundColor: isDark ? '#1E3A37' : '#F0FDFA',
                          borderColor: isDark ? '#0D7A74' : '#CCFBF1',
                        },
                      ]}
                    >
                      <Ionicons
                        name={NATURE_ICON_MAP[trait] || 'sparkles'}
                        size={14}
                        color="#0D7A74"
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[styles.interestText, { color: isDark ? '#99F6E4' : '#0F766E', fontWeight: '600' }]}>
                        {trait}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Lifestyle Attributes (Food Preference, Drink, Smoke) */}
            <View style={styles.badgesRow}>
              <View style={styles.badgeItem}>
                <Ionicons name="restaurant-outline" size={15} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]} numberOfLines={1}>
                  {profile.foodPreference || 'Foodie / Veg'}
                </Text>
              </View>

              <View style={styles.badgeItem}>
                <Ionicons name="wine-outline" size={15} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]} numberOfLines={1}>
                  {profile.drinking || 'Socially'}
                </Text>
              </View>

              <View style={styles.badgeItem}>
                <Ionicons name="cloud-outline" size={15} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]} numberOfLines={1}>
                  {profile.smoking || 'No'}
                </Text>
              </View>
            </View>

            {/* Attributes Row (User's Religion, Languages, Education) */}
            <View style={styles.badgesRow}>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="hands-pray" size={16} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]} numberOfLines={1}>
                  {displayReligion}
                </Text>
              </View>

              <View style={styles.badgeItem}>
                <Ionicons name="chatbubbles-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]} numberOfLines={1}>
                  {displayLanguages}
                </Text>
              </View>

              <View style={styles.badgeItem}>
                <Ionicons name="school-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]} numberOfLines={1}>
                  {displayEducation}
                </Text>
              </View>
            </View>

            {/* User's Selected Interests Pills */}
            <View style={styles.interestsContainer}>
              <Text style={[styles.interestsSectionLabel, { color: theme.textSecondary }]}>Interests</Text>
              <View style={styles.interestsRow}>
                {displayInterests.map((interest) => (
                  <View
                    key={interest}
                    style={[
                      styles.interestPill,
                      {
                        backgroundColor: isDark ? '#2B2E35' : '#F3F4F6',
                        borderColor: isDark ? '#3D414A' : '#E5E7EB',
                      },
                    ]}
                  >
                    <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                    <Ionicons name="checkmark-circle" size={15} color={theme.primaryButton} />
                  </View>
                ))}
              </View>
            </View>

            {/* Identity Verified Badge */}
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={18} color="#00D5D9" />
              <Text style={[styles.identityText, { color: theme.text }]}>Identity Verified</Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer Navigation */}
        <Animated.View
          style={{
            width: '100%',
            opacity: footerOpacity,
            transform: [{ translateY: footerTranslateY }],
          }}
        >
          <OnboardingFooter
            showBack
            onBack={() => router.back()}
            onNext={handleLetsDate}
            nextText="Let’s Date"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    justifyContent: 'space-between',
  },
  screenCenterBlastContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  particleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 320,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#33373E',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoColumn: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 19,
    flexShrink: 1,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
    flexShrink: 1,
  },
  aboutContainer: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  aboutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aboutHeaderTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  editBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#E6FFFA',
  },
  editBioBtnText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 12,
    color: '#0D7A74',
  },
  bioEditContainer: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  bioEditInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    minHeight: 64,
  },
  bioEditActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bioEditCharCount: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 11,
  },
  bioSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioSaveBtnText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 12,
    color: '#000000',
  },
  aboutText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.25)',
    gap: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  badgeText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 12,
    flexShrink: 1,
  },
  interestsContainer: {
    marginTop: 16,
    gap: 8,
  },
  interestsSectionLabel: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  interestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestPill: {
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  interestText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  identityText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
  },
});
