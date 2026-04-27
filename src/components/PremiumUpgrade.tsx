import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Zap, Heart, MessageCircle, Star, Crown } from 'lucide-react';
import { cn } from '../lib/utils';
import { StripePaymentOverlay } from './StripePayment';

interface Props {
  user: User;
  profile: UserProfile | null;
}

export function PremiumUpgrade({ user, profile }: Props) {
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<{ amount: number; tier: string; feeds: number } | null>(null);

  const handlePaymentSuccess = async (tier: string, feeds: number = 0) => {
    if (!profile) return;
    
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        isPremium: true,
        subscriptionTier: tier,
        feedsBalance: (profile.feedsBalance || 0) + feeds,
        updatedAt: serverTimestamp()
      });
      setSuccess(tier);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12 pb-20 px-2"
    >
      <div className="text-center space-y-4">
        <div className="inline-block bg-pop-pink border-4 border-pop-black text-white px-6 py-2 rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-4xl font-pop tracking-widest">POWER UP!</h2>
        </div>
        <p className="font-pop text-2xl text-pop-black px-4 leading-tight">
          CHOOSE YOUR <span className="text-white drop-shadow-[2px_2px_0px_black]">SONIC LEVEL</span>
        </p>
      </div>

      <div className="space-y-8">
        {/* Tier: Viking World (New) */}
        <div className="pop-card bg-[#2D3436] text-white p-8 relative overflow-hidden space-y-6 border-l-[12px] border-[#EB4D4B]">
           {(profile?.subscriptionTier === 'viking' || success === 'viking') && (
             <div className="absolute top-0 right-0 bg-[#EB4D4B] text-white px-4 py-1 font-pop rotate-12 -translate-y-1 translate-x-2 border-2 border-pop-black shadow-[4px_4px_0px_0px_black]">ACTIVE</div>
           )}
           <div className="flex justify-between items-start">
             <div className="space-y-2">
               <h3 className="font-pop text-4xl text-[#F9CA24] drop-shadow-[2px_2px_0px_black]">VIKING WORLD</h3>
               <p className="font-bold text-xs uppercase italic text-white bg-pop-black px-2 py-0.5 inline-block border border-white mt-1">WEEKLY POWER</p>
             </div>
             <div className="p-3 bg-[#F9CA24] border-4 border-pop-black shadow-[4px_4px_0px_0px_black] -rotate-6">
                <Crown size={32} className="text-pop-black" fill="currentColor" />
             </div>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              <PricingOption title="WEEKLY" price="€11.99" per="WEEK" bonus="+1 FEED FREE" onPay={() => handlePaymentSuccess('viking', 1)} />
              <PricingOption title="MONTHLY" price="€24.99" per="MONTH" bonus="+5 FEEDS FREE" onPay={() => handlePaymentSuccess('viking', 5)} />
              <PricingOption title="ANNUAL" price="€59.99" per="YEAR" bonus="+10 FEEDS FREE" onPay={() => handlePaymentSuccess('viking', 10)} />
           </div>
        </div>

        {/* Add-ons Section */}
        <div className="space-y-4">
           <h3 className="font-pop text-2xl text-pop-black text-center mb-6 underline decoration-pop-pink decoration-4 underline-offset-8">BOOSTS & ADD-ONS</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AddonCard icon={<Star className="text-pop-pink" fill="currentColor" />} title="MASHABLE" price="€8.00" desc="GLOBAL PROFILE BLAST" />
              <AddonCard icon={<Zap className="text-pop-yellow" fill="currentColor" />} title="EXTRA FEEDS (10)" price="€10.00" desc="10 PREMIUM SLOTS" />
              <AddonCard icon={<Heart className="text-pop-cyan" fill="currentColor" />} title="APPOINTMENT" price="€3.99" desc="GUARANTEED DATE SLOT" />
              <AddonCard icon={<Crown className="text-pop-yellow" fill="currentColor" />} title="V.I.P. BADGE" price="€15.00" desc="LIFETIME STATUS" />
              <AddonCard icon={<Star className="text-pop-cyan" />} title="STANDARD FEEDS" price="€4.00" desc="BASIC BROADCAST" />
              <AddonCard icon={<Zap className="text-white" />} title="VIDEO UPLOAD" price="€0.50" desc="SONIC VIDEO PROFILE" dark />
           </div>
        </div>

        {/* Tier: Pro */}
        <div className="pop-card bg-pop-yellow p-8 relative overflow-hidden space-y-6 scale-105 border-l-[12px]">
           {(profile?.subscriptionTier === 'pro' || success === 'pro') && (
             <div className="absolute top-0 right-0 bg-pop-pink text-white px-4 py-1 font-pop rotate-12 -translate-y-1 translate-x-2 border-2 border-pop-black">YOUR LEVEL</div>
           )}
           <div className="flex justify-between items-start">
             <div className="space-y-2">
               <h3 className="font-pop text-4xl text-pop-black">PRO</h3>
               <p className="font-bold text-xs uppercase italic">€9.99 / MONTH</p>
             </div>
             <Zap size={40} className="text-pop-pink drop-shadow-[2px_2px_0px_black]" />
           </div>
           <ul className="space-y-2">
             <FeaturePoint text="UNLIMITED SWIPES" />
             <FeaturePoint text="PRIORITY IN THE FEED" />
             <FeaturePoint text="SEE WHO LIKES YOU" />
           </ul>
           {profile?.subscriptionTier !== 'pro' && profile?.subscriptionTier !== 'elite' && !success && (
             <div className="pt-4">
                <button
                  onClick={() => setPaymentRequest({ amount: 9.99, tier: 'pro', feeds: 0 })}
                  className="w-full bg-pop-black text-white p-4 font-pop text-xl italic hover:bg-pop-pink transition-all shadow-[4px_4px_0px_0px_white] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  UPGRADE_TO_PRO
                </button>
             </div>
           )}
        </div>

        {/* Tier: Elite (Incognito) */}
        <div className="pop-card bg-pop-cyan p-8 relative overflow-hidden space-y-6 border-l-[12px] border-pop-black">
           {(profile?.subscriptionTier === 'elite' || success === 'elite') && (
             <div className="absolute top-0 right-0 bg-pop-pink text-white px-4 py-1 font-pop rotate-12 -translate-y-1 translate-x-2 border-2 border-pop-black shadow-[4px_4px_0px_0px_black]">ELITE STATUS</div>
           )}
           <div className="flex justify-between items-start">
             <div className="space-y-2">
               <h3 className="font-pop text-4xl text-pop-black drop-shadow-[2px_2px_0px_white]">ELITE</h3>
               <p className="font-bold text-xs uppercase italic text-pop-black bg-white px-2 py-0.5 inline-block border border-pop-black mt-1">€50 / MONTH</p>
             </div>
             <div className="p-3 bg-pop-yellow border-4 border-pop-black shadow-[4px_4px_0px_0px_black] rotate-6">
                <Crown size={32} className="text-pop-black" fill="currentColor" />
             </div>
           </div>
           <ul className="space-y-3">
             <FeaturePoint text="INCOGNITO MODE (STAY HIDDEN)" />
             <FeaturePoint text="ANIME AVATAR GENERATION" />
             <FeaturePoint text="EXCLUSIVE GIFTING SYSTEM" />
             <FeaturePoint text="DIRECT REWIND ON SWIPES" />
             <FeaturePoint text="ALL PRO FEATURES INCLUDED" />
           </ul>
           {profile?.subscriptionTier !== 'elite' && !success && (
             <div className="pt-4">
                <button
                  onClick={() => setPaymentRequest({ amount: 50.00, tier: 'elite', feeds: 0 })}
                  className="w-full bg-pop-black text-white p-4 font-pop text-xl italic shadow-[4px_4px_0px_0px_#00FFFF] hover:bg-pop-pink transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  SECURE_ELITE_ACCESS
                </button>
             </div>
           )}
        </div>
      </div>
      {paymentRequest && (
        <StripePaymentOverlay 
          amount={paymentRequest.amount}
          tier={paymentRequest.tier}
          userId={user.uid}
          onClose={() => setPaymentRequest(null)}
          onSuccess={() => {
            handlePaymentSuccess(paymentRequest.tier, paymentRequest.feeds);
            setPaymentRequest(null);
          }}
        />
      )}
    </motion.div>
  );
}

