import { ImageSourcePropType } from 'react-native';

export const ASSET_IMAGES: Record<string, ImageSourcePropType> = {
  profile1: require('../../assets/images/profile_asset1.jpg'),
  profile2: require('../../assets/images/profile_asset2.jpg'),
  profile3: require('../../assets/images/profile_asset3.jpg'),
  userProfile: require('../../assets/images/user-profile.jpg'),
  image2: require('../../assets/images/image 2.png'),
  login2: require('../../assets/images/login2.png'),
  login3: require('../../assets/images/login3.png'),
};

export interface ActiveUser {
  id: string;
  name: string;
  age: number;
  image: ImageSourcePropType;
  isOnline: boolean;
}

export interface NearYouUser {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  image: ImageSourcePropType;
}

export interface YouMayLikeUser {
  id: string;
  name: string;
  age: number;
  profession: string;
  matchPercentage: number;
  image: ImageSourcePropType;
}

export interface SimilarInterestUser {
  id: string;
  name: string;
  age: number;
  interest: string;
  image: ImageSourcePropType;
}

export interface SameReligionUser {
  id: string;
  name: string;
  age: number;
  religion: string;
  image: ImageSourcePropType;
}

export interface RecentlyActiveUser {
  id: string;
  name: string;
  age: number;
  timeAgo: string;
  image: ImageSourcePropType;
}

export interface ChatMessage {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  status?: 'sent' | 'delivered' | 'read';
  isOnline?: boolean;
}

export interface CallLog {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
  type: 'audio' | 'video';
  label: string;
  timestamp: string;
  duration: string;
}

export interface LikeCardItem {
  id: string;
  name: string;
  age: number;
  location?: string;
  matchPercentage?: number;
  image: ImageSourcePropType;
  likedAt?: string;
}

export const ACTIVE_USERS: ActiveUser[] = [
  { id: 'act-1', name: 'Pinky', age: 23, image: ASSET_IMAGES.profile1, isOnline: true },
  { id: 'act-2', name: 'Chinky', age: 23, image: ASSET_IMAGES.profile2, isOnline: true },
  { id: 'act-3', name: 'Aastha', age: 23, image: ASSET_IMAGES.profile3, isOnline: true },
  { id: 'act-4', name: 'Winni', age: 23, image: ASSET_IMAGES.userProfile, isOnline: true },
  { id: 'act-5', name: 'Ananya', age: 24, image: ASSET_IMAGES.image2, isOnline: true },
  { id: 'act-6', name: 'Swathi', age: 23, image: ASSET_IMAGES.login2, isOnline: true },
  { id: 'act-7', name: 'Priya', age: 22, image: ASSET_IMAGES.login3, isOnline: true },
];

export const NEAR_YOU_USERS: NearYouUser[] = [
  { id: 'near-1', name: 'Ananya', age: 24, location: 'Hyderabad', distance: '2.5 km', image: ASSET_IMAGES.profile1 },
  { id: 'near-2', name: 'Ananya', age: 34, location: 'Hyderabad', distance: '4 km', image: ASSET_IMAGES.profile3 },
  { id: 'near-3', name: 'Ananya', age: 24, location: 'Hyderabad', distance: '2.5 km', image: ASSET_IMAGES.image2 },
  { id: 'near-4', name: 'Swathi', age: 23, location: 'Hyderabad', distance: '2.1 km', image: ASSET_IMAGES.userProfile },
  { id: 'near-5', name: 'Chikky', age: 24, location: 'Bangalore', distance: '4.8 km', image: ASSET_IMAGES.profile2 },
  { id: 'near-6', name: 'Rani', age: 25, location: 'Hyderabad', distance: '5.2 km', image: ASSET_IMAGES.login2 },
];

export const YOU_MAY_LIKE_USERS: YouMayLikeUser[] = [
  { id: 'like-1', name: 'Ananya', age: 24, profession: 'Software Engineer', matchPercentage: 82, image: ASSET_IMAGES.profile1 },
  { id: 'like-2', name: 'Ananya', age: 24, profession: 'Software Engineer', matchPercentage: 81, image: ASSET_IMAGES.profile3 },
  { id: 'like-3', name: 'Ananya', age: 34, profession: 'Software Engineer', matchPercentage: 82, image: ASSET_IMAGES.image2 },
  { id: 'like-4', name: 'Priya', age: 22, profession: 'UI/UX Designer', matchPercentage: 92, image: ASSET_IMAGES.userProfile },
  { id: 'like-5', name: 'Teju', age: 23, profession: 'Architect', matchPercentage: 78, image: ASSET_IMAGES.profile2 },
  { id: 'like-6', name: 'Ammu', age: 23, profession: 'Product Designer', matchPercentage: 95, image: ASSET_IMAGES.login3 },
];

export const SIMILAR_INTEREST_USERS: SimilarInterestUser[] = [
  { id: 'sim-1', name: 'Priya', age: 23, interest: 'Music', image: ASSET_IMAGES.profile1 },
  { id: 'sim-2', name: 'Priya', age: 23, interest: 'Movie', image: ASSET_IMAGES.profile3 },
  { id: 'sim-3', name: 'Priya', age: 23, interest: 'Travel', image: ASSET_IMAGES.image2 },
  { id: 'sim-4', name: 'Priya', age: 23, interest: 'Music', image: ASSET_IMAGES.profile2 },
  { id: 'sim-5', name: 'Swathi', age: 23, interest: 'Dance', image: ASSET_IMAGES.userProfile },
  { id: 'sim-6', name: 'Rani', age: 25, interest: 'Art', image: ASSET_IMAGES.login2 },
];

