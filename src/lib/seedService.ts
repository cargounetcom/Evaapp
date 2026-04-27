import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

const DEMO_PROFILES: Partial<UserProfile>[] = [
  // Anime / Incognito Profiles
  {
    displayName: 'NeonKitten',
    bio: 'Lost in the digital frequency. Finding harmony in chaos.',
    photoURL: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=400&fit=crop',
    gender: 'female',
    lookingFor: 'everyone',
    birthDate: '2000-01-01',
    isPremium: true,
    subscriptionTier: 'elite',
    isIncognito: true,
  },
  {
    displayName: 'GlitchMaster',
    bio: 'System error 404: Emotion not found. Re-tuning now.',
    photoURL: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop',
    gender: 'male',
    lookingFor: 'female',
    birthDate: '1995-05-15',
    isPremium: true,
    subscriptionTier: 'pro',
    isIncognito: true,
  },
  {
    displayName: 'CyberArt',
    bio: 'Life is a pixel, and I am the brush.',
    photoURL: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop',
    gender: 'other',
    lookingFor: 'everyone',
    birthDate: '1998-11-20',
    isPremium: true,
    subscriptionTier: 'elite',
    isIncognito: true,
  },
  {
    displayName: 'SynthWave_01',
    bio: 'Retro future enthusiast. Analog heart, digital soul.',
    photoURL: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=400&fit=crop',
    gender: 'female',
    lookingFor: 'male',
    birthDate: '2002-03-10',
    isPremium: true,
    subscriptionTier: 'pro',
    isIncognito: true,
  },
  {
    displayName: 'VoidWalker',
    bio: 'Walking between frequencies. Silent but resonant.',
    photoURL: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=400&h=400&fit=crop',
    gender: 'male',
    lookingFor: 'everyone',
    birthDate: '1990-09-09',
    isPremium: true,
    subscriptionTier: 'elite',
    isIncognito: true,
  },
  // Real Profiles
  {
    displayName: 'Alex_Urban',
    bio: 'Street photographer and coffee addict. Let\'s capture a moment.',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    gender: 'male',
    lookingFor: 'female',
    birthDate: '1992-06-12',
    isPremium: false,
    subscriptionTier: 'free',
    isIncognito: false,
  },
  {
    displayName: 'Maya_Art',
    bio: 'Painter by day, vibrator by night. Looking for deep resonance.',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    gender: 'female',
    lookingFor: 'male',
    birthDate: '1996-08-25',
    isPremium: true,
    subscriptionTier: 'pro',
    isIncognito: false,
  },
  {
    displayName: 'Jordan_Flow',
    bio: 'Yoga, travel, and adventure. High energy only.',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    gender: 'male',
    lookingFor: 'everyone',
    birthDate: '1988-12-05',
    isPremium: false,
    subscriptionTier: 'free',
    isIncognito: false,
  },
  {
    displayName: 'Sam_Creative',
    bio: 'Designer exploring the intersection of tech and humanity.',
    photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    gender: 'other',
    lookingFor: 'everyone',
    birthDate: '1994-02-18',
    isPremium: true,
    subscriptionTier: 'pro',
    isIncognito: false,
  },
  {
    displayName: 'Elena_Vibe',
    bio: 'Music is my frequency. Let\'s sync up.',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    gender: 'female',
    lookingFor: 'everyone',
    birthDate: '1999-10-30',
    isPremium: true,
    subscriptionTier: 'elite',
    isIncognito: false,
  }
];

export async function seedDemoProfiles() {
  const batch = writeBatch(db);
  
  DEMO_PROFILES.forEach((profile) => {
    const id = `demo_${Math.random().toString(36).substr(2, 9)}`;
    const docRef = doc(db, 'profiles', id);
    batch.set(docRef, {
      ...profile,
      userId: id,
      soundEnabled: true,
      feedsBalance: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  await batch.commit();
}
