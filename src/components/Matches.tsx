import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Match, Message, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, MoreVertical, Heart, Star, Zap, Phone, Video, XCircle, Gift } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  user: User;
}

export function Matches({ user }: Props) {
  const [matches, setMatches] = useState<(Match & { otherUser?: UserProfile })[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const matchData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      
      const enrichedMatches = await Promise.all(matchData.map(async (m) => {
        const otherUserId = m.users.find(uid => uid !== user.uid);
        if (!otherUserId) return m;

        let otherUser: UserProfile | undefined;
        try {
          if (otherUserId.startsWith('mock')) {
             otherUser = {
               userId: otherUserId,
               displayName: otherUserId === 'mock1' ? 'VIOLET' : otherUserId === 'mock2' ? 'AXEL' : 
                            otherUserId === 'mock3' ? 'NOVA' : otherUserId === 'mock4' ? 'JINX' : 'KAI',
               photoURL: otherUserId === 'mock1' ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800' : 
                         otherUserId === 'mock2' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800' : 
                         otherUserId === 'mock3' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' :
                         otherUserId === 'mock4' ? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800' :
                         'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800',
               birthDate: '1995-01-01', gender: 'female', lookingFor: 'everyone', isPremium: false, 
               subscriptionTier: 'free', isIncognito: false, createdAt: '', updatedAt: '', email: ''
             };
          } else {
            const up = await getDoc(doc(db, 'profiles', otherUserId));
            if (up.exists()) otherUser = up.data() as UserProfile;
          }
        } catch (e) {
          console.error(e);
        }
        
        return { ...m, otherUser };
      }));

      setMatches(enrichedMatches as any);
      setLoading(false);
    });
  }, [user.uid]);

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  if (selectedMatchId && selectedMatch) {
    return (
      <ChatView 
        user={user} 
        matchId={selectedMatchId} 
        otherUser={selectedMatch.otherUser} 
        onBack={() => setSelectedMatchId(null)} 
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 space-y-8"
    >
      <div className="bg-pop-cyan border-4 border-pop-black p-4 rotate-1 shadow-[8px_8px_0px_0px_white]">
        <h2 className="text-4xl font-pop tracking-widest text-white drop-shadow-[2px_2px_0px_black]">THE CROWD</h2>
        <p className="text-pop-black font-bold italic text-sm">YOUR TRIBE. YOUR VIBE.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center font-pop animate-bounce">SYNCING PULSE...</div>
        ) : matches.length === 0 ? (
          <div className="pop-card bg-white p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-pop-pink border-4 border-pop-black flex items-center justify-center text-white mx-auto -rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Zap size={40} />
            </div>
            <p className="font-pop text-xl leading-relaxed uppercase">
              RADIO SILENCE. GET OUT THERE AND MAKE SOME NOISE!
            </p>
          </div>
        ) : (
          matches.map((match, i) => (
            <motion.button
              key={match.id}
              onClick={() => setSelectedMatchId(match.id)}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "w-full pop-card p-4 flex items-center gap-4 text-left",
                i % 2 === 0 ? "bg-pop-yellow rotate-1" : "bg-white -rotate-1"
              )}
            >
              <div className="w-20 h-20 border-4 border-pop-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 grayscale hover:grayscale-0 transition-all">
                <img 
                  src={match.otherUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`} 
                  alt={match.otherUser?.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-pop text-2xl tracking-tighter truncate">{match.otherUser?.displayName || 'STRANGER'}</h4>
                  <span className="text-[10px] bg-pop-black text-white px-2 py-0.5 font-bold uppercase rotate-2">
                    {match.createdAt ? formatDistanceToNow(new Date((match.createdAt as any).toDate()), { addSuffix: false }) : 'NOW'}
                  </span>
                </div>
                <div className="bg-pop-black/5 p-2 border-l-4 border-pop-black">
                  <p className="text-xs font-bold truncate italic">
                    CLICK TO AMPLIFY THE CONNECTION!
                  </p>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}

function ChatView({ user, matchId, otherUser, onBack }: { user: User, matchId: string, otherUser?: UserProfile, onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [calling, setCalling] = useState<'audio' | 'video' | null>(null);
  const [giftSent, setGiftSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (giftSent) {
      const timer = setTimeout(() => setGiftSent(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [giftSent]);

  useEffect(() => {
    const q = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }, [matchId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await addDoc(collection(db, 'matches', matchId, 'messages'), {
        matchId,
        senderId: user.uid,
        text: inputText,
        createdAt: serverTimestamp()
      });
      if (inputText.includes('🎁')) setGiftSent(true);
      setInputText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-pop-cyan z-50 flex flex-col pt-4 px-4 pb-4 halftone"
    >
      <AnimatePresence>
        {giftSent && (
           <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
           >
              <div className="bg-pop-yellow border-8 border-pop-black p-8 rotate-12 shadow-[12px_12px_0px_0px_#FF00FF]">
                 <Gift size={100} className="text-pop-black" />
                 <h2 className="text-4xl font-pop text-pop-pink drop-shadow-[2px_2px_0px_black] text-center mt-4">GIFT SENT!</h2>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between px-4 py-4 pop-card bg-pop-yellow mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-pop-black text-white p-2 border-2 border-pop-black">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 border-4 border-pop-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
                <img src={otherUser?.photoURL} className="w-full h-full object-cover" />
             </div>
             <div className="hidden sm:block">
                <h3 className="font-pop text-2xl tracking-tighter drop-shadow-[1px_1px_0px_white]">{otherUser?.displayName}</h3>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCalling('audio')}
            className="pop-button-cyan p-2.5 rounded-none border-2"
          >
            <Phone size={20} />
          </button>
          <button 
            onClick={() => setCalling('video')}
            className="pop-button-pink p-2.5 rounded-none border-2"
          >
            <Video size={20} />
          </button>
          <button className="text-pop-black p-2">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 px-2 py-4 no-scrollbar">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user.uid;
          return (
            <motion.div 
              key={msg.id} 
              initial={{ scale: 0, opacity: 0, x: isMe ? 50 : -50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              className={cn("flex", isMe ? "justify-end" : "justify-start")}
            >
              <div className={cn(
                "max-w-[85%] px-6 py-4 border-4 border-pop-black font-bold text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative",
                isMe ? "bg-pop-pink text-white -rotate-1" : "bg-white text-pop-black rotate-1"
              )}>
                {msg.text}
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 mt-4 bg-white border-4 border-pop-black flex gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button 
          type="button"
          onClick={() => setInputText(prev => prev + " 🎁 ")}
          className="pop-button-yellow w-16 h-16 flex items-center justify-center p-0"
        >
          <Gift size={24} />
        </button>
        <input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="SEND A SONIC BLAST..."
          className="flex-1 bg-transparent px-4 py-4 outline-none font-bold placeholder:opacity-50"
        />
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="pop-button-pink w-16 h-16 flex items-center justify-center p-0"
        >
          <Send size={24} fill="currentColor" />
        </button>
      </form>

      {/* Calling Simulation Modal */}
      <AnimatePresence>
        {calling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pop-black/90 z-[60] flex flex-col items-center justify-center p-8 text-white space-y-12"
          >
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-48 h-48 border-8 border-pop-pink shadow-[12px_12px_0px_0px_#FF00FF] overflow-hidden"
              >
                <img src={otherUser?.photoURL} className={cn("w-full h-full object-cover", calling === 'audio' && "grayscale")} />
              </motion.div>
              <div className="absolute -top-6 -right-6 bg-pop-yellow text-pop-black border-4 border-pop-black px-4 py-1 font-pop text-xl rotate-12">
                {calling === 'audio' ? 'CALLING...' : 'VIDEO ON'}
              </div>
            </div>

            <div className="text-center space-y-4">
               <h2 className="text-5xl font-pop tracking-tighter">{otherUser?.displayName}</h2>
               <p className="font-bold text-pop-cyan animate-pulse">CONNECTING THROUGH PURE POP WAVES...</p>
            </div>

            <div className="flex gap-8">
               <button 
                 onClick={() => setCalling(null)}
                 className="w-20 h-20 bg-pop-pink border-4 border-pop-black flex items-center justify-center shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
               >
                 <XCircle size={40} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
