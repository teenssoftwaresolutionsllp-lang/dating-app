import { apiRequest } from "./api";

export type SwipeDirection = "like" | "dislike" | "superlike";

export interface DiscoveryCard {
  userId: string;
  name: string;
  age: number | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  heightCm: number | null;
  heightFt: string | null;
  formattedHeight?: string | null;
  isOnline: boolean;
  location: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  religion?: string | null;
  foodPreference?: string | null;
  drinking?: string | null;
  smoking?: string | null;
  vibes?: string[];
  nature?: string[];
  lookingFor?: string[];
  distanceKm?: number;
  bio: string | null;
  relationshipStatus: string | null;
  trustScore?: {
    score?: number;
    totalScore?: number;
    badge?: string;
    color?: string;
    isVerified?: boolean;
    isKycVerified?: boolean;
  };
  photos: {
    id: string;
    url: string;
    isPrimary: boolean;
    displayOrder: number;
  }[];
  education: {
    educationLevel?: string | null;
    level?: string | null;
    qualification?: string | null;
    profession?: string | null;
    institution?: string | null;
    companyName?: string | null;
    company?: string | null;
    incomeRange?: string | null;
  } | null;
  languages: string[];
  interests?: string[];
}

export interface SwipeResponse {
  direction: SwipeDirection;
  isMatch: boolean;
  matchId?: string | null;
  action?: string;
  targetUserId?: string;
  matchedUser?: {
    id: string;
    name: string;
    photo: string | null;
    age: number | null;
    trustScore?: any;
  };
}

export interface MatchItem {
  matchId: string;
  matchedAt: string;
  status: string;
  hasChatStarted: boolean;
  conversationId?: string | null;
  user: {
    id?: string;
    userId?: string;
    name: string;
    age: number | null;
    heightFt?: string | null;
    location: string | null;
    city: string | null;
    profession?: string | null;
    primaryPhoto: string | null;
    isOnline: boolean;
    trustScore?: any;
    education?: {
      qualification?: string | null;
      profession?: string | null;
    } | null;
  };
}

export interface LikeReceivedItem {
  swipeId?: string;
  userId?: string;
  name?: string;
  age?: number | null;
  photo?: string | null;
  likedAt?: string;
  isSuperLike?: boolean;
  action?: string;
  user?: {
    userId: string;
    name: string;
    age: number | null;
    formattedHeight?: string;
    city?: string;
    profession?: string;
    trustScore?: number | any;
    primaryPhoto?: string;
  };
}

export interface SentLikeItem {
  userId: string;
  name: string;
  age: number | null;
  city: string | null;
  location: string | null;
  profession: string | null;
  photo: string | null;
  action: string;
  likedAt: string;
  trustScore?: any;
}

export interface CategoryUser {
  id: string;
  userId?: string;
  name: string;
  age: number;
  location: string;
  city: string;
  religion: string;
  profession: string;
  distance: string;
  matchPercentage: number;
  interest: string;
  timeAgo: string;
  isOnline: boolean;
  image: string | null;
}

export interface PeopleCategoriesResponse {
  active: CategoryUser[];
  nearYou: CategoryUser[];
  youMayLike: CategoryUser[];
  similarInterest: CategoryUser[];
  sameReligion: CategoryUser[];
  recentlyActive: CategoryUser[];
}

// 1. Discovery Feed Cards
export async function getDiscoveryFeed(
  page: number = 1,
  limit: number = 10,
): Promise<DiscoveryCard[]> {
  try {
    const cards = await apiRequest<DiscoveryCard[]>(
      `/api/v1/matches/feed?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
    );
    return cards || [];
  } catch (error) {
    console.warn("Failed to load discovery feed:", error);
    return [];
  }
}

// 2. People Categories
export async function getPeopleCategories(): Promise<PeopleCategoriesResponse | null> {
  try {
    const categories = await apiRequest<PeopleCategoriesResponse>(
      "/api/v1/matches/people-categories",
      {
        method: "GET",
      },
    );
    return categories || null;
  } catch (error) {
    console.warn("Failed to load people categories:", error);
    return null;
  }
}

// 3. Swipe (Like / Dislike / Superlike)
export async function swipeUser(
  targetUserId: string,
  direction: SwipeDirection,
): Promise<SwipeResponse> {
  return apiRequest<SwipeResponse>("/api/v1/matches/swipe", {
    method: "POST",
    body: JSON.stringify({ targetUserId, direction }),
  });
}

// 4. Mutual Matches List
export async function getMatches(): Promise<MatchItem[]> {
  return apiRequest<MatchItem[]>("/api/v1/matches", {
    method: "GET",
  });
}

// 5. Likes Received (Who liked me)
export async function getLikesReceived(): Promise<LikeReceivedItem[]> {
  try {
    const likes = await apiRequest<LikeReceivedItem[]>(
      "/api/v1/matches/likes",
      {
        method: "GET",
      },
    );
    return likes || [];
  } catch (error) {
    console.warn("Failed to load received likes:", error);
    return [];
  }
}

// 6. Sent Likes (Profiles you liked)
export async function getSentLikes(): Promise<SentLikeItem[]> {
  try {
    const sentLikes = await apiRequest<SentLikeItem[]>(
      "/api/v1/matches/sent-likes",
      {
        method: "GET",
      },
    );
    return sentLikes || [];
  } catch (error) {
    console.warn("Failed to load sent likes:", error);
    return [];
  }
}

// 7. Start Chat with a Match
export async function startMatchChat(
  matchId: string,
): Promise<{ conversationId: string }> {
  return apiRequest<{ conversationId: string }>(
    `/api/v1/matches/${matchId}/chat`,
    {
      method: "POST",
    },
  );
}

// 8. Unmatch
export async function unmatchUser(matchId: string): Promise<void> {
  await apiRequest(`/api/v1/matches/${matchId}`, {
    method: "DELETE",
  });
}

// 9. Block / Report Safety
export async function blockUser(targetUserId: string): Promise<void> {
  await apiRequest("/api/v1/matches/block", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

export async function reportUser(
  targetUserId: string,
  reason: string,
  details?: string,
): Promise<void> {
  await apiRequest("/api/v1/matches/report", {
    method: "POST",
    body: JSON.stringify({ targetUserId, reason, details }),
  });
}
