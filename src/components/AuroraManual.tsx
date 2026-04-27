import React from 'react';
import { motion } from 'motion/react';
import { FileText, Shield, Terminal, Zap, Flame, Code } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AuroraManual() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-8 max-w-2xl mx-auto pb-24"
    >
      {/* Header */}
      <div className="relative border-4 border-pop-black bg-pop-black p-8 overflow-hidden shadow-[12px_12px_0px_0px_#FF4500]">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-600/30 blur-[60px] animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/30 blur-[60px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="bg-orange-500 p-4 border-2 border-pop-black rotate-3 shadow-[4px_4px_0px_0px_white]">
            <Flame size={40} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-pop text-4xl text-white tracking-[0.2em] italic uppercase drop-shadow-[4px_4px_0px_#FF4500]">
              AURORA_EMBER
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-0.5 w-12 bg-orange-500" />
              <span className="font-mono text-[10px] text-orange-400 font-bold tracking-widest uppercase">Cyber_Protocol_Manual_v1.0</span>
              <span className="h-0.5 w-12 bg-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <ManualSection 
          icon={<Terminal size={18} className="text-orange-500" />}
          title="01_CORE_ARCHITECTURE"
          color="orange"
        >
          <div className="space-y-3 font-mono text-[11px] text-white/80 leading-relaxed">
            <p className="border-l-2 border-orange-500 pl-3 italic">
              "The frequency is the foundation. Every pulse, every vibration is a packet of raw data transmitted across the neon-void."
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 p-3 border border-white/10">
                <p className="text-orange-400 font-bold mb-1 underline">RESONANCE_ENGINE</p>
                <p>Proprietary logic mapping biological affinities to digital identifiers.</p>
              </div>
              <div className="bg-white/5 p-3 border border-white/10">
                <p className="text-orange-400 font-bold mb-1 underline">NEURAL_UPLINK</p>
                <p>Real-time synchronization via Google Firestore High-Density sockets.</p>
              </div>
            </div>
          </div>
        </ManualSection>

        <ManualSection 
          icon={<Shield size={18} className="text-cyan-500" />}
          title="02_IDENTITY_ENCRYPT"
          color="cyan"
        >
          <div className="space-y-3 font-mono text-[11px] text-white/80 leading-relaxed">
             <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <Code size={40} />
                </div>
                <p className="text-cyan-400 font-bold mb-2 uppercase tracking-tighter">PHANTOM_LAYER_PROTOCOL:</p>
                <ul className="list-disc list-inside space-y-1 text-[10px]">
                  <li>ELITE tier subjects may activate <span className="text-cyan-400 underline">INCOGNITO_MODE</span>.</li>
                  <li>ANIME_AVATAR generation obfuscates base biological traits.</li>
                  <li>All bi-directional swipes are masked with SHA-512 salting before resonance match.</li>
                </ul>
             </div>
          </div>
        </ManualSection>

        <ManualSection 
          icon={<Zap size={18} className="text-yellow-500" />}
          title="03_VIBRATION_EMISSION"
          color="yellow"
        >
          <div className="space-y-4">
             <div className="flex gap-4">
                <div className="w-1/3 bg-pop-black border-2 border-yellow-500 p-4 flex flex-col items-center justify-center gap-2">
                   <div className="text-3xl font-black text-yellow-500 italic">100%</div>
                   <p className="text-[8px] font-mono text-center uppercase text-white/60">UPLINK_STABILITY</p>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 p-4 font-mono text-[10px] text-white/70">
                   <p className="mb-2 italic">Broadcast your frequency to the global stream. Use the VIBE tab to emit signals. Each signal contains a color-coded frequency (FF00FF, 00FFFF, etc.) that defines your current neural state.</p>
                   <div className="flex gap-2">
                      <div className="w-4 h-4 bg-yellow-500 shadow-[2px_2px_0px_0px_white]" />
                      <div className="w-4 h-4 bg-cyan-500 shadow-[2px_2px_0px_0px_white]" />
                      <div className="w-4 h-4 bg-pink-500 shadow-[2px_2px_0px_0px_white]" />
                   </div>
                </div>
             </div>
          </div>
        </ManualSection>

        <ManualSection 
          icon={<Flame size={18} className="text-red-500" />}
          title="04_AURORA_EMBER_LEGAL"
          color="red"
        >
          <div className="bg-red-500/5 border border-red-500/20 p-4 font-mono text-[9px] text-white/60 space-y-2 uppercase leading-snug">
             <p>Accessing the EVA network requires confirmation of chronological age &gt; 18 Solar Years. Failure to comply results in immediate frequency termination.</p>
             <p>Data persistence is managed via decentralized Google Cloud nodes. Your signal is your property, but our infrastructure facilitates the broadcast.</p>
             <p className="pt-2 text-red-400 italic">"NO REFUNDS ON VIBRATION CREDITS."</p>
          </div>
        </ManualSection>
      </div>

      {/* Footer Decoration */}
      <div className="flex justify-between items-center border-t border-white/10 pt-4 font-mono text-[8px] text-white/30 uppercase tracking-[0.3em]">
         <span>EVA_ELITE_TERMINAL</span>
         <span className="text-orange-500 animate-pulse">RUNNING_AURORA_EMBER_CODE</span>
         <span>v2026.04</span>
      </div>
    </motion.div>
  );
}

function ManualSection({ icon, title, children, color }: { icon: React.ReactNode, title: string, children: React.ReactNode, color: string }) {
  const borderCol = {
    orange: 'border-orange-500 shadow-[6px_6px_0px_0px_#FF4500]',
    cyan: 'border-cyan-500 shadow-[6px_6px_0px_0px_#00FFFF]',
    yellow: 'border-yellow-500 shadow-[6px_6px_0px_0px_#FFFF00]',
    red: 'border-red-500 shadow-[6px_6px_0px_0px_#FF0000]',
  }[color];

  return (
    <div className={cn("bg-pop-black border-4 p-6 transition-all hover:-translate-y-1", borderCol)}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="font-pop text-lg text-white tracking-widest italic">{title}</h2>
      </div>
      {children}
    </div>
  );
}
