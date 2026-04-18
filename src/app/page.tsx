"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-hp-accent-amber/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl relative z-10"
      >
        <div className="mb-6 flex justify-center">
          <div className="bg-hp-accent-amber/10 border border-hp-accent-amber/30 px-4 py-1.5 rounded-full flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-hp-accent-amber" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-hp-accent-amber uppercase">
              Secure Terminal Protocol v2.0
            </span>
          </div>
        </div>

        <Link href="/" className="group">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 uppercase">
            HashPilot for <span className="text-hp-accent-amber drop-shadow-[0_0_15px_rgba(245,166,35,0.4)]">Club HashCash</span>
          </h1>
        </Link>

        <p className="font-mono text-lg text-hp-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Paste a wallet, get claim now vs wait plus 3 actions.
        </p>

        <form 
          onSubmit={handleAnalyze}
          className="relative max-w-xl mx-auto mb-6 group"
        >
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hp-text-muted group-focus-within:text-hp-accent-amber transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[rgba(5,8,16,0.8)] border-2 border-hp-border focus:border-hp-accent-amber rounded-sm py-5 pl-12 pr-4 text-hp-text-primary font-mono outline-none transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            />
          </div>

          <button
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full mt-4 bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-bold py-3 md:py-5 rounded-sm transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2 text-sm md:text-lg">
              ANALYZE MY WALLET (CLAIM TIMING + 3 ACTIONS)
              <ArrowRight className={cn("w-5 h-5 transition-transform", isHovered ? "translate-x-1" : "")} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>

          <p className="mt-4 text-[11px] font-mono text-hp-text-muted tracking-widest uppercase">
            Read only. No transactions.
          </p>
        </form>

        <button
          onClick={handleDemo}
          className="text-xs font-mono text-hp-accent-blue hover:text-blue-400 underline underline-offset-4 transition-colors"
        >
          Use demo wallet
        </button>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="w-2 h-2 rounded-full bg-hp-accent-green animate-glow-pulse" />
            <span className="text-hp-text-secondary tracking-widest">NETWORK ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <Activity className="w-3.5 h-3.5 text-hp-accent-blue" />
            <span className="text-hp-text-secondary tracking-widest">SYSTEM ONLINE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