function PricingOption({ title, price, per, bonus, onPay }: { title: string, price: string, per: string, bonus?: string, onPay: () => void }) {
  return (
    <div className="bg-white border-4 border-pop-black p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_black]">
       <div className="text-center sm:text-left">
          <h4 className="font-pop text-xl text-pop-black leading-none">{title}</h4>
          <p className="text-[10px] font-bold text-gray-500 uppercase">{price} / {per}</p>
          {bonus && <p className="text-[10px] font-black text-pop-pink animate-pulse mt-1">{bonus}</p>}
       </div>
       <div className="w-full sm:w-auto">
          <button
            onClick={onPay}
            className="w-full bg-pop-black text-white px-6 py-2 font-pop italic border-2 border-pop-black hover:bg-pop-cyan hover:text-pop-black transition-all"
          >
            SELECT
          </button>
       </div>
    </div>
  );
}

function AddonCard({ icon, title, price, desc, dark = false }: { icon: React.ReactNode, title: string, price: string, desc: string, dark?: boolean }) {
  return (
    <div className={cn(
      "pop-card p-4 space-y-2 transition-transform hover:-translate-y-1 active:translate-y-0",
      dark ? "bg-pop-black text-white" : "bg-white text-pop-black"
    )}>
       <div className="flex items-center justify-between">
          <div className="p-2 border-2 border-pop-black bg-white shadow-[2px_2px_0px_0px_black]">
            {icon}
          </div>
          <span className="font-pop text-lg">{price}</span>
       </div>
       <div>
          <h4 className="font-pop text-sm leading-tight">{title}</h4>
          <p className={cn("text-[9px] font-bold uppercase", dark ? "text-gray-400" : "text-gray-500")}>{desc}</p>
       </div>
    </div>
  );
}

function FeaturePoint({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <div className="min-w-[6px] h-[6px] bg-white border border-pop-black"></div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{text}</span>
    </li>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-6 items-center">
      <div className="w-16 h-16 border-4 border-pop-black bg-pop-yellow flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="font-pop text-xl tracking-tight leading-none">{title}</h4>
        <p className="text-xs font-bold uppercase italic text-gray-500 leading-tight">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="pop-card bg-white p-4 flex flex-col items-center gap-2 border-pop-black -rotate-2">
      <div className="text-pop-pink drop-shadow-[2px_2px_0px_black]">{icon}</div>
      <span className="font-pop text-xs tracking-widest text-pop-black">{label}</span>
    </div>
  );
}
