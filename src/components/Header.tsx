"use client";

import Link from "next/link";
import { Activity, Zap } from "lucide-react";
import { usePrices } from "@/components/providers/PriceProvider";

export default function Header() {
  const { avax, hcash, isLoading } = usePrices();

  return (
    <header className="h-20 bg-hp-surface border-b border-hp-border flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-6">
        <div className="flex flex-col md:hidden">
          <Link href="/">
            <h1 className="font-display text-xl font-bold text-hp-accent-amber tracking-wider relative inline-block group cursor-pointer">
              HASHPILOT
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-hp-accent-amber animate-glow-pulse"></span>
            </h1>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-hp-surface-elevated border border-hp-border px-4 py-2 rounded-sm font-mono text-xs">
          <div className="w-2 h-2 rounded-full bg-hp-accent-green animate-glow-pulse" />
          <span className="text-hp-text-secondary tracking-widest">NETWORK ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Current AVAX Price Display */}
        <div className="hidden lg:flex items-center gap-3 bg-[rgba(5,8,16,0.3)] border border-hp-border/50 px-3 py-1.5 rounded-sm font-mono">
          <Zap className="w-3.5 h-3.5 text-hp-accent-blue" />
          <div className="flex flex-col">
            <span className="text-[8px] text-hp-text-muted tracking-widest">AVAX</span>
            <span className="text-hp-text-secondary text-xs font-bold">
              ${isLoading ? "---" : avax.price.toFixed(2)} 
              <span className={avax.change24h >= 0 ? "text-hp-accent-green text-[9px] ml-1" : "text-hp-accent-red text-[9px] ml-1"}>
                {avax.change24h >= 0 ? "+" : ""}{avax.change24h.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>

        {/* Current hCASH Price Display */}
        <div className="flex items-center gap-3 bg-[rgba(5,8,16,0.5)] border border-hp-border px-4 py-2 rounded-sm font-mono">
          <Activity className="w-4 h-4 text-hp-accent-amber" />
          <div className="flex flex-col">
            <span className="text-[10px] text-hp-text-muted tracking-widest">hCASH PRICE</span>
            <span className="text-hp-text-primary text-sm font-bold">
              ${isLoading ? "---" : hcash.price < 1 ? hcash.price.toFixed(4) : hcash.price.toFixed(2)} 
              <span className={hcash.change24h >= 0 ? "text-hp-accent-green text-xs ml-1" : "text-hp-accent-red text-xs ml-1"}>
                {hcash.change24h >= 0 ? "+" : ""}{hcash.change24h.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
