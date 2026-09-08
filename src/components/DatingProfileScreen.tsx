import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';
import PeopleScreen from '../app/(tab)/people';
import ChatScreen from '../app/(tab)/chats';
import MeScreen from '../app/(tab)/me';

// Rosette Ribbon Badge Component (Bottom Right of Photo Card as shown in Image 2)
export function RosetteBadge({ percentage = 80 }: { percentage?: number }) {
  return (
    <View style={badgeStyles.rosetteContainer}>
      <Svg width={46} height={56} viewBox="0 0 44 54" fill="none">
        {/* Left Ribbon Tail */}
        <Path
          d="M13 34L9 50L16 45L21 50L19 34"
          fill="#00BCD4"
          stroke="#00838F"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        {/* Right Ribbon Tail */}
        <Path
          d="M25 34L23 50L28 45L35 50L31 34"
          fill="#00BCD4"
          stroke="#00838F"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        {/* Rosette Scalloped Outer Seal */}
        <Path
          d="M22 3C23.3 3 24.3 1.8 25.6 2.2C26.9 2.6 27.3 3.9 28.6 4.6C29.9 5.2 31.2 4.8 32.3 5.8C33.4 6.8 33 8.1 33.6 9.4C34.3 10.7 35.6 11.1 36 12.4C36.4 13.7 35.1 14.6 35.1 15.9C35.1 17.2 36.4 18.1 36 19.4C35.6 20.7 34.3 21.1 33.6 22.4C33 23.7 33.4 25 32.3 26C31.2 27 29.9 26.6 28.6 27.2C27.3 27.9 26.9 29.2 25.6 29.6C24.3 30 23.3 28.8 22 28.8C20.7 28.8 19.7 30 18.4 29.6C17.1 29.2 16.7 27.9 15.4 27.2C14.1 26.6 12.8 27 11.7 26C10.6 25 11 23.7 10.4 22.4C9.7 21.1 8.4 20.7 8 19.4C7.6 18.1 8.9 17.2 8.9 15.9C8.9 14.6 7.6 13.7 8 12.4C8.4 11.1 9.7 10.7 10.4 9.4C11 8.1 10.6 6.8 11.7 5.8C12.8 4.8 14.1 5.2 15.4 4.6C16.7 3.9 17.1 2.6 18.4 2.2C19.7 1.8 20.7 3 22 3Z"
          fill="rgba(255, 255, 255, 0.95)"
          stroke="#00BCD4"
          strokeWidth={1.8}
        />
        {/* Inner Circle Accent */}
        <Circle cx="22" cy="16" r="10" stroke="#00BCD4" strokeWidth={1.2} fill="#E0F7FA" />
        {/* Score Text */}
        <SvgText
          x="22"
          y="19"
          fontSize="9"
          fontWeight="bold"
          fill="#0077B6"
          textAnchor="middle"
        >
          {`${percentage}%`}
        </SvgText>
      </Svg>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  rosetteContainer: {
    width: 46,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Custom Tab Bar SVG Icons Matching Image 1
function MatchesTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M7.5 16.5l-0.7-.65C4.3 13.7 2.5 12.1 2.5 10.2c0-1.5 1.2-2.7 2.7-2.7.9 0 1.7.4 2.3 1 0.6-.6 1.4-1 2.3-1 1.5 0 2.7 1.2 2.7 2.7 0 1.9-1.8 3.5-4.3 5.65L7.5 16.5z"
        fill={color}
      />
    </Svg>
  );
}

function LikesTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10a3 3 0 1 0-3-3H9a3 3 0 1 0-3 3v4a3 3 0 1 0 3 3h6a3 3 0 1 0 3-3v-4zM6 7a1 1 0 1 1 1 1H6V7zm11 0a1 1 0 1 1 1 1h-1V7zM7 17a1 1 0 1 1-1-1h1v1zm11 0a1 1 0 1 1-1 1v-1h1z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PeopleTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.2" fill={color} />
      <Path
        d="M6.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="6" cy="9.5" r="2.2" fill={color} />
      <Path d="M2.5 18.5c0-2.2 1.8-4 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="18" cy="9.5" r="2.2" fill={color} />
      <Path d="M21.5 18.5c0-2.2-1.8-4-4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ChatsTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12c0-4.42-3.58-8-8-8S4 7.58 4 12c0 1.8.6 3.47 1.63 4.81L4.5 20.5l4.02-1.07C9.77 19.7 10.86 20 12 20c4.42 0 8-3.58 8-8z"
        fill={color}
      />
      <Path d="M8 10.5h8M8 13.5h5" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ActionChatIcon({ color = "#FFFFFF", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12c0-4.42-3.58-8-8-8S4 7.58 4 12c0 1.8.6 3.47 1.63 4.81L4.5 20.5l4.02-1.07C9.77 19.7 10.86 20 12 20c4.42 0 8-3.58 8-8z"
        fill={color}
      />
      <Path d="M8.5 10.5h7M8.5 13.5h4" stroke="#14B9FF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MeTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="9.5" r="3" fill={color} />
      <Path
        d="M6.8 17.2c1.2-2.2 3.2-3.2 5.2-3.2s4 1 5.2 3.2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// User provided asset images
const ASSET_IMAGES = [
  require('../../assets/images/profile_asset1.jpg'),
  require('../../assets/images/profile_asset2.jpg'),
  require('../../assets/images/profile_asset3.jpg'),
];

// Profile data structure with multiple detailed profiles
const PROFILES_DATA = [
  {
    id: '1',
    name: 'Ammu',
    age: 23,
    height: '5.6 fts',
    location: 'Lives in Hyderabad',
    about: 'Looking for good vibes, genuine conversations, and a real connection.',
    interests: ['Music', 'Movies', 'Travel'],
    education: 'B. Tech',
    profession: 'Designer',
    attributes: {
      food: 'Foodie / Veg',
      politics: 'Moderate',
      lookingFor: 'Long-term relationship',
      zodiac: 'Libra ♎',
      personality: 'Ambivert',
      firstDate: 'Coffee & Walks',
      drink: 'Socially',
      smoke: 'No',
      religion: 'Hindu',
      pastTime: 'Listening to Music',
    },
    images: [ASSET_IMAGES[0], ASSET_IMAGES[1], ASSET_IMAGES[2]],
  },
  {
    id: '2',
    name: 'Pinky',
    age: 24,
    height: '5.4 fts',
    location: 'Lives in Bangalore',
    about: 'Passionate about photography, artisanal coffee, and spontaneous weekend road trips! ☕📸',
    interests: ['Photography', 'Coffee', 'Road Trips'],
    education: 'M.B.A',
    profession: 'Product Manager',
    attributes: {
      food: 'Non-Veg',
      politics: 'Open-minded',
      lookingFor: 'Something real',
      zodiac: 'Gemini ♊',
      personality: 'Extrovert',
      firstDate: 'Cozy Cafe',
      drink: 'Occasionally',
      smoke: 'No',
      religion: 'Spiritual',
      pastTime: 'Sunset Watching',
    },
    images: [ASSET_IMAGES[1], ASSET_IMAGES[2], ASSET_IMAGES[0]],
  },
  {
    id: '3',
    name: 'Priya',
    age: 22,
    height: '5.5 fts',
    location: 'Lives in Mumbai',
    about: 'Art enthusiast, foodie, and dog lover. Let’s talk about favorite books, movies, and indie songs! 🎨🐾',
    interests: ['Art & Painting', 'Indie Music', 'Dogs'],
    education: 'B.A. Fine Arts',
    profession: 'UI/UX Designer',
    attributes: {
      food: 'Vegetarian',
      politics: 'Liberal',
      lookingFor: 'Meaningful bond',
      zodiac: 'Leo ♌',
      personality: 'Creative & Warm',
      firstDate: 'Art Gallery & Tea',
      drink: 'Never',
      smoke: 'No',
      religion: 'Hindu',
      pastTime: 'Sketching & Reading',
    },
    images: [ASSET_IMAGES[2], ASSET_IMAGES[0], ASSET_IMAGES[1]],
  },
  {
    id: '4',
    name: 'Sneha',
    age: 25,
    height: '5.7 fts',
    location: 'Lives in Delhi',
    about: 'Fitness junkie, tech explorer, and lover of acoustic tunes. Always up for deep conversations! 🎧⚡',
    interests: ['Fitness', 'Tech & Code', 'Acoustic Music'],
    education: 'B. Tech CS',
    profession: 'Software Engineer',
    attributes: {
      food: 'Eggetarian',
      politics: 'Centrist',
      lookingFor: 'Date to marry',
      zodiac: 'Aries ♈',
      personality: 'Energetic',
      firstDate: 'Bowling & Drinks',
      drink: 'Socially',
      smoke: 'No',
      religion: 'Hindu',
      pastTime: 'Trekking & Gaming',
    },
    images: [ASSET_IMAGES[0], ASSET_IMAGES[2], ASSET_IMAGES[1]],
  },
];

// Cards data for Likes Screen (Liked You vs You Liked)
const LIKED_YOU_DATA = [
  { id: 'ly1', name: 'Ammu, 23', image: ASSET_IMAGES[0], time: '2 hrs ago' },
  { id: 'ly2', name: 'Pinky, 24', image: ASSET_IMAGES[1], time: '5 hrs ago' },
  { id: 'ly3', name: 'Priya, 22', image: ASSET_IMAGES[2], time: '1 day ago' },
];

const YOU_LIKED_DATA = [
  { id: 'yl1', name: 'Ananya, 24', image: ASSET_IMAGES[2], time: 'Yesterday', match: '96%' },
  { id: 'yl2', name: 'Swathi, 23', image: ASSET_IMAGES[1], time: '2 days ago', match: '90%' },
  { id: 'yl3', name: 'Teju, 23', image: ASSET_IMAGES[0], time: '3 days ago', match: '87%' },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'profile';
  text: string;
  time: string;
}

export default function DatingProfileScreen() {
  const [activeTab, setActiveTab] = useState<'matches' | 'likes' | 'people' | 'chats' | 'me'>('matches');
  const [likesSubTab, setLikesSubTab] = useState<'likedYou' | 'youLiked'>('youLiked');
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLikedToast, setShowLikedToast] = useState(false);
  const [selectedPersonForChat, setSelectedPersonForChat] = useState<{
    name: string;
    avatar: any;
  } | null>(null);

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState<{ [profileId: string]: ChatMessage[] }>({
    '1': [
      { id: 'm1', sender: 'profile', text: 'Hey there! 👋 Saw you looking at my profile. How is your day going?', time: '10:30 AM' },
    ],
    '2': [
      { id: 'm1', sender: 'profile', text: 'Hi! ☕ Love road trips and good coffee. What about you?', time: '11:15 AM' },
    ],
    '3': [
      { id: 'm1', sender: 'profile', text: 'Hey! 🎨 What kind of music or art do you like?', time: '12:00 PM' },
    ],
    '4': [
      { id: 'm1', sender: 'profile', text: 'Hello! 🎧 Always up for a chat about tech or music!', time: '1:45 PM' },
    ],
  });
  const [inputText, setInputText] = useState('');

  const currentProfile = PROFILES_DATA[currentProfileIndex];

  // Responsive container width calculation
  const [cardWidth, setCardWidth] = useState<number>(
    Math.min(Dimensions.get('window').width, 480) - 32
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const scrollXAnim = useRef(new Animated.Value(0)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  // Slide animation for complete screen swipe effect
  const [isAnimating, setIsAnimating] = useState(false);
  const cardSlideAnim = useRef(new Animated.Value(0)).current;

  const cardRotateInterpolation = cardSlideAnim.interpolate({
    inputRange: [-cardWidth * 1.5, 0, cardWidth * 1.5],
    outputRange: ['-14deg', '0deg', '14deg'],
  });

  // Handle back navigation
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(onboarding)/photos' as any);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (cardWidth > 0) {
      const index = Math.round(offsetX / cardWidth);
      if (index >= 0 && index < currentProfile.images.length && index !== currentImageIndex) {
        setCurrentImageIndex(index);
      }
    }
  };

  const scrollToImage = (index: number) => {
    if (index >= 0 && index < currentProfile.images.length && cardWidth > 0) {
      setCurrentImageIndex(index);
      scrollViewRef.current?.scrollTo({
        x: index * cardWidth,
        animated: true,
      });
    }
  };

  const handlePrevImage = () => {
    const prevIndex = (currentImageIndex - 1 + currentProfile.images.length) % currentProfile.images.length;
    scrollToImage(prevIndex);
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % currentProfile.images.length;
    scrollToImage(nextIndex);
  };

  // Reject (❌): slide complete screen LEFT and smoothly move to the next profile
  const handleReject = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    Animated.timing(cardSlideAnim, {
      toValue: -cardWidth * 1.25,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      cardSlideAnim.setValue(cardWidth * 1.25);
      setCurrentImageIndex(0);
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
      setCurrentProfileIndex((prevIndex) => (prevIndex + 1) % PROFILES_DATA.length);

      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  // Like (❤️): show "Liked" toast notification, slide complete screen RIGHT and smoothly move to the next profile
  const handleToggleLike = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsLiked(true);
    setShowLikedToast(true);

    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.35,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(cardSlideAnim, {
      toValue: cardWidth * 1.25,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowLikedToast(false);
      setIsLiked(false);
      cardSlideAnim.setValue(-cardWidth * 1.25);
      setCurrentImageIndex(0);
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
      setCurrentProfileIndex((prevIndex) => (prevIndex + 1) % PROFILES_DATA.length);

      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  // Chat (💬): open the individual chat screen for the selected person
  const handleOpenChat = () => {
    setSelectedPersonForChat({
      name: currentProfile.name,
      avatar: currentProfile.images[0],
    });
    setActiveTab('chats');
  };

  // Send message in chat screen
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [currentProfile.id]: [...(prev[currentProfile.id] || []), newMsg],
    }));

    if (!textToSend) setInputText('');

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Auto-reply simulation from profile
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'profile',
        text: `Thanks for messaging! 😊 I'd love to chat more!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [currentProfile.id]: [...(prev[currentProfile.id] || []), replyMsg],
      }));
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1200);
  };

  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0 && Math.abs(width - cardWidth) > 1) {
      setCardWidth(width);
    }
  };

  const currentMessages = chatMessages[currentProfile.id] || [];

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* SCREEN RENDER LOGIC */}
        {activeTab === 'chats' ? (
          /* CHAT SCREEN (MESSAGES & CALLS TABS) */
          <ChatScreen showTabBar={false} initialConversation={selectedPersonForChat} />
        ) : activeTab === 'likes' ? (
          /* LIKES SCREEN (Liked You & You Liked) */
          <View style={styles.likesScreenContainer}>
            {/* Title Header */}
            <View style={styles.likesHeader}>
              <Text style={styles.likesHeaderTitle}>Likes</Text>
            </View>

            {/* Sub Tabs Navigation (Liked You / You Liked) */}
            <View style={styles.likesSubTabBar}>
              <TouchableOpacity
                style={styles.likesSubTabItem}
                onPress={() => setLikesSubTab('likedYou')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.likesSubTabText,
                    likesSubTab === 'likedYou' && styles.activeLikesSubTabText,
                  ]}
                >
                  Liked You
                </Text>
                {likesSubTab === 'likedYou' && <View style={styles.activeUnderline} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.likesSubTabItem}
                onPress={() => setLikesSubTab('youLiked')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.likesSubTabText,
                    likesSubTab === 'youLiked' && styles.activeLikesSubTabText,
                  ]}
                >
                  You Liked
                </Text>
                {likesSubTab === 'youLiked' && <View style={styles.activeUnderline} />}
              </TouchableOpacity>
            </View>

            {/* FRESH SEPARATE SECTION RENDERING BASED ON SUB TAB */}
            {likesSubTab === 'likedYou' ? (
              <View key="liked-you-page" style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
                  <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>
                    People who liked your profile (Unlock to view)
                  </Text>
                </View>
                <ScrollView contentContainerStyle={styles.likesGridContainer} key="scroll-liked-you">
                  <View style={styles.likesGridRow}>
                    {LIKED_YOU_DATA.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.blurredCard}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={item.image}
                          style={styles.blurredCardImage}
                          blurRadius={Platform.OS === 'web' ? 8 : 10}
                          resizeMode="cover"
                        />
                        <View style={styles.blurredCardOverlay} />
                        <View style={styles.lockIconBadge}>
                          <Ionicons name="lock-closed-outline" size={14} color="#FFFFFF" />
                        </View>
                        <Text style={styles.cardNameText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <View key="you-liked-page" style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
                  <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '500' }}>
                    Profiles you have liked
                  </Text>
                </View>
                <ScrollView contentContainerStyle={styles.likesGridContainer} key="scroll-you-liked">
                  <View style={styles.likesGridRow}>
                    {YOU_LIKED_DATA.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.blurredCard}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={item.image}
                          style={styles.blurredCardImage}
                          resizeMode="cover"
                        />
                        <View style={styles.blurredCardOverlay} />
                        <View style={[styles.lockIconBadge, { backgroundColor: '#0F766E' }]}>
                          <Ionicons name="heart" size={12} color="#FFFFFF" />
                        </View>
                        <Text style={styles.cardNameText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        ) : activeTab === 'matches' ? (
          /* MATCHES SCREEN (Main Dating Profile Screen with multi-image carousel) */
          <View style={{ flex: 1 }}>
            {/* Liked Toast Notification */}
            {showLikedToast && (
              <View style={styles.likedToast}>
                <Ionicons name="heart" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.likedToastText}>Liked {currentProfile.name}'s profile!</Text>
              </View>
            )}

            {/* Main Scrollable Content with Animated Slide */}
            <ScrollView
              style={styles.mainScrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={{
                  transform: [
                    { translateX: cardSlideAnim },
                    { rotate: cardRotateInterpolation },
                  ],
                }}
              >
                {/* Photo Container Card with Side-by-Side Horizontal Image Carousel */}
                <View style={styles.photoCardContainer} onLayout={onCardLayout}>
                  <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollXAnim } } }],
                      { useNativeDriver: false, listener: handleScroll }
                    )}
                    scrollEventThrottle={16}
                    style={styles.horizontalImageScrollView}
                  >
                    {currentProfile.images.map((imgSrc, idx) => (
                      <View key={idx} style={[styles.imageSlide, { width: cardWidth }]}>
                        <Image source={imgSrc} style={[styles.profileImage, { width: cardWidth }]} resizeMode="cover" />
                        <View style={styles.imageOverlayBadge}>
                          <Text style={styles.imageOverlayBadgeText}>
                            {idx + 1}/{currentProfile.images.length}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Left Chevron Arrow Button */}
                  <TouchableOpacity
                    style={[styles.carouselNavBtn, styles.carouselNavBtnLeft]}
                    onPress={handlePrevImage}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Right Chevron Arrow Button */}
                  <TouchableOpacity
                    style={[styles.carouselNavBtn, styles.carouselNavBtnRight]}
                    onPress={handleNextImage}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Smooth Dots Pagination Indicator */}
                  <View style={styles.paginationContainer}>
                    {currentProfile.images.map((_, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => scrollToImage(idx)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.paginationDot,
                            currentImageIndex === idx && styles.paginationDotActive,
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* 100% Profile Match Badge (Bottom Right of Photo Card) */}
                  <View style={styles.hundredPercentBadgeOverlay}>
                    <View style={styles.hundredPercentBadge}>
                      <Text style={styles.hundredPercentBadgeText}>100%</Text>
                    </View>
                  </View>
                </View>

                {/* Profile Basic Details */}
                <View style={styles.profileDetailsHeader}>
                  <View style={styles.nameRow}>
                    <Text style={styles.profileName}>
                      {currentProfile.name}, {currentProfile.age}, {currentProfile.height.split(' ')[0]} <Text style={styles.heightSuffix}>fts</Text>
                    </Text>

                    {/* Online Status Badge */}
                    <View style={styles.onlineBadge}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.onlineText}>Online</Text>
                    </View>
                  </View>

                  {/* Location Line */}
                  <View style={styles.locationRow}>
                    <Ionicons name="location-sharp" size={16} color="#111827" />
                    <Text style={styles.locationText}>{currentProfile.location}</Text>
                  </View>
                </View>

                {/* About Me Section */}
                <View style={styles.aboutMeCard}>
                  <Text style={styles.aboutMeTitle}>About Me</Text>
                  <Text style={styles.aboutMeText}>{currentProfile.about}</Text>

                  {/* Interest Chips */}
                  <View style={styles.interestChipsContainer}>
                    {currentProfile.interests.map((interest, idx) => (
                      <View key={idx} style={styles.interestChip}>
                        <Text style={styles.interestChipText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Profession & Education */}
                <View style={styles.professionContainer}>
                  <View style={styles.professionPill}>
                    <Ionicons name="school-outline" size={18} color="#0D9488" />
                    <Text style={styles.professionPillText}>{currentProfile.education}</Text>
                  </View>
                  <View style={styles.professionPill}>
                    <Ionicons name="briefcase-outline" size={18} color="#0D9488" />
                    <Text style={styles.professionPillText}>{currentProfile.profession}</Text>
                  </View>
                </View>

                {/* Attributes Grid */}
                <View style={styles.attributesGrid}>
                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="restaurant-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Food Preferences</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="bulb-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Political Views</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="glasses-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Looking for</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="sparkles-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Zodiac Sign</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="happy-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Personality</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="calendar-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>First Date</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="wine-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Drink</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="cloud-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Smoke</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="flower-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Religion</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>

                  <View style={styles.attributeBox}>
                    <View style={styles.attributeHeaderRow}>
                      <Ionicons name="game-controller-outline" size={15} color="#0D7A74" />
                      <Text style={styles.attributeTitle}>Favourite Past time</Text>
                    </View>
                    <Text style={styles.attributeDashes}>------</Text>
                  </View>
                </View>

                {/* Report & Block Profile Link */}
                <TouchableOpacity style={styles.reportButton} activeOpacity={0.7}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FF4D4D" />
                  <Text style={styles.reportButtonText}>Report & block profile</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Spacing for floating action buttons */}
              <View style={{ height: 130 }} />
            </ScrollView>

            {/* Floating Action Buttons Overlay (Positioned close to footer with Chat slightly higher matching reference image) */}
            <View style={styles.floatingActionRow}>
              {/* Dislike / Red X Button (#FFC5C5 outer ring, #EB1B1B inner circle, white X) */}
              <View style={styles.actionBtnRedOuter}>
                <TouchableOpacity
                  style={styles.actionBtnRedInner}
                  activeOpacity={0.85}
                  onPress={handleReject}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Chat Message / Blue Elevated Button (#C6EEFF outer ring, #14B9FF inner circle, white bubble with cyan lines) */}
              <View style={styles.actionBtnBlueOuter}>
                <TouchableOpacity
                  style={styles.actionBtnBlueInner}
                  activeOpacity={0.85}
                  onPress={handleOpenChat}
                >
                  <ActionChatIcon size={19} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Like Heart / Pink Button (#F4E7F1 outer ring, #F9C4EC middle ring, #FF1FC7 heart) */}
              <View style={styles.actionBtnPinkOutermost}>
                <View style={styles.actionBtnPinkMiddle}>
                  <TouchableOpacity
                    style={[styles.actionBtnPinkInner, isLiked && styles.actionBtnPinkLiked]}
                    activeOpacity={0.85}
                    onPress={handleToggleLike}
                  >
                    <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                      <Ionicons name="heart" size={22} color="#FF1FC7" />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : activeTab === 'people' ? (
          /* PEOPLE SCREEN INTEGRATED */
          <PeopleScreen showTabBar={false} showHeaderBar={true} />
        ) : activeTab === 'me' ? (
          /* BOY PROFILE SCREEN INTEGRATED */
          <MeScreen showTabBar={false} showHeaderBar={true} />
        ) : (
          <View style={styles.otherTabContainer}>
            <Text style={styles.otherTabTitle}>
              {(activeTab as string).charAt(0).toUpperCase() + (activeTab as string).slice(1)}
            </Text>
            <Text style={styles.otherTabSubText}>Section content coming soon</Text>
          </View>
        )}

        {/* Bottom Navigation Bar Matching Image 1 */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              setActiveTab('matches');
              router.push('/(tab)/matches' as any);
            }}
            activeOpacity={0.8}
          >
            <MatchesTabIcon color={activeTab === 'matches' ? '#0D7A74' : '#78B0A8'} size={22} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'matches' && styles.activeTabLabel,
              ]}
            >
              Matches
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              setActiveTab('likes');
              router.push('/(tab)/likes' as any);
            }}
            activeOpacity={0.8}
          >
            <LikesTabIcon color={activeTab === 'likes' ? '#0D7A74' : '#78B0A8'} size={22} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'likes' && styles.activeTabLabel,
              ]}
            >
              Likes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              setActiveTab('people');
              router.push('/(tab)/people' as any);
            }}
            activeOpacity={0.8}
          >
            <PeopleTabIcon color={activeTab === 'people' ? '#0D7A74' : '#78B0A8'} size={22} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'people' && styles.activeTabLabel,
              ]}
            >
              People
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              setSelectedPersonForChat(null);
              setActiveTab('chats');
              router.push('/(tab)/chats' as any);
            }}
            activeOpacity={0.8}
          >
            <ChatsTabIcon color={activeTab === 'chats' ? '#0D7A74' : '#78B0A8'} size={22} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'chats' && styles.activeTabLabel,
              ]}
            >
              Chats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              setActiveTab('me');
              router.push('/(tab)/me' as any);
            }}
            activeOpacity={0.8}
          >
            <MeTabIcon color={activeTab === 'me' ? '#0D7A74' : '#78B0A8'} size={22} />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'me' && styles.activeTabLabel,
              ]}
            >
              Me
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  // CHAT SCREEN STYLES
  chatScreenContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  chatHeaderBackBtn: {
    padding: 4,
  },
  chatHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  chatHeaderStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  chatHeaderStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  chatHeaderStatusText: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '600',
  },
  chatMessagesArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatMessagesContent: {
    paddingVertical: 16,
    gap: 10,
  },
  chatTimestampHeader: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginVertical: 6,
  },
  chatBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  chatBubbleProfile: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#14B9FF',
    borderBottomRightRadius: 4,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatBubbleTextProfile: {
    color: '#1F2937',
  },
  chatBubbleTextUser: {
    color: '#FFFFFF',
  },
  chatBubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatBubbleTimeProfile: {
    color: '#9CA3AF',
  },
  chatBubbleTimeUser: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quickPromptChip: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
  },
  chatSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#14B9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // LIKES SCREEN STYLES
  likesScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  likesHeader: {
    paddingTop: 18,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  likesHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  likesSubTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  likesSubTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  likesSubTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  activeLikesSubTabText: {
    color: '#111827',
    fontWeight: '800',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#0F766E',
    borderRadius: 1.5,
  },
  likesGridContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  likesGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  blurredCard: {
    flex: 1,
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#374151',
  },
  blurredCardImage: {
    width: '100%',
    height: '100%',
  },
  blurredCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  lockIconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNameText: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // OTHER TAB PLACEHOLDER STYLES
  otherTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  otherTabTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  otherTabSubText: {
    fontSize: 14,
    color: '#6B7280',
  },
  // MATCHES / PROFILE SCREEN STYLES
  topHeaderNav: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  likedToast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#FF1FC7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 9999,
    shadowColor: '#FF1FC7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  likedToastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop:20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  photoCardContainer: {
    width: '100%',
    height: 380,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
    marginBottom: 16,
  },
  horizontalImageScrollView: {
    width: '100%',
    height: 380,
  },
  imageSlide: {
    height: 380,
    position: 'relative',
  },
  profileImage: {
    height: 380,
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageOverlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  hundredPercentBadgeOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 25,
  },
  hundredPercentBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 3.5,
    elevation: 4,
  },
  hundredPercentBadgeText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rosetteBadgeOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 30,
  },
  carouselNavBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  carouselNavBtnLeft: {
    left: 10,
  },
  carouselNavBtnRight: {
    right: 10,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 15,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    width: 20,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  profileDetailsHeader: {
    marginBottom: 14,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  heightSuffix: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#86EFAC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  aboutMeCard: {
    backgroundColor: '#F4E8FC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  aboutMeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  aboutMeText: {
    fontSize: 13.5,
    color: '#374151',
    lineHeight: 19,
    fontWeight: '400',
  },
  interestChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  interestChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  interestChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  professionContainer: {
    gap: 10,
    marginTop: 16,
    marginBottom: 14,
  },
  professionPill: {
    backgroundColor: '#D1F5F5',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  professionPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  attributeBox: {
    width: '48%',
    backgroundColor: '#D1F5F5',
    borderRadius: 14,
    padding: 12,
  },
  attributeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  attributeTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1F2937',
    flexShrink: 1,
  },
  attributeDashes: {
    fontSize: 12,
    color: '#0D7A74',
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 2,
  },
  reportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
  },
  reportButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FF4D4D',
  },
  floatingActionRow: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
  },
  actionBtnRedOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFC5C5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnRedInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EB1B1B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnBlueOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C6EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionBtnBlueInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#14B9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPinkOutermost: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F4E7F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPinkMiddle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9C4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPinkInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4E7F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPinkLiked: {
    transform: [{ scale: 1.08 }],
  },
  bottomTabBar: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#78B0A8',
    marginTop: 6,
  },
  activeTabLabel: {
    color: '#0D7A74',
    fontWeight: '700',
  },
});
