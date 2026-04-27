import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { BarChart3, Users, ShieldAlert, TrendingUp, Filter, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import { seedDemoProfiles } from '../lib/seedService';

interface Props {
  user: User;
}

export function AdminPanel({ user }: Props) {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    eliteUsers: 0,
    totalMatches: 0
  });
  const [recentProfiles, setRecentProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchAdminData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'profiles'));
      const matchesSnap = await getDocs(collection(db, 'matches'));
      
      const profiles = usersSnap.docs.map(doc => doc.data() as UserProfile);
      
      setStats({
        totalUsers: profiles.length,
        premiumUsers: profiles.filter(p => p.subscriptionTier === 'pro').length,
        eliteUsers: profiles.filter(p => p.subscriptionTier === 'elite').length,
        totalMatches: matchesSnap.size
      });

      setRecentProfiles(profiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10));
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDemoProfiles();
      await fetchAdminData();
      alert('SIGNAL_PROFILES_DEPLOYED_SUCCESSFULLY');
    } catch (e) {
      console.error(e);
      alert('SYSTEM_ERROR_FAILED_TO_SEED');
    } finally {
      setIsSeeding(false);
    }
  };

  const handlePurge = async () => {
    if (!confirm('WARNING: THIS WILL DELETE ALL DEMO PROFILES. PROCEED?')) return;
    setIsSeeding(true);
    try {
      const usersSnap = await getDocs(collection(db, 'profiles'));
      const demoProfiles = usersSnap.docs.filter(doc => doc.id.startsWith('demo_'));
      
      const { deleteDoc, doc } = await import('firebase/firestore');
      for (const d of demoProfiles) {
        await deleteDoc(doc(db, 'profiles', d.id));
      }
      
      await fetchAdminData();
      alert('DEMO_DATA_PURGED');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) return <div className="p-8 font-pop animate-pulse text-pop-pink">{t('DECRYPTING_DATA')}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <div className="bg-pop-black border-4 border-pop-black p-4 rotate-1 shadow-[8px_8px_0px_0px_#FF00FF]">
        <h2 className="text-4xl font-pop tracking-widest text-white">{t('COMMAND_CENTER')}</h2>
        <p className="text-pop-cyan font-bold italic text-sm">{t('RESTRICTED_ACCESS')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Users size={24} />} 
          label="SOULS" 
          val={stats.totalUsers.toString()} 
          color="bg-pop-yellow" 
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="SIGNALS" 
          val={stats.totalMatches.toString()} 
          color="bg-pop-cyan" 
        />
        <StatCard 
          icon={<CheckCircle size={24} />} 
          label="PRO" 
          val={stats.premiumUsers.toString()} 
          color="bg-pop-pink" 
        />
        <StatCard 
          icon={<ShieldAlert size={24} />} 
          label="ELITE" 
          val={stats.eliteUsers.toString()} 
          color="bg-white" 
        />
      </div>

      {/* Moderation Queue */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <Filter size={20} className="text-pop-pink" />
            <h3 className="font-pop text-2xl tracking-tighter">MODERATION QUEUE</h3>
        </div>
        <div className="space-y-3">
          {recentProfiles.map((p, i) => (
            <div key={p.userId} className={cn(
              "pop-card p-4 flex items-center justify-between",
              i % 2 === 0 ? "bg-white rotate-1" : "bg-pop-yellow -rotate-1"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border-4 border-pop-black">
                  <img src={p.photoURL} className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <h4 className="font-pop text-xl leading-none">{p.displayName}</h4>
                  <p className="text-[10px] font-bold uppercase text-gray-500">{p.subscriptionTier} tier</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="bg-pop-cyan border-2 border-pop-black p-2 hover:bg-black hover:text-white transition-colors">
                  <BarChart3 size={16} />
                </button>
                <button className="bg-pop-pink border-2 border-pop-black p-2 hover:bg-black hover:text-white transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Chart Simulation */}
      <div className="pop-card bg-pop-pink p-6 text-white space-y-4 shadow-[10px_10px_0px_0px_black]">
         <h3 className="font-pop text-2xl drop-shadow-[2px_2px_0px_black]">GROWTH PULSE</h3>
         <div className="h-32 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="flex-1 bg-white border-2 border-pop-black shadow-[2px_2px_0px_0px_black]"
              />
            ))}
         </div>
         <p className="text-center font-bold text-[10px] uppercase tracking-[0.3em]">DAILY ACTIVE VIBRATIONS</p>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
         <button className="bg-pop-pink text-white p-4 border-4 border-pop-black font-pop text-sm uppercase italic shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 transition-all">
            DEPLOY_SYSTEM_MAIL
         </button>
         <button 
           onClick={handleSeed}
           disabled={isSeeding}
           className={cn(
             "bg-pop-yellow text-pop-black p-4 border-4 border-pop-black font-pop text-sm uppercase italic shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 transition-all",
             isSeeding && "animate-pulse opacity-50 cursor-not-allowed"
           )}
         >
            {isSeeding ? 'SEEDING...' : 'SEED_DEMO_PROFILES'}
         </button>
         <button 
           onClick={handlePurge}
           disabled={isSeeding}
           className="bg-white text-pop-black p-4 border-4 border-pop-black font-pop text-sm uppercase italic shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 transition-all"
         >
            PURGE_DEMO_DATA
         </button>
         <button className="bg-pop-cyan text-pop-black p-4 border-4 border-pop-black font-pop text-sm uppercase italic shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 transition-all">
            CLEAR_CACHE_NODES
         </button>
      </div>

      {/* Admin Docs / Code Section */}
      <div className="bg-pop-yellow border-4 border-pop-black p-6 space-y-4">
         <h3 className="font-pop text-2xl uppercase italic">RESTRICTED_DOCS.md</h3>
         <div className="prose prose-invert prose-sm max-h-48 overflow-y-auto font-mono text-[10px] space-y-4 bg-pop-black p-4 border-2 border-pop-black">
            <div>
               <p className="text-pop-pink font-bold underline">APP_ARCHITECTURE:</p>
               <p>&gt; RUNTIME: VITE + REACT 18</p>
               <p>&gt; STYLING: TAILWIND_V4 + MOTION (REACT)</p>
               <p>&gt; PERSISTENCE: GOOGLE_FIRESTORE (REALTIME)</p>
               <p>&gt; AUTH: GOOGLE_IDENTITY_SERVICE</p>
               <p>&gt; INFRA: GOOGLE_CLOUD_RUN (NATIVE)</p>
            </div>
            <div>
               <p className="text-pop-cyan font-bold underline">SECURITY_LAYER:</p>
               <p>&gt; AGE_LOCK: 18+ ENFORCED VIA BIRTH_DATE_VALIDATION</p>
               <p>&gt; PRIVACY: ELITE_INCOGNITO_PROTOCOL_v4</p>
               <p>&gt; TRANSPORT: SHA-256_SSL_UPLINK</p>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, val, color }: { icon: React.ReactNode, label: string, val: string, color: string }) {
  return (
    <div className={cn("pop-card p-4 flex flex-col items-center justify-center space-y-1 rotate-1 shadow-[4px_4px_0px_0px_black]", color)}>
      <div className="text-pop-black/60">{icon}</div>
      <span className="text-3xl font-pop leading-none">{val}</span>
      <span className="text-[10px] font-black tracking-widest">{label}</span>
    </div>
  );
}
