"use client";

import { Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-hp-surface border-b border-hp-border flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-6">
        <div className="flex flex-col md:hidden">
          <h1 className="font-display text-xl font-bold text-hp-accent-amber tracking-wider relative inline-block group cursor-default">
            HASHPILOT
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-hp-accent-amber animate-glow-pulse"></span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-hp-surface-elevated border border-hp-border px-4 py-2 rounded-sm font-mono text-xs">
          <div className="w-2 h-2 rounded-full bg-hp-accent-green animate-glow-pulse" />
          <span className="text-hp-text-secondary tracking-widest">NETWORK ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Current hCASH Price Display */}
        <div className="flex items-center gap-3 bg-[rgba(5,8,16,0.5)] border border-hp-border px-4 py-2 rounded-sm font-mono">
          <Activity className="w-4 h-4 text-hp-accent-amber" />
          <div className="flex flex-col">
            <span className="text-[10px] text-hp-text-muted tracking-widest">hCASH PRICE</span>
            <span className="text-hp-text-primary text-sm font-bold">$14.20 <span className="text-hp-accent-green text-xs">+5.2%</span></span>
          </div>
        </div>
      </div>
    </header>
  );
}
