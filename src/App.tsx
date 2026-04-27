import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { UserProfile } from './types';
import { Heart, MessageCircle, User as UserIcon, LogOut, Flame, Star, Zap, Shield, Languages, Radio, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Discovery } from './components/Discovery';
import { Matches } from './components/Matches';
import { ProfileEdit } from './components/ProfileEdit';
import { PremiumUpgrade } from './components/PremiumUpgrade';
import { AdminPanel } from './components/AdminPanel';
import FrequencyFeed from './components/FrequencyFeed';
import AuroraManual from './components/AuroraManual';
import { useLanguage } from './lib/LanguageContext';

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discovery' | 'frequency' | 'matches' | 'profile' | 'premium' | 'admin' | 'manual'>('discovery');
  const isAdmin = user?.email === 'ellanovachenko@gmail.com' || user?.email === 'user.test@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        } else {
          setActiveTab('profile'); 
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      return onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pop-black halftone space-y-8">
        <div className="w-48 h-48 border-8 border-pop-yellow rounded-full relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-2 border-4 border-dashed border-pop-cyan rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-20 h-20 bg-pop-pink border-4 border-pop-black flex items-center justify-center shadow-[6px_6px_0px_0px_white] rotate-12"
          >
            <Zap size={40} className="text-white" fill="currentColor" />
          </motion.div>
        </div>
        <div className="text-center space-y-4">
           <h2 className="font-pop text-4xl text-white italic drop-shadow-[4px_4px_0px_#00FFFF]">TUNING...</h2>
           <div className="bg-pop-pink text-white px-4 py-2 border-4 border-pop-black font-mono text-xs uppercase tracking-[0.2em] -rotate-2">
              Syncing Frequencies
           </div>
           <div className="flex gap-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [4, 20, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 bg-pop-cyan"
                />
              ))}
           </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="fixed top-4 right-4 flex gap-2">
          {['en', 'es', 'fr', 'de', 'it'].map((lang) => (
            <button 
              key={lang} 
              onClick={() => setLanguage(lang as any)}
              className={cn(
                "w-8 h-8 font-pop text-[10px] border-2 border-pop-black shadow-[2px_2px_0px_0px_black] uppercase",
                language === lang ? "bg-pop-pink text-white" : "bg-white"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pop-card p-12 max-w-md w-full space-y-8 bg-pop-yellow relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          {/* Animated Country Icons */}
          <div className="absolute top-0 right-0 p-4 flex gap-4 opacity-70">
             <motion.div 
               animate={{ rotate: [0, 10, -10, 0] }}
               transition={{ repeat: Infinity, duration: 3 }}
               className="text-2xl"
             >
               🇮🇹
             </motion.div>
             <motion.div 
               animate={{ y: [0, -5, 0] }}
               transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
               className="text-2xl"
             >
               🇩🇪
             </motion.div>
             <motion.div 
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}
               className="text-2xl"
             >
               🇫🇷
             </motion.div>
          </div>

          <div className="flex justify-center">
            <div className="w-24 h-24 bg-pop-pink border-4 border-pop-black flex items-center justify-center text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-6">
              <Heart size={48} fill="currentColor" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-pop text-pop-black drop-shadow-[4px_4px_0px_white]">EVA</h1>
            <p className="text-xl font-bold italic text-pop-black">{t('LOVE_IN_HIGH_CONTRAST')}</p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full pop-button-pink py-5 px-6 rounded-none text-xl"
          >
            <div className="flex items-center justify-center gap-3">
              <Star size={24} fill="currentColor" />
              {t('JOIN_THE_REVOLUTION')}
            </div>
          </button>
          <div className="bg-pop-cyan border-2 border-pop-black p-4 -rotate-2">
            <p className="text-xs font-bold uppercase tracking-widest text-pop-black">
              {t('AUTHENTIC_CONNECTIONS')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
             <button className="bg-pop-black text-white p-3 flex flex-col items-center justify-center border-2 border-white shadow-[4px_4px_0px_0px_black] hover:rotate-2 transition-transform">
                <span className="text-[7px] font-black tracking-widest uppercase opacity-70">GET IT ON</span>
                <span className="text-xs font-pop">GOOGLE PLAY</span>
             </button>
             <button className="bg-white text-pop-black p-3 flex flex-col items-center justify-center border-2 border-pop-black shadow-[4px_4px_0px_0px_black] -rotate-2 hover:rotate-0 transition-transform">
                <span className="text-[7px] font-black tracking-widest uppercase opacity-70">DOWNLOAD ON</span>
                <span className="text-xs font-pop uppercase">App Store</span>
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-24 px-4 pt-6">
      <header className="flex items-center justify-between px-4 py-4 pop-card bg-white mb-6">
        <div className="flex items-center gap-2">
          {profile?.subscriptionTier === 'elite' && (
            <button 
              onClick={() => setActiveTab('manual')}
              className={cn(
                "w-10 h-10 border-2 border-pop-black flex items-center justify-center transition-all",
                activeTab === 'manual' ? "bg-orange-500 text-white" : "bg-pop-black text-orange-500 hover:bg-orange-500 hover:text-white"
              )}
            >
              <FileText size={20} />
            </button>
          )}
          <div className="w-10 h-10 bg-pop-pink border-2 border-pop-black flex items-center justify-center text-white -rotate-3">
            <Heart size={20} fill="currentColor" />
          </div>
          <span className="font-pop text-3xl tracking-tight">EVA</span>
          <div className="flex flex-col gap-0">
             <div className="bg-pop-pink text-white px-1.5 py-0.5 text-[8px] font-black italic border-2 border-pop-black leading-none -rotate-2">18+ SIGNAL</div>
             <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${profile?.soundEnabled ? 'bg-green-500 animate-pulse shadow-[0_0_5px_green]' : 'bg-gray-400'}`} />
                <span className="text-[6px] font-mono text-pop-black/60 uppercase">{profile?.soundEnabled ? 'UNMUTED' : 'SILENT'}</span>
             </div>
          </div>
        </div>
        
        {profile?.isPremium && (
          <div className="bg-pop-yellow border-2 border-pop-black px-3 py-1 font-pop text-xs rotate-3">
            PRO
          </div>
        )}

        <button 
          onClick={() => auth.signOut()}
          className="pop-button-cyan p-2"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'discovery' && <Discovery key="discovery" user={user} profile={profile} />}
          {activeTab === 'frequency' && <FrequencyFeed key="frequency" user={user} profile={profile!} />}
          {activeTab === 'matches' && <Matches key="matches" user={user} />}
          {activeTab === 'profile' && <ProfileEdit key="profile" user={user} profile={profile} onUpdate={(p) => setProfile(p)} />}
          {activeTab === 'premium' && <PremiumUpgrade key="premium" user={user} profile={profile} />}
          {activeTab === 'manual' && <AuroraManual key="manual" />}
          {activeTab === 'admin' && isAdmin && <AdminPanel key="admin" user={user} />}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-lg pop-card bg-pop-yellow p-1 flex justify-between overflow-hidden">
        <NavButton 
          active={activeTab === 'discovery'} 
          onClick={() => setActiveTab('discovery')}
          icon={<Heart size={28} />}
          label={t('EXPLORE')}
          color="magenta"
        />
        <NavButton 
          active={activeTab === 'frequency'} 
          onClick={() => setActiveTab('frequency')}
          icon={<Radio size={28} />}
          label="VIBE"
          color="yellow"
        />
        <NavButton 
          active={activeTab === 'matches'} 
          onClick={() => setActiveTab('matches')}
          icon={<MessageCircle size={28} />}
          label={t('CHATS')}
          color="cyan"
        />
        <NavButton 
          active={activeTab === 'premium'} 
          onClick={() => setActiveTab('premium')}
          icon={<Zap size={28} />}
          label={t('UPGRADE')}
          isSpecial
          color="white"
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={<UserIcon size={28} />}
          label={t('ME')}
          color="black"
        />
        {isAdmin && (
          <NavButton 
            active={activeTab === 'admin'} 
            onClick={() => setActiveTab('admin')}
            icon={<Shield size={28} />}
            label={t('ADMIN')}
            color="white"
          />
        )}
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, isSpecial, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isSpecial?: boolean, color: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center flex-1 h-16 transition-all duration-200 border-pop-black",
        active ? "bg-white border-x-4 z-10" : "hover:bg-white/50"
      )}
    >
      <div className={cn(
        "relative z-10",
        active ? "text-pop-pink scale-110" : "text-pop-black"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-pop tracking-widest mt-0.5 z-10">{label}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white"
        />
      )}
    </button>
  );
}

