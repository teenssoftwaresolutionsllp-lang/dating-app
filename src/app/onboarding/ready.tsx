import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

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

export default function ProfileReadyScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [particles] = useState<CelebrationParticle[]>(() =>
    generateCelebrationBlast(windowWidth || 400, windowHeight || 800)
  );

  // 1. Top Progress Bar Fill Animation (0.65 -> 1.0)
  const progressBarAnim = useRef(new Animated.Value(0.65)).current;

  // 2. Blast Radial Expansion (NO fog, NO circles, ONLY Ribbons, Stars, Hearts, Balls!)
  const blastExpansion = useRef(new Animated.Value(0)).current;
  const blastOverlayOpacity = useRef(new Animated.Value(1)).current;

  // 3. Profile Card & Content Reveal Values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(25)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(35)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(20)).current;

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
  }, []);

  const handleLetsDate = () => {
    router.replace('/(tab)/home');
  };

  const progressWidthInterpolate = progressBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Top Animated Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidthInterpolate,
                  backgroundColor: theme.primaryButton,
                },
              ]}
            />
          </View>
        </View>

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

          {/* Profile Card Preview */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1C1E22' : '#F7F8FA',
                borderColor: isDark ? '#2E3137' : '#E8EAED',
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
              },
            ]}
          >
            {/* Avatar and Main Info */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={require('@/assets/images/user-profile.jpg')}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
                <View
                  style={[
                    styles.editBadge,
                    {
                      backgroundColor: isDark ? '#2D3036' : '#FFFFFF',
                      borderColor: isDark ? '#44474E' : '#DADCE0',
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                >
                  <Ionicons name="pencil" size={12} color={theme.text} />
                </View>
              </View>

              <View style={styles.infoColumn}>
                <View style={styles.nameRow}>
                  <Text style={[styles.nameText, { color: theme.text }]}>Name, Age</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#2E86DE" style={styles.verifiedIcon} />
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-sharp" size={15} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>Hyderabad, India</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="briefcase" size={14} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>Profession</Text>
                </View>
              </View>
            </View>

            {/* Attributes Row */}
            <View style={styles.badgesRow}>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="hands-pray" size={16} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]}>Hindu</Text>
              </View>

              <View style={styles.badgeItem}>
                <Ionicons name="chatbubbles-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]}>Language</Text>
              </View>

              <View style={styles.badgeItem}>
                <Ionicons name="school-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.text }]}>B. Tech</Text>
              </View>
            </View>

            {/* Interests Pills */}
            <View style={styles.interestsRow}>
              {['Music', 'Movies', 'Travel'].map((interest) => (
                <View
                  key={interest}
                  style={[
                    styles.interestPill,
                    {
                      backgroundColor: isDark ? '#2B2E35' : '#FFFFFF',
                      borderColor: isDark ? '#3D414A' : '#E0E0E0',
                    },
                  ]}
                >
                  <Text style={[styles.interestText, { color: theme.text }]}>{interest}</Text>
                  <Ionicons name="checkmark-circle" size={16} color={theme.primaryButton} />
                </View>
              ))}
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
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              opacity: footerOpacity,
              transform: [{ translateY: footerTranslateY }],
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: theme.primaryButton },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>

          <Pressable
            onPress={handleLetsDate}
            style={[
              styles.letsDateButton,
              { backgroundColor: theme.primaryButton },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.letsDateButtonText}>Let’s Date</Text>
          </Pressable>
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  screenCenterBlastContainer: {
    ...StyleSheet.absoluteFillObject,
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
    paddingTop: 18,
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
    maxWidth: 300,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.25)',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
  },
  interestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 8,
  },
  interestPill: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  interestText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  identityText: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letsDateButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  letsDateButtonText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    color: '#000000',
  },
});
