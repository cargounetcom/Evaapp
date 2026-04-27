import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Heart, Star, Zap } from 'lucide-react';

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
  const [soundEnabled, setSoundEnabled] = useState(profile?.soundEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict +18 Check
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    if (age < 18) {
      alert('SYSTEM_ERROR: MUST_BE_18+_TO_ACCESS_SONIC_FREQUENCIES');
      return;
    }

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
      soundEnabled,
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
                  className={`w-12 h-6 border-2 border-white transition-all p-1 ${isIncognito ? "bg-pop-cyan" : "bg-pop-pink"}`}
                >
                   <motion.div 
                    animate={{ x: isIncognito ? 24 : 0 }}
                    className="w-4 h-full bg-white shadow-[2px_2px_0px_0px_black]" 
                   />
                </button>
             </div>
          )}

          {/* Sound Toggle */}
          <div className="bg-pop-black border-2 border-pop-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_#00FFFF]">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pop-pink flex items-center justify-center border-2 border-pop-black text-white">
                   <div className="animate-pulse">
                     <Zap size={16} fill="currentColor" />
                   </div>
                </div>
                <span className="font-pop text-white text-xs tracking-widest">UNMUTE_SIGNAL</span>
             </div>
             <button 
               type="button"
               onClick={() => setSoundEnabled(!soundEnabled)}
               className={`w-12 h-6 border-2 border-white transition-all p-1 ${soundEnabled ? "bg-pop-cyan" : "bg-pop-black"}`}
             >
                <motion.div 
                 animate={{ x: soundEnabled ? 24 : 0 }}
                 className="w-4 h-full bg-white shadow-[2px_2px_0px_0px_black]" 
                />
             </button>
          </div>

          {/* Elite: Avatar Style Selection */}
          {profile?.subscriptionTier === 'elite' && (
             <div className="bg-white border-2 border-pop-black p-4 space-y-3 shadow-[4px_4px_0px_0px_black]">
                <p className="font-pop text-[10px] text-pop-black uppercase font-black">AVATAR_PROTOCOL:</p>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                     type="button"
                     className="bg-pop-cyan border-2 border-pop-black py-2 font-pop text-[8px] uppercase hover:bg-pop-pink hover:text-white transition-all"
                     onClick={() => alert('REAL_PROTOCOL_ACTIVE')}
                   >
                     REAL_PROFILE
                   </button>
                   <button 
                     type="button"
                     className="bg-pop-yellow border-2 border-pop-black py-2 font-pop text-[8px] uppercase hover:bg-pop-pink hover:text-white transition-all"
                     onClick={() => alert('ANIME_PROTOCOL_ACTIVE')}
                   >
                     ANIME_INCOGNITO
                   </button>
                </div>
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

            {gender === 'female' && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-pop-pink border-4 border-pop-black p-4 rotate-1 shadow-[4px_4px_0px_0px_white] flex items-center gap-3"
              >
                  <div className="bg-pop-yellow p-2 border-2 border-pop-black">
                    <Star size={20} className="text-pop-black animate-spin" fill="currentColor" />
                  </div>
                  <div>
                    <h5 className="font-pop text-xs text-white leading-tight">SPECIAL REVOLUTION BONUS:</h5>
                    <p className="font-bold text-[10px] text-white uppercase italic">FREE PRO FEATURES FOR LADIES!</p>
                  </div>
              </motion.div>
            )}

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

      {/* Support Hub & Coupon Section */}
      <div className="mt-8 space-y-6">
         {/* 10% Coupon Card */}
         <motion.div 
           initial={{ scale: 0.9, rotate: -2 }}
           animate={{ scale: 1, rotate: 1 }}
           className="bg-pop-yellow border-4 border-pop-black p-4 shadow-[8px_8px_0px_0px_black] relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 bg-pop-pink text-white px-4 py-1 font-pop text-[10px] -rotate-45 translate-x-4 translate-y-2 border-2 border-pop-black">
               ELITE_ONLY
            </div>
            <div className="flex items-center gap-4">
               <div className="flex-1">
                  <h4 className="font-pop text-xl text-pop-black leading-none">SIGNAL_BOOST_PRO</h4>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-pop-black/60 italic">USE CODE: VIBRATION_10</p>
               </div>
               <div className="text-4xl font-pop text-pop-pink drop-shadow-[2px_2px_0px_black]">10%</div>
            </div>
            <div className="mt-3 border-t-2 border-pop-black border-dashed pt-2">
               <p className="text-[8px] font-mono uppercase text-pop-black">VALID FOR NEXT 3 DISCOVERY BROADCASTS</p>
            </div>
         </motion.div>

         <div className="bg-pop-black p-6 border-4 border-pop-black space-y-6 shadow-[8px_8px_0px_0px_#00FFFF] -rotate-1">
            <div className="space-y-1">
               <h3 className="font-pop text-2xl text-white italic tracking-tighter underline decoration-pop-cyan">SUPPORT_SIGNAL</h3>
               <p className="text-[10px] text-pop-cyan font-bold uppercase tracking-widest leading-none">COMMAND CENTER REACHABLE AT:</p>
            </div>
            
            <div className="space-y-3">
               <a 
                 href="mailto:ellanovachenko@gmail.com"
                 className="group block bg-pop-cyan border-2 border-pop-black p-4 text-pop-black font-pop text-center hover:bg-white transition-all shadow-[4px_4px_0px_0px_white] active:shadow-none active:translate-x-1 active:translate-y-1"
               >
                 <span>DEPLOY_MAIL(ellanovachenko@...)</span>
               </a>

               <div className="relative">
                  <input 
                    type="email" 
                    placeholder="ENTER_SIGNAL_MAIL..."
                    className="w-full bg-white/10 border-2 border-pop-cyan/30 p-3 font-mono text-[10px] text-pop-cyan outline-none focus:border-pop-cyan"
                  />
                  <button className="absolute right-2 top-2 bg-pop-cyan text-pop-black px-3 py-1 font-pop text-[8px] uppercase font-black hover:bg-white shadow-[2px_2px_0px_0px_black] active:shadow-none transition-all">
                    DEPLOY_MAIL
                  </button>
               </div>
            </div>

            <div className="flex justify-between items-center text-white/30 text-[8px] font-mono border-t border-white/10 pt-4">
               <span>CORE: EVA_v5.2_PRODUCTION</span>
               <span>UPLINK: ACTIVE</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

