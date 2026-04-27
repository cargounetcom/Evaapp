import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { UserProfile } from './types';
import { Heart, MessageCircle, User as UserIcon, LogOut, Flame, Star, Zap, Shield, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Discovery } from './components/Discovery';
import { Matches } from './components/Matches';
import { ProfileEdit } from './components/ProfileEdit';
import { PremiumUpgrade } from './components/PremiumUpgrade';
import { AdminPanel } from './components/AdminPanel';
import { useLanguage } from './lib/LanguageContext';

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discovery' | 'matches' | 'profile' | 'premium' | 'admin'>('discovery');
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
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-16 h-16 bg-pop-yellow border-4 border-pop-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Zap size={32} />
        </motion.div>
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-24 px-4 pt-6">
      <header className="flex items-center justify-between px-4 py-4 pop-card bg-white mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-pop-pink border-2 border-pop-black flex items-center justify-center text-white -rotate-3">
            <Heart size={20} fill="currentColor" />
          </div>
          <span className="font-pop text-3xl tracking-tight">EVA</span>
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
          {activeTab === 'matches' && <Matches key="matches" user={user} />}
          {activeTab === 'profile' && <ProfileEdit key="profile" user={user} profile={profile} onUpdate={(p) => setProfile(p)} />}
          {activeTab === 'premium' && <PremiumUpgrade key="premium" user={user} profile={profile} />}
          {activeTab === 'admin' && isAdmin && <AdminPanel key="admin" user={user} />}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm pop-card bg-pop-yellow p-1 flex justify-between overflow-hidden">
        <NavButton 
          active={activeTab === 'discovery'} 
          onClick={() => setActiveTab('discovery')}
          icon={<Heart size={28} />}
          label={t('EXPLORE')}
          color="magenta"
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
        "relative flex flex-col items-center justify-center w-1/4 h-16 transition-all duration-200 border-pop-black",
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

