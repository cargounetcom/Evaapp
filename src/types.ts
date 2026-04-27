export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  interests?: string[];
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  lookingFor: 'male' | 'female' | 'everyone';
  isPremium: boolean;
  subscriptionTier: 'free' | 'pro' | 'elite' | 'viking';
  isIncognito: boolean;
  soundEnabled?: boolean;
  distance?: number;
  feedsBalance?: number;
  lastVibration?: {
    text: string;
    timestamp: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Vibration {
  id: string;
  userId: string;
  userName: string;
  photoURL: string;
  text: string;
  color: string;
  timestamp: string;
  mediaURL?: string;
  mediaType?: 'image' | 'video';
}

export interface Feed {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  imageUrls: string[];
  message: string;
  createdAt: any;
  expiresAt: any;
}

export interface Swipe {
  swiperId: string;
  swipedId: string;
  type: 'like' | 'pass';
  createdAt: string;
}

export interface Match {
  id: string;
  users: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
}
