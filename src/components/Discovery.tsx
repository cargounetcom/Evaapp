import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Vibration } from '../types';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Heart, X as Fire, Zap, Star, MapPin, Plus, Camera, Send, Radio } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { useLanguage } from '../lib/LanguageContext';

interface Props {
  user: User;
  profile: UserProfile | null;
}

export function Discovery({ user, profile }: Props) {
  const { t } = useLanguage();
  const [potentials, setPotentials] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestVibrations, setLatestVibrations] = useState<Vibration[]>([]);

  const [matchUser, setMatchUser] = useState<UserProfile | null>(null);
  const [distanceMax, setDistanceMax] = useState(30);
  const [isCreatingFeed, setIsCreatingFeed] = useState(false);
  const [feedText, setFeedText] = useState('');
  const [isComplimenting, setIsComplimenting] = useState<UserProfile | null>(null);
  const [complimentText, setComplimentText] = useState('');
  const [feeds, setFeeds] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  useEffect(() => {
    const q = query(collection(db, 'vibrations'), orderBy('timestamp', 'desc'), limit(3));
    return onSnapshot(q, (snapshot) => {
      setLatestVibrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vibration)));
    });
  }, []);

  const handleCreateFeed = async () => {
    if (!profile || !feedText) return;
    try {
      const feedData = {
        authorId: user.uid,
        authorName: profile.displayName,
        authorPhoto: profile.photoURL,
        message: feedText,
        imageUrls: [`https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600`],
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      await addDoc(collection(db, 'feeds'), feedData);
      setIsCreatingFeed(false);
      setFeedText('');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'feeds'),
      where('expiresAt', '>', new Date()),
      orderBy('expiresAt', 'desc'),
      limit(10)
    );
    return onSnapshot(q, (snapshot) => {
      setFeeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  useEffect(() => {
    async function fetchPotentials() {
      if (!profile) return;
      setIsScanning(true);
      
      const q = query(
        collection(db, 'profiles'),
        where('userId', '!=', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const profiles = snapshot.docs.map(doc => doc.data() as UserProfile);
      
      const filtered = profiles.filter(p => {
        if (p.isIncognito) return false;
        
        // AGE_ENFORCEMENT: 18+ ONLY
        const birthYear = new Date(p.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - birthYear < 18) return false;

        if (profile.lookingFor === 'everyone') return true;
        if (p.distance && p.distance > distanceMax) return false;
        return p.gender === profile.lookingFor;
      });

      if (filtered.length === 0) {
        setPotentials([
          {
            userId: 'mock1',
            displayName: 'VIOLET',
            birthDate: '1995-04-12',
            bio: 'STREET ARTIST. NEON LOVER. SEEKING A PARTNER IN CRIME!',
            gender: 'female',
            lookingFor: 'everyone',
            isPremium: true,
            subscriptionTier: 'pro',
            isIncognito: false,
            distance: 4.2,
            createdAt: '', updatedAt: '', email: '',
            photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60'
          },
          {
            userId: 'mock2',
            displayName: 'AXEL',
            birthDate: '1992-08-22',
            bio: 'VINTAGE VINYL COLLECTOR. ALWAYS HAS THE BEST PLAYLISTS.',
            gender: 'male',
            lookingFor: 'everyone',
            isPremium: false,
            subscriptionTier: 'free',
            isIncognito: false,
            distance: 12.8,
            createdAt: '', updatedAt: '', email: '',
            photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60'
          },
          {
            userId: 'mock3',
            displayName: 'NOVA',
            birthDate: '1998-11-05',
            bio: 'DIGITAL SURREALIST. DREAMS IN RGB. LETS COLLABORATE!',
            gender: 'female',
            lookingFor: 'everyone',
            isPremium: true,
            subscriptionTier: 'elite',
            isIncognito: false,
            distance: 1.5,
            createdAt: '', updatedAt: '', email: '',
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60'
          },
          {
            userId: 'mock4',
            displayName: 'JINX',
            birthDate: '2000-01-15',
            bio: 'CYBERPUNK ENTHUSIAST. HACKING HEARTS. 👾',
            gender: 'female',
            lookingFor: 'everyone',
            isPremium: false,
            subscriptionTier: 'free',
            isIncognito: false,
            distance: 22.1,
            createdAt: '', updatedAt: '', email: '',
            photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60'
          },
          {
            userId: 'mock5',
            displayName: 'KAI',
            birthDate: '1990-06-30',
            bio: 'MINIMALIST ARCHITECT. FORM FOLLOWS EMOTION.',
            gender: 'male',
            lookingFor: 'everyone',
            isPremium: true,
            subscriptionTier: 'pro',
            isIncognito: false,
            distance: 8.9,
            createdAt: '', updatedAt: '', email: '',
            photoURL: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&auto=format&fit=crop&q=60'
          }
        ]);
      } else {
        setPotentials(filtered);
      }
      setLoading(false);
      setTimeout(() => setIsScanning(false), 2000);
    }
    fetchPotentials();
  }, [profile, user.uid, distanceMax]);

  const handleSwipe = async (type: 'like' | 'pass') => {
    const swipedUser = potentials[currentIndex];
    
    try {
      await addDoc(collection(db, 'swipes'), {
        swiperId: user.uid,
        swipedId: swipedUser.userId,
        type,
        createdAt: serverTimestamp()
      });

      if (type === 'like') {
        const mutualQuery = query(
          collection(db, 'swipes'),
          where('swiperId', '==', swipedUser.userId),
          where('swipedId', '==', user.uid),
          where('type', '==', 'like')
        );
        const mutualSnap = await getDocs(mutualQuery);
        if (!mutualSnap.empty || swipedUser.userId.startsWith('mock')) {
             await addDoc(collection(db, 'matches'), {
               users: [user.uid, swipedUser.userId],
               createdAt: serverTimestamp()
             });
             setMatchUser(swipedUser);
        }
      }
    } catch (e) {
      console.error(e);
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center font-pop text-2xl animate-pulse">
      {t('TUNING_FREQUENCIES')}
    </div>
  );
  
  if (currentIndex >= potentials.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
        <div className="w-24 h-24 bg-pop-yellow border-4 border-pop-black flex items-center justify-center rotate-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Zap size={48} />
        </div>
        <div className="space-y-4">
          <h3 className="text-4xl font-pop uppercase">{t('SILENCE')}</h3>
          <p className="font-bold text-pop-black italic bg-white border-2 border-pop-black p-2 -rotate-1">
            {t('EDGE_OF_UNIVERSE')}
          </p>
          <div className="pt-4">
             <label className="font-pop text-xs tracking-widest block mb-2">{t('PULSE_RANGE')}: {distanceMax} KM</label>
             <input 
              type="range" min="1" max="100" value={distanceMax}
              onChange={(e) => setDistanceMax(parseInt(e.target.value))}
              className="w-full h-8 accent-pop-pink"
             />
          </div>
        </div>
      </div>
    );
  }

  const current = potentials[currentIndex];
  const age = differenceInYears(new Date(), new Date(current.birthDate));

  return (
    <div className="flex-1 flex flex-col relative h-[calc(100vh-250px)]">
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[150] bg-pop-black/90 halftone flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-64 h-64 border-8 border-pop-cyan rounded-full relative flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-pop-cyan rounded-full"
              />
              <div className="text-white font-pop text-4xl italic animate-pulse">TUNING...</div>
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                  className="absolute w-full flex justify-center"
                >
                  <div className="w-2 h-10 bg-pop-pink" style={{ transform: `translateY(-120px)` }} />
                </motion.div>
              ))}
            </div>
            <div className="text-center space-y-2">
               <p className="font-mono text-pop-cyan character-flicker uppercase">SCANNING_FREQUENCIES_0.42Hz</p>
               <div className="w-48 h-2 bg-white/20 border border-pop-black overflow-hidden relative">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1/2 h-full bg-pop-yellow absolute inset-y-0"
                  />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Live Preview Feed Overlay */}
      <div className="fixed top-1/2 -translate-y-1/2 left-4 w-48 hidden lg:block space-y-3 z-40">
         <div className="bg-pop-black text-white px-2 py-1 font-pop text-[8px] uppercase italic flex items-center gap-1 border-2 border-pop-black">
            <Radio size={10} className="animate-pulse text-pop-cyan" />
            LIVE_FEED
         </div>
         {latestVibrations.map(v => (
           <motion.div 
             key={v.id} 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="bg-white border-2 border-pop-black p-2 shadow-[2px_2px_0px_0px_black] relative"
             style={{ borderColor: v.color }}
           >
              <p className="font-mono text-[8px] break-words line-clamp-2 uppercase">{v.text}</p>
              <div className="text-[6px] font-pop uppercase mt-1" style={{ color: v.color }}>{v.userName}</div>
           </motion.div>
         ))}
      </div>

      {/* Feeds Bar */}
      <div className="flex gap-4 overflow-x-auto py-2 mb-4 no-scrollbar">
         <motion.button 
          onClick={() => setIsCreatingFeed(true)}
          whileTap={{ scale: 0.9 }}
          className="min-w-[70px] h-[70px] bg-pop-pink border-4 border-pop-black flex items-center justify-center shadow-[4px_4px_0px_0px_black] text-white shrink-0"
         >
           <Plus size={32} />
         </motion.button>
         {feeds.map((f) => (
           <div key={f.id} className="min-w-[70px] h-[70px] border-4 border-pop-black shadow-[4px_4px_0px_0px_#A29BFE] shrink-0 overflow-hidden bg-white rotate-3">
              <img src={f.authorPhoto} className="w-full h-full object-cover" />
           </div>
         ))}
      </div>

      <div className="flex justify-between items-center px-2 mb-4">
         <div className="flex items-center gap-2">
            <div className="bg-pop-black text-white px-3 py-1 font-pop text-xs rotate-1">RANGE: {distanceMax}KM</div>
            <div className="flex gap-0.5">
               {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    className="w-1 h-4 bg-pop-cyan shadow-[1px_1px_0px_0px_black]" 
                  />
               ))}
            </div>
         </div>
         <div className="flex items-center gap-2">
            <div className="hidden sm:block font-mono text-[8px] text-pop-black/60 font-black animate-pulse">SONIC_SIGNAL: STABLE</div>
            <button 
              onClick={() => {
                setIsScanning(true);
                setTimeout(() => setIsScanning(false), 1500);
              }}
              className="bg-white border-2 border-pop-black p-1 hover:bg-pop-yellow transition-colors group"
            >
               <MapPin size={16} className="group-hover:rotate-12" />
            </button>
         </div>
      </div>

      <AnimatePresence>
        <SwipeCard 
          key={current.userId}
          user={current} 
          age={age}
          onSwipe={handleSwipe}
          onCompliment={() => setIsComplimenting(current)}
        />
      </AnimatePresence>

      {/* Compliment Modal */}
      <AnimatePresence>
        {isComplimenting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-pop-cyan/95 flex items-center justify-center p-6 halftone"
          >
            <div className="pop-card bg-pop-yellow p-8 w-full max-w-sm space-y-6 shadow-[10px_10px_0px_0px_black]">
               <h2 className="text-4xl font-pop text-pop-black">SONIC BLAST!</h2>
               <p className="font-bold text-xs uppercase italic bg-white border-2 border-pop-black p-2">
                 SEND A COMPLIMENT TO {isComplimenting.displayName} FOR 0.50 EUR
               </p>
               <textarea 
                value={complimentText}
                onChange={(e) => setComplimentText(e.target.value)}
                placeholder="TYPE YOUR VIBRATION..."
                className="w-full h-32 bg-white border-4 border-pop-black p-4 font-bold outline-none resize-none"
               />
               <div className="flex gap-2">
                 <button 
                  onClick={() => setIsComplimenting(null)}
                  className="flex-1 bg-pop-black text-white p-4 font-pop hover:bg-pop-pink transition-colors"
                 >
                   ABORT
                 </button>
                 <button 
                  onClick={() => {
                    // Logic to send compliment
                    setIsComplimenting(null);
                    setComplimentText('');
                  }}
                  className="flex-1 bg-pop-pink text-white p-4 font-pop shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                 >
                   LAUNCH!
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed Creation Modal */}
      <AnimatePresence>
        {isCreatingFeed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-pop-black/90 p-8 flex flex-col items-center justify-center halftone"
          >
             <div className="pop-card bg-pop-yellow p-6 w-full max-w-md space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="font-pop text-2xl uppercase">CREATE SONIC FEED</h3>
                   <button onClick={() => setIsCreatingFeed(false)} className="text-pop-black"><Fire size={24} /></button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 h-32">
                   {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-pop-black border-2 border-pop-black overflow-hidden relative flex items-center justify-center">
                         <img src={`https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&sig=${i}`} className="w-full h-full object-cover opacity-40" />
                         <Camera size={20} className="text-white absolute" />
                      </div>
                   ))}
                </div>

                <input 
                  value={feedText}
                  onChange={(e) => setFeedText(e.target.value)}
                  placeholder="ADD A SONIC CAPTION..."
                  className="w-full bg-white border-4 border-pop-black p-4 font-bold outline-none"
                />
                
                <div className="bg-pop-cyan/20 border-2 border-pop-black border-dashed p-4 text-center">
                   <p className="font-pop text-xs text-pop-black">PULSE LIFE: 24 HOURS</p>
                </div>

                <button 
                  onClick={handleCreateFeed}
                  className="pop-button-pink w-full flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  BROADCAST (4.00 EUR)
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {matchUser && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-pop-cyan/95 flex flex-col items-center justify-center p-8 halftone"
           >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-pop-pink border-8 border-pop-black p-10 shadow-[15px_15px_0px_0px_black] rotate-[-5deg] relative"
              >
                  <h2 className="text-7xl font-pop text-white drop-shadow-[4px_4px_0px_black] mb-4">{t('MATCH')}</h2>
                  <div className="flex gap-4">
                     <div className="w-32 h-32 border-4 border-pop-black shadow-[4px_4px_0px_0px_black] bg-white overflow-hidden -rotate-6">
                        <img src={profile?.photoURL} className="w-full h-full object-cover grayscale" />
                     </div>
                     <div className="w-32 h-32 border-4 border-pop-black shadow-[4px_4px_0px_0px_black] bg-white overflow-hidden rotate-6">
                        <img src={matchUser.photoURL} className="w-full h-full object-cover" />
                     </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full text-center">
                     <button 
                      onClick={() => setMatchUser(null)}
                      className="bg-pop-yellow border-4 border-pop-black px-8 py-3 font-pop text-2xl shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                     >
                      {t('AMPLIFY_CHAT')}
                     </button>
                  </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwipeCard({ user, age, onSwipe, onCompliment }: { user: UserProfile, age: number, onSwipe: (type: 'like' | 'pass') => void, onCompliment: () => void }) {
  const { t } = useLanguage();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const passOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) {
      onSwipe('like');
    } else if (info.offset.x < -100) {
      onSwipe('pass');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ x: x.get() > 0 ? 600 : -600, opacity: 0, rotate: x.get() > 0 ? 45 : -45 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full bg-white border-8 border-pop-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <img 
          src={user.photoURL} 
          alt={user.displayName}
          className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
        />
        
        <motion.div style={{ opacity: likeOpacity }} className="absolute inset-0 bg-pop-pink/40 flex items-center justify-center z-20">
           <div className="bg-pop-yellow border-4 border-pop-black px-8 py-4 font-pop text-6xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-15deg]">
             {t('BOOM')}
           </div>
        </motion.div>
        <motion.div style={{ opacity: passOpacity }} className="absolute inset-0 bg-pop-black/40 flex items-center justify-center z-20">
           <div className="bg-white border-4 border-pop-black px-8 py-4 font-pop text-6xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[15deg]">
             {t('NEXT')}
           </div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 p-6 bg-pop-pink border-t-8 border-pop-black space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-4xl font-pop text-white drop-shadow-[2px_2px_0px_black]">{user.displayName}, {age}</h3>
              {user.isPremium && <div className="p-1 bg-pop-yellow border-2 border-pop-black"><Star size={16} fill="currentColor" /></div>}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCompliment();
                }}
                className="bg-pop-yellow border-2 border-pop-black p-2 shadow-[2px_2px_0px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                title="Send Sonic Compliment"
              >
                <Zap size={20} className="text-pop-black" fill="currentColor" />
              </button>
              {Math.random() > 0.5 && (
                 <div className="bg-pop-cyan border-2 border-pop-black px-2 py-0.5 flex items-center gap-1.5 -rotate-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-pop text-[10px] text-white underline">{t('LIVE')}</span>
                 </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-white font-bold italic text-xs mb-1">
             <MapPin size={12} />
             {user.distance ? `${user.distance.toFixed(1)} km away` : 'Near you'}
          </div>
          <div className="bg-white border-2 border-pop-black p-3 translate-y-1 relative overflow-hidden">
            {user.lastVibration && (
              <div 
                className="absolute top-0 right-0 h-full w-1 opacity-60" 
                style={{ backgroundColor: user.lastVibration.color }} 
              />
            )}
            <p className="text-sm font-bold leading-tight uppercase italic line-clamp-2">
              "{user.bio}"
            </p>
            {user.lastVibration && (
              <div className="mt-2 flex items-center gap-2 border-t border-pop-black/10 pt-2">
                <Radio size={10} style={{ color: user.lastVibration.color }} className="animate-pulse" />
                <span className="text-[8px] font-mono font-black truncate opacity-60" style={{ color: user.lastVibration.color }}>
                  LAST_VIBE: {user.lastVibration.text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-24 inset-x-0 flex justify-center gap-8">
        <button 
          onClick={() => onSwipe('pass')}
          className="pop-button-cyan w-20 h-20 rounded-none flex items-center justify-center"
        >
          <Fire size={32} />
        </button>
        <button 
          onClick={() => onSwipe('like')}
          className="pop-button-pink w-24 h-24 rounded-none flex items-center justify-center"
        >
          <Heart size={40} fill="currentColor" />
        </button>
      </div>
    </motion.div>
  );
}

