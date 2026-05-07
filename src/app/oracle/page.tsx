import { Orbit, Lock } from "lucide-react";

export default function OraclePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* RADAR SWEEP BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,166,35,0.05)_0%,transparent_70%)]" />
        <div 
          className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 animate-[spin_20s_linear_infinite]"
          style={{
            backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 350deg, rgba(245,166,35,0.2) 360deg)',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="w-24 h-24 rounded-full border-2 border-hp-accent-amber/30 flex items-center justify-center mx-auto mb-8 bg-hp-accent-amber/5 animate-pulse">
          <Orbit className="text-hp-accent-amber" size={48} />
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
          ORACLE <span className="text-hp-accent-amber">OFFLINE</span>
        </h1>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-hp-accent-amber text-hp-background font-mono text-xs font-black tracking-widest uppercase mb-8">
          <Lock size={14} /> SYSTEM RESTRICTED — COMING SOON
        </div>
        
        <p className="font-mono text-sm text-hp-text-muted max-w-md mx-auto leading-relaxed">
          The Scenario Simulation Matrix is currently undergoing deep-learning calibration. 
          Advanced predictive modeling will be available to all HashPilot operators soon.
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


