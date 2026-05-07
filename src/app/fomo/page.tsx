"use client";

import { Lock, Timer } from "lucide-react";

export default function FomoMachinePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* GLITCH BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,59,48,0.1)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="w-24 h-24 rounded-full border-2 border-hp-accent-red/30 flex items-center justify-center mx-auto mb-8 bg-hp-accent-red/5 animate-pulse">
          <Timer className="text-hp-accent-red" size={48} />
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
          FOMO <span className="text-hp-accent-red">LOCKED</span>
        </h1>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-hp-accent-red text-white font-mono text-xs font-black tracking-widest uppercase mb-8">
          <Lock size={14} /> STATION UNDER MAINTENANCE — COMING SOON
        </div>
        
        <p className="font-mono text-sm text-hp-text-muted max-w-md mx-auto leading-relaxed">
          The Time-Travel Profit Simulator is currently recalibrating its historical data feeds. 
          Calculating the exact cost of your hesitation requires absolute precision.
        </p>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-hp-border/30" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-hp-border/30" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-hp-border/30" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-hp-border/30" />
    </div>
  );
}