export const SAME_RELIGION_USERS: SameReligionUser[] = [
  { id: 'rel-1', name: 'Teju', age: 23, religion: 'Hindu', image: ASSET_IMAGES.profile1 },
  { id: 'rel-2', name: 'Lilly', age: 23, religion: 'Hindu', image: ASSET_IMAGES.profile3 },
  { id: 'rel-3', name: 'Priya', age: 23, religion: 'Hindu', image: ASSET_IMAGES.image2 },
  { id: 'rel-4', name: 'Bhanu', age: 23, religion: 'Hindu', image: ASSET_IMAGES.profile2 },
  { id: 'rel-5', name: 'Swathi', age: 23, religion: 'Hindu', image: ASSET_IMAGES.userProfile },
  { id: 'rel-6', name: 'Rani', age: 25, religion: 'Hindu', image: ASSET_IMAGES.login2 },
];

export const RECENTLY_ACTIVE_USERS: RecentlyActiveUser[] = [
  { id: 'rec-1', name: 'Teju', age: 23, timeAgo: '10 min ago', image: ASSET_IMAGES.profile1 },
  { id: 'rec-2', name: 'Lilly', age: 23, timeAgo: '15 min ago', image: ASSET_IMAGES.profile3 },
  { id: 'rec-3', name: 'Priya', age: 23, timeAgo: '50 min ago', image: ASSET_IMAGES.image2 },
  { id: 'rec-4', name: 'Pallu', age: 23, timeAgo: '11 min ago', image: ASSET_IMAGES.profile2 },
  { id: 'rec-5', name: 'Swathi', age: 23, timeAgo: '25 min ago', image: ASSET_IMAGES.userProfile },
  { id: 'rec-6', name: 'Rani', age: 25, timeAgo: '1 hr ago', image: ASSET_IMAGES.login2 },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    name: 'Ananya',
    avatar: ASSET_IMAGES.profile1,
    lastMessage: 'Hey! How are you doing?',
    timestamp: '09:30 AM',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'chat-2',
    name: 'Swathi',
    avatar: ASSET_IMAGES.profile3,
    lastMessage: 'Hello!',
    timestamp: 'Yesterday',
    unreadCount: 2,
    isOnline: false,
  },
  {
    id: 'chat-3',
    name: 'Priya',
    avatar: ASSET_IMAGES.profile2,
    lastMessage: 'Okay',
    timestamp: 'Mon',
    status: 'delivered',
    isOnline: true,
  },
  {
    id: 'chat-4',
    name: 'Teju',
    avatar: ASSET_IMAGES.userProfile,
    lastMessage: 'Hellooo',
    timestamp: '06/06',
    status: 'read',
    isOnline: true,
  },
  {
    id: 'chat-5',
    name: 'Rani',
    avatar: ASSET_IMAGES.login2,
    lastMessage: 'Hey! are you there?',
    timestamp: '12/07/25',
    unreadCount: 1,
    isOnline: false,
  },
];

export const CALL_LOGS: CallLog[] = [
  {
    id: 'call-1',
    name: 'Ananya',
    avatar: ASSET_IMAGES.profile1,
    type: 'audio',
    label: 'Audio call',
    timestamp: 'Today, 08:38 AM',
    duration: '00:24',
  },
  {
    id: 'call-2',
    name: 'Ananya',
    avatar: ASSET_IMAGES.userProfile,
    type: 'video',
    label: 'Video call',
    timestamp: 'Today, 09:39 AM',
    duration: '00:24',
  },
  {
    id: 'call-3',
    name: 'Ananya',
    avatar: ASSET_IMAGES.profile2,
    type: 'audio',
    label: 'Audio call',
    timestamp: 'Today, 08:38 AM',
    duration: '00:24',
  },
  {
    id: 'call-4',
    name: 'Ananya',
    avatar: ASSET_IMAGES.profile3,
    type: 'audio',
    label: 'Audio call',
    timestamp: 'Today, 08:38 AM',
    duration: '00:24',
  },
];

export const LIKED_YOU_DATA: LikeCardItem[] = [
  { id: 'ly-1', name: 'Ammu', age: 23, location: 'Hyderabad', matchPercentage: 92, image: ASSET_IMAGES.profile1, likedAt: '2 hrs ago' },
  { id: 'ly-2', name: 'Chikky', age: 23, location: 'Bangalore', matchPercentage: 88, image: ASSET_IMAGES.profile2, likedAt: '5 hrs ago' },
  { id: 'ly-3', name: 'Priya', age: 22, location: 'Mumbai', matchPercentage: 95, image: ASSET_IMAGES.profile3, likedAt: '1 day ago' },
  { id: 'ly-4', name: 'Pinky', age: 23, location: 'Hyderabad', matchPercentage: 85, image: ASSET_IMAGES.userProfile, likedAt: '2 days ago' },
];

export const YOU_LIKED_DATA: LikeCardItem[] = [
  { id: 'yl-1', name: 'Ananya', age: 24, location: 'Hyderabad', matchPercentage: 96, image: ASSET_IMAGES.profile3, likedAt: 'Yesterday' },
  { id: 'yl-2', name: 'Swathi', age: 23, location: 'Hyderabad', matchPercentage: 90, image: ASSET_IMAGES.profile2, likedAt: '3 days ago' },
  { id: 'yl-3', name: 'Teju', age: 23, location: 'Hyderabad', matchPercentage: 87, image: ASSET_IMAGES.userProfile, likedAt: '4 days ago' },
  { id: 'yl-4', name: 'Rani', age: 25, location: 'Hyderabad', matchPercentage: 84, image: ASSET_IMAGES.login2, likedAt: '1 week ago' },
];
