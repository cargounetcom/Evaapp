import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Heart, Star } from 'lucide-react';

interface Props {
  user: User;
  profile: UserProfile | null;
  onUpdate: (profile: UserProfile) => void;
}

export function ProfileEdit({ user, profile, onUpdate }: Props) {
  const [displayName, setDisplayName] = useState(profile?.displayName || user.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [gender, setGender] = useState<UserProfile['gender']>(profile?.gender || 'female');
  const [lookingFor, setLookingFor] = useState<UserProfile['lookingFor']>(profile?.lookingFor || 'everyone');
  const [birthDate, setBirthDate] = useState(profile?.birthDate || '');
  const [isIncognito, setIsIncognito] = useState(profile?.isIncognito || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const newProfile: UserProfile = {
      userId: user.uid,
      displayName: displayName.toUpperCase(),
      email: user.email || '',
      photoURL: user.photoURL || '',
      bio,
      gender,
      lookingFor,
      birthDate,
      isPremium: profile?.isPremium || false,
      subscriptionTier: profile?.subscriptionTier || 'free',
      isIncognito: profile?.subscriptionTier === 'elite' ? isIncognito : false,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'profiles', user.uid), newProfile);
      onUpdate(newProfile);
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-6 pb-8"
    >
      <div className="text-center bg-pop-pink border-4 border-pop-black p-4 rotate-1 shadow-[8px_8px_0px_0px_white]">
        <h2 className="text-4xl font-pop text-white tracking-widest">WHO ARE YOU?</h2>
        <p className="text-pop-black font-bold uppercase italic text-sm">TELL THE WORLD YOUR STORY!</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="pop-card bg-pop-yellow p-6 space-y-6 -rotate-1">
          {/* Elite Feature: Incognito Toggle */}
          {profile?.subscriptionTier === 'elite' && (
             <div className="bg-pop-black border-2 border-pop-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_white]">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-pop-cyan flex items-center justify-center border-2 border-pop-black text-pop-black">
                      <Star size={16} fill="currentColor" />
                   </div>
                   <span className="font-pop text-white text-xs tracking-widest">INCOGNITO MODE</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsIncognito(!isIncognito)}
                  className={cn(
                    "w-12 h-6 border-2 border-white transition-all p-1",
                    isIncognito ? "bg-pop-cyan" : "bg-pop-pink"
                  )}
                >
                   <motion.div 
                    animate={{ x: isIncognito ? 24 : 0 }}
                    className="w-4 h-full bg-white shadow-[2px_2px_0px_0px_black]" 
                   />
                </button>
             </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 border-4 border-pop-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3 overflow-hidden">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-pop-cyan border-2 border-pop-black px-4 py-1 text-[10px] font-bold uppercase tracking-widest -rotate-2">
              LEVEL 1 HUMAN
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-pop uppercase text-sm tracking-widest text-pop-black">Stage Name</label>
              <input 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="YOUR NAME IN LIGHTS..."
                className="w-full bg-white border-4 border-pop-black p-4 focus:bg-pop-cyan outline-none transition-all font-bold placeholder:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-pop uppercase text-sm tracking-widest text-pop-black">Your Manifesto</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="BE BOLD. BE YOU. BE LOUD."
                className="w-full bg-white border-4 border-pop-black p-4 h-32 focus:bg-pop-cyan outline-none transition-all resize-none font-bold placeholder:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="font-pop uppercase text-xs tracking-widest text-pop-black">Arrival Date</label>
                 <input 
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white border-4 border-pop-black p-4 outline-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                 <label className="font-pop uppercase text-xs tracking-widest text-pop-black">Vibe</label>
                 <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-white border-4 border-pop-black p-4 outline-none font-bold"
                >
                  <option value="male">GUY</option>
                  <option value="female">GIRL</option>
                  <option value="other">OTHER</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
               <label className="font-pop uppercase text-sm tracking-widest text-pop-black">Seeking Souls</label>
               <select 
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value as any)}
                className="w-full bg-white border-4 border-pop-black p-4 outline-none font-bold"
              >
                <option value="male">GUYS</option>
                <option value="female">GIRLS</option>
                <option value="everyone">EVERYBODY</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="pop-button-pink w-full py-6 text-2xl flex items-center justify-center gap-4"
        >
          {isSaving ? "TRANSMITTING..." : (
            <>
              <Star size={28} fill="currentColor" />
              LOCK IT IN!
              <Heart size={28} fill="currentColor" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

