"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickSetup({ delay = 0 }: { delay?: number }) {
  const [hashrate, setHashrate] = useState<string>("150");
  const [tier, setTier] = useState<string>("STANDARD");
  const [rate, setRate] = useState<string>("NORMAL");
  const [miners, setMiners] = useState<string>("5");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = () => {
    setCalculating(true);
    setResult(null);
    setTimeout(() => {
      setCalculating(false);
      // Mock calculation result
      setResult("+ 12.4 hCASH / DAY");
    }, 800);
  };

  const inputClasses = "w-full bg-[rgba(5,8,16,0.6)] border border-hp-border focus:border-hp-accent-green focus:outline-none rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm transition-colors text-right";
  const selectClasses = "w-full bg-[rgba(5,8,16,0.6)] border border-hp-border focus:border-hp-accent-green focus:outline-none rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm transition-colors appearance-none cursor-pointer";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="bg-[rgba(13,20,36,0.8)] backdrop-blur-md border border-hp-border rounded-sm p-6 relative overflow-hidden h-full flex flex-col"
    >
      <h3 className="font-sans uppercase text-hp-text-primary tracking-widest text-sm mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-hp-accent-blue block rounded-sm animate-pulse"></span>
        QUICK SETUP PANEL
      </h3>

      <div className="flex-1 space-y-4">
        {/* Hashrate Input */}
        <div className="flex flex-col gap-1.5 cursor-text group">
          <label className="text-[10px] text-hp-text-muted font-mono tracking-widest group-focus-within:text-hp-accent-green transition-colors">
            TOTAL HASHRATE (TH/s)
          </label>
          <input
            type="number"
            value={hashrate}
            onChange={(e) => setHashrate(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Tier Select */}
        <div className="flex flex-col gap-1.5 group relative">
          <label className="text-[10px] text-hp-text-muted font-mono tracking-widest group-focus-within:text-hp-accent-green transition-colors">
            FACILITY TIER
          </label>
          <div className="relative">
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className={selectClasses}
            >
              <option value="STARTER">STARTER</option>
              <option value="STANDARD">STANDARD</option>
              <option value="ADVANCED">ADVANCED</option>
              <option value="ELITE">ELITE</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-hp-accent-amber text-xs">▼</div>
          </div>
        </div>

        {/* Rate Select */}
        <div className="flex flex-col gap-1.5 group relative">
          <label className="text-[10px] text-hp-text-muted font-mono tracking-widest group-focus-within:text-hp-accent-green transition-colors">
            ELECTRICITY RATE
          </label>
          <div className="relative">
            <select
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={selectClasses}
            >
              <option value="NORMAL">NORMAL</option>
              <option value="ELEVATED">ELEVATED</option>
              <option value="SURGE">SURGE</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-hp-accent-amber text-xs">▼</div>
          </div>
        </div>

        {/* Miners Input */}
        <div className="flex flex-col gap-1.5 group">
          <label className="text-[10px] text-hp-text-muted font-mono tracking-widest group-focus-within:text-hp-accent-green transition-colors">
            ACTIVE MINERS
          </label>
          <input
            type="number"
            value={miners}
            onChange={(e) => setMiners(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-hp-border border-dashed relative">
        <button
          onClick={handleCalculate}
          disabled={calculating}
          className="w-full bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-bold py-3 rounded-sm transition-all overflow-hidden relative group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">{calculating ? "SIMULATING..." : "CALCULATE"}</span>
          <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-white/30 transform skew-x-[-25deg] group-hover:animate-[scan_0.5s_ease-in-out_forwards]" />
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center"
            >
              <span className="font-mono text-xs text-hp-text-secondary mr-2">Est. Returns:</span>
              <span className="font-display text-lg font-bold text-hp-accent-green animate-glow-pulse">
                {result}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </motion.div>
  );
}
