"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_WALLET = "0x8f9a59b6574f9bf10398863673c6c06a6c0735d9";

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleAnalyze = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (address.trim()) {
      router.push(`/claim-advisor?address=${address.trim()}`);
    }
  };

  const handleDemo = () => {
    setAddress(DEMO_WALLET);
    setTimeout(() => {
      router.push(`/claim-advisor?address=${DEMO_WALLET}`);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center px-4 pt-20 md:pt-32 pb-32 max-w-6xl mx-auto">
      {/* 1. HERO SECTION (Above the fold focus) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full text-center mb-24 relative z-10"
      >
        <h1 className="font-display text-5xl md:text-8xl font-bold tracking-tight text-white mb-8 uppercase leading-[1.1]">
          HashPilot for <br />
          <span className="text-hp-accent-amber drop-shadow-[0_0_20px_rgba(245,166,35,0.4)]">
            Club HashCash
          </span>
        </h1>

        <div className="mb-10 flex justify-center">
          <div className="bg-hp-accent-amber/10 border border-hp-accent-amber/30 px-6 py-2 rounded-full flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-hp-accent-amber" />
            <span className="text-[11px] font-mono font-bold tracking-[0.3em] text-hp-accent-amber uppercase">
              Terminal Authorized v2.0
            </span>
          </div>
        </div>

        <p className="font-mono text-lg md:text-xl text-hp-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Paste a wallet, get <span className="text-hp-accent-green font-bold">claim now vs wait</span> plus 3 actions.
        </p>

        <form 
          onSubmit={handleAnalyze}
          className="relative max-w-2xl mx-auto mb-6 group"
        >
          <div className="relative mb-4">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-hp-text-muted group-focus-within:text-hp-accent-amber transition-colors">
              <Wallet className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste your Avalanche wallet address (0x...)"
              className="w-full bg-[rgba(5,11,24,0.7)] backdrop-blur-xl border-2 border-hp-border focus:border-hp-accent-amber rounded-sm py-6 pl-14 pr-4 text-hp-text-primary font-mono text-lg outline-none transition-all shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            />
          </div>

          <button
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-black py-4 md:py-6 rounded-sm transition-all flex items-center justify-center gap-4 group relative overflow-hidden shadow-[0_0_25px_rgba(245,166,35,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-3 text-base md:text-xl tracking-wider">
              ANALYZE MY WALLET (CLAIM TIMING + 3 ACTIONS)
              <ArrowRight className={cn("w-6 h-6 transition-transform", isHovered ? "translate-x-1" : "")} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-[12px] font-mono text-hp-text-muted tracking-widest uppercase flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Read only. No transactions.
            </p>
            <div className="hidden md:block w-px h-3 bg-hp-border" />
            <button
              type="button"
              onClick={handleDemo}
              className="text-[12px] font-mono text-hp-accent-blue hover:text-blue-400 underline underline-offset-4 transition-colors uppercase tracking-widest"
            >
              Use demo wallet
            </button>
          </div>
        </form>
      </motion.div>

      {/* 2. "HOW IT WORKS" ROW (Immediate value prop) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-32 z-10"
      >
        {[
          { step: "1", title: "Paste wallet", desc: "No connection required", icon: Wallet },
          { step: "2", title: "Get verdict", desc: "Claim now vs Wait", icon: Activity },
          { step: "3", title: "Take action", desc: "Claim, Alert, View ops", icon: ArrowRight },
        ].map((item, idx) => (
          <div key={idx} className="bg-hp-surface/40 backdrop-blur-sm border border-hp-border p-8 rounded-sm hover:border-hp-accent-amber/50 transition-all group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-hp-accent-amber/10 flex items-center justify-center text-hp-accent-amber font-mono font-black border border-hp-accent-amber/30">
                {item.step}
              </div>
              <h3 className="font-display text-xl text-white group-hover:text-hp-accent-amber transition-colors font-bold uppercase tracking-tight">
                {item.title}
              </h3>
            </div>
            <p className="font-mono text-xs text-hp-text-muted uppercase tracking-[0.2em]">
              {item.desc}
            </p>
          </div>
        ))}
      </motion.div>

      {/* 3. BELOW THE FOLD (Splash / Status Info) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="w-full border-t border-hp-border pt-16 text-center opacity-60"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-hp-text-muted mb-8 italic">
          Mining Intelligence Terminal v1.0 // Cluster HashCash Authorized
        </p>
      </motion.div>
    </div>
  );
}
