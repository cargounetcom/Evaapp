import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Vibration } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Send, Zap, Activity } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface Props {
  user: User;
  profile: UserProfile;
}

const VIBE_COLORS = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00'];

export default function FrequencyFeed({ user, profile }: Props) {
  const [vibrations, setVibrations] = useState<Vibration[]>([]);
  const [newVibe, setNewVibe] = useState('');
  const [mediaURL, setMediaURL] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [selectedColor, setSelectedColor] = useState(VIBE_COLORS[0]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const q = query(
      collection(db, 'vibrations'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Vibration));
      setVibrations(docs);
    });
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVibe.trim() || isBroadcasting) return;

    setIsBroadcasting(true);
    try {
      const vibeData = {
        userId: user.uid,
        userName: profile.displayName,
        photoURL: profile.photoURL,
        text: newVibe,
        mediaURL: mediaURL.trim() ? mediaURL : undefined,
        mediaType: mediaURL.trim() ? mediaType : undefined,
        color: selectedColor,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'vibrations'), vibeData);
      await updateDoc(doc(db, 'profiles', user.uid), {
        lastVibration: {
          text: newVibe,
          color: selectedColor,
          timestamp: new Date().toISOString()
        }
      });

      setNewVibe('');
      setMediaURL('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-6 max-w-lg mx-auto"
    >
      {/* Broadcast Input */}
      <div className="bg-pop-black border-4 border-pop-black p-4 shadow-[8px_8px_0px_0px_black] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pop-cyan/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
        
        <form onSubmit={handleBroadcast} className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Radio size={16} className="text-pop-cyan animate-pulse" />
            <h3 className="font-pop text-white text-xs uppercase italic font-black">BROADCAST_SIGNAL</h3>
          </div>
          
          <div className="relative">
            <textarea
              value={newVibe}
              onChange={(e) => setNewVibe(e.target.value)}
              placeholder="EMIT_YOUR_FREQUENCY..."
              maxLength={120}
              className="w-full bg-white/5 border-2 border-pop-cyan/30 p-3 font-mono text-xs text-pop-cyan outline-none focus:border-pop-cyan h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[8px] font-mono text-pop-cyan/50 block">MEDIA_UPLINK_URL:</label>
               <input 
                 type="url" 
                 value={mediaURL} 
                 onChange={(e) => setMediaURL(e.target.value)}
                 placeholder="HTTPS://..."
                 className="w-full bg-white/5 border border-pop-cyan/20 p-2 font-mono text-[9px] text-pop-cyan outline-none"
               />
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-mono text-pop-cyan/50 block">UPLINK_TYPE:</label>
               <select 
                 value={mediaType} 
                 onChange={(e) => setMediaType(e.target.value as any)}
                 className="w-full bg-pop-black border border-pop-cyan/20 p-1.5 font-mono text-[9px] text-pop-cyan outline-none"
               >
                 <option value="image">IMAGE_STREAM</option>
                 <option value="video">VIDEO_STREAM</option>
               </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {VIBE_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 border-2 transition-all ${selectedColor === color ? 'border-white scale-110 shadow-[2px_2px_0px_0px_black]' : 'border-pop-black opacity-50'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <button 
              type="submit"
              disabled={!newVibe.trim() || isBroadcasting}
              className="bg-pop-pink text-white px-6 py-2 font-pop text-[10px] uppercase font-black border-2 border-pop-black shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2"
            >
              {isBroadcasting ? <Activity size={14} className="animate-spin" /> : <Send size={14} />}
              TRANSMIT
            </button>
          </div>
        </form>
      </div>

      {/* Vibration Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-pop-yellow" />
            <span className="font-pop text-pop-black text-[10px] uppercase font-black">LIVE_RESONANCE</span>
          </div>
          <div className="h-0.5 flex-1 bg-pop-black/10 mx-4" />
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {vibrations.map((vibe, index) => (
              <motion.div
                key={vibe.id}
                layout
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                className="bg-white border-2 border-pop-black p-3 relative group shadow-[4px_4px_0px_0px_black]"
                style={{ borderColor: vibe.color }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 border-2 border-pop-black flex-shrink-0 overflow-hidden bg-pop-black">
                    <img 
                      src={vibe.photoURL} 
                      alt="" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-pop text-[10px] uppercase font-black tracking-tighter" style={{ color: vibe.color }}>
                        {vibe.userName}
                      </span>
                      <span className="text-[7px] font-mono text-pop-black/40">
                        {new Date(vibe.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-pop-black break-words leading-tight">
                      {vibe.text}
                    </p>
                    {vibe.mediaURL && (
                      <div className="mt-2 border-2 border-pop-black overflow-hidden bg-black">
                        {vibe.mediaType === 'video' ? (
                          <video src={vibe.mediaURL} controls className="w-full aspect-video object-cover" />
                        ) : (
                          <img src={vibe.mediaURL} alt="" className="w-full object-cover max-h-48" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Visual Glitch Decoration */}
                <div 
                  className="absolute bottom-0 right-0 h-1" 
                  style={{ backgroundColor: vibe.color, width: `${Math.random() * 50 + 20}%` }} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
