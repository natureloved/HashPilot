"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  Download, 
  Orbit
} from "lucide-react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";

// --- HELPERS ---
const TIERS = ["STARTER", "STANDARD", "ADVANCED", "ELITE"];

export default function OraclePage() {
  useAccount();
  
  // SECTION 1: BASE SETUP
  const [myHashrate, setMyHashrate] = useState("500");
  const [netHashrate, setNetHashrate] = useState("10000");
  const [hCashPrice, setHCashPrice] = useState("4.50");
  const [tier, setTier] = useState("STANDARD");

  // SECTION 2: ORACLE SLIDERS
  const [netGrowth, setNetGrowth] = useState(20); // -50% to +300%
  const [priceMove, setPriceMove] = useState(0);   // -80% to +500%
  const [newPlayers, setNewPlayers] = useState(50); // 0 to 500
  const [halvings, setHalvings] = useState(0);     // 0, 1, 2, 3

  // SECTION 4: AI STATE
  const [reading, setReading] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);

  // --- SIMULATION MATH ---
  const simulationMatrix = useMemo(() => {
    const mh = parseFloat(myHashrate) || 0;
    const nh = parseFloat(netHashrate) || 1;
    const hp = parseFloat(hCashPrice) || 1;
    
    const timelines = [30, 90, 180]; // Columns
    const cases = ["BEAR", "BASE", "BULL"]; // Rows

    return cases.map((c) => {
      return timelines.map((t) => {
        // Multipliers based on CASE
        // Bear: growth * 1.5, price * 0.5
        // Bull: growth * 0.5, price * 1.5
        const caseMultNet = c === "BEAR" ? 1.5 : c === "BULL" ? 0.5 : 1;
        const caseMultPrice = c === "BEAR" ? 0.5 : c === "BULL" ? 2.0 : 1;

        // Effective simulated values
        const simNetGrowth = netGrowth * caseMultNet;
        const simPriceMove = priceMove * caseMultPrice;
        const simNewPlayers = newPlayers * caseMultNet;

        // Calculate Future Network Hashrate
        // Current + % growth + (new players * 50 TH/player)
        const futureNet = nh * (1 + simNetGrowth / 100) + (simNewPlayers * 50);
        
        // Calculate Share
        const futureShare = (mh / futureNet) * 100;

        // Calculate Rewards (Pre-halving daily approx)
        // Formula: 1.25 * 43200 * (share/100)
        const baseDaily = 1.25 * 43200 * (futureShare / 100);
        
        // Apply Halvings
        const emissionFactor = Math.pow(0.5, halvings);
        const totalHCash = baseDaily * t * emissionFactor;
        
        // Calculate USD
        const futurePrice = hp * (1 + simPriceMove / 100);
        const totalUsd = totalHCash * futurePrice;

        return {
          hCash: totalHCash.toLocaleString(undefined, { maximumFractionDigits: 0 }),
          usd: totalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 }),
          share: futureShare.toFixed(3),
          case: c,
          days: t
        };
      });
    });
  }, [myHashrate, netHashrate, hCashPrice, netGrowth, priceMove, newPlayers, halvings]);

  const handleConsultOracle = async () => {
    setIsConsulting(true);
    setReading(null);
    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliderValues: { networkGrowth: netGrowth, priceMove, newPlayers, halvings },
          matrix: simulationMatrix
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setReading(data.reading);
    } catch (err) {
      console.error("Oracle API Error:", err);
      setReading("VERDICT: COMMUNICATION INTERRUPTED\nCRITICAL FACTOR: SYSTEM OFFLINE\nBEST MOVE: VERIFY API KEY IN .ENV\nRISK ALERT: DATA BLACKOUT\nORACLE CONFIDENCE: LOW — The backend failed to respond.");
    } finally {
      setIsConsulting(false);
    }
  };

  const handleExport = async () => {
    if (!matrixRef.current) return;
    try {
      const dataUrl = await toPng(matrixRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `hashpilot-oracle-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* RADAR SWEEP BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,166,35,0.05)_0%,transparent_70%)]" />
        <div 
          className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 animate-[spin_20s_linear_infinite]"
          style={{
            backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 350deg, rgba(245,166,35,0.2) 360deg)',
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45v-30z' fill-rule='evenodd' stroke='%23F5A623' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* HEADER */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Orbit className="text-hp-accent-amber animate-pulse" size={24} />
            <h1 className="font-display text-4xl font-bold tracking-tighter text-white uppercase">
              ORACLE <span className="text-hp-accent-amber">— SCENARIO SIMULATION</span>
            </h1>
          </div>
          <p className="font-mono text-sm text-hp-text-muted tracking-[0.2em] uppercase italic">
            Model the future. Mine with certainty.
          </p>
        </header>

        {/* SECTION 1: BASE SETUP */}
        <section className="bg-hp-surface/60 backdrop-blur-md border border-hp-border p-6 rounded-sm mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-hp-text-muted uppercase tracking-widest">My Hashrate (TH/s)</label>
                <input 
                  type="number" 
                  value={myHashrate} 
                  onChange={e => setMyHashrate(e.target.value)}
                  className="bg-black/40 border border-hp-border px-4 py-2 text-hp-text-primary font-mono outline-none focus:border-hp-accent-amber transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-hp-text-muted uppercase tracking-widest">Network Hashrate (TH/s)</label>
                <input 
                  type="number" 
                  value={netHashrate} 
                  onChange={e => setNetHashrate(e.target.value)}
                  className="bg-black/40 border border-hp-border px-4 py-2 text-hp-text-primary font-mono outline-none focus:border-hp-accent-amber transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-hp-text-muted uppercase tracking-widest">hCASH Price (USD)</label>
                <input 
                  type="number" 
                  value={hCashPrice} 
                  onChange={e => setHCashPrice(e.target.value)}
                  className="bg-black/40 border border-hp-border px-4 py-2 text-hp-text-primary font-mono outline-none focus:border-hp-accent-amber transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-hp-text-muted uppercase tracking-widest">Facility Tier</label>
                <select 
                  value={tier} 
                  onChange={e => setTier(e.target.value)}
                  className="bg-black/40 border border-hp-border px-4 py-2 text-hp-text-primary font-mono outline-none focus:border-hp-accent-amber transition-all cursor-pointer"
                >
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* SECTION 2: SLIDERS (5 Cols) */}
          <section className="xl:col-span-5 space-y-12">
            <h3 className="font-mono text-xs font-bold text-hp-accent-amber tracking-[0.3em] uppercase flex items-center gap-2">
              <Zap size={14} /> THE ORACLE SLIDERS
            </h3>

            {/* SLIDER 1 */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-hp-accent-amber" size={18} />
                  <span className="text-xs font-mono text-white tracking-widest uppercase">Network Hashrate Change</span>
                </div>
                <span className="font-display text-2xl text-hp-accent-amber">{netGrowth}%</span>
              </div>
              <input 
                type="range" min="-50" max="300" 
                value={netGrowth} 
                onChange={e => setNetGrowth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-hp-border rounded-lg appearance-none cursor-pointer accent-hp-accent-amber"
              />
              <div className="flex justify-between text-[8px] font-mono text-hp-text-muted uppercase tracking-tighter">
                <span className="text-hp-accent-red">Pessimistic</span>
                <span className="text-hp-accent-amber">Neutral</span>
                <span className="text-hp-accent-green">Optimistic</span>
              </div>
            </div>

            {/* SLIDER 2 */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <Orbit className="text-hp-accent-amber" size={18} />
                  <span className="text-xs font-mono text-white tracking-widest uppercase">hCASH Price Delta</span>
                </div>
                <span className="font-display text-2xl text-hp-accent-amber">{priceMove > 0 ? "+" : ""}{priceMove}%</span>
              </div>
              <input 
                type="range" min="-80" max="500" 
                value={priceMove} 
                onChange={e => setPriceMove(parseInt(e.target.value))}
                className="w-full h-1.5 bg-hp-border rounded-lg appearance-none cursor-pointer accent-hp-accent-amber"
              />
              <div className="flex justify-between text-[8px] font-mono text-hp-text-muted uppercase tracking-tighter">
                <span className="text-hp-accent-red">Crash</span>
                <span className="text-hp-accent-amber">Stable</span>
                <span className="text-hp-accent-green">Bullish</span>
              </div>
            </div>

            {/* SLIDER 3 */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <Users className="text-hp-accent-amber" size={18} />
                  <span className="text-xs font-mono text-white tracking-widest uppercase">New Miners Joining</span>
                </div>
                <span className="font-display text-2xl text-hp-accent-amber">{newPlayers}</span>
              </div>
              <input 
                type="range" min="0" max="500" 
                value={newPlayers} 
                onChange={e => setNewPlayers(parseInt(e.target.value))}
                className="w-full h-1.5 bg-hp-border rounded-lg appearance-none cursor-pointer accent-hp-accent-amber"
              />
              <div className="flex justify-between text-[8px] font-mono text-hp-text-muted uppercase tracking-tighter">
                <span className="text-hp-accent-green">Low Entry</span>
                <span className="text-hp-accent-amber">Steady</span>
                <span className="text-hp-accent-red">Flood</span>
              </div>
            </div>

            {/* SLIDER 4 (Halvings Toggle) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-hp-accent-amber" size={18} />
                <span className="text-xs font-mono text-white tracking-widest uppercase">Halvings in Period</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    onClick={() => setHalvings(v)}
                    className={cn(
                      "py-3 font-display text-xl transition-all border outline-none",
                      halvings === v 
                        ? "bg-hp-accent-amber border-hp-accent-amber text-hp-background shadow-[0_0_20px_rgba(245,166,35,0.4)]" 
                        : "bg-black/40 border-hp-border text-hp-text-muted hover:border-hp-accent-amber/50"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 3: MATRIX (7 Cols) */}
          <section className="xl:col-span-7 flex flex-col gap-8" ref={matrixRef}>
            <div className="flex justify-between items-end">
              <h3 className="font-mono text-xs font-bold text-hp-accent-amber tracking-[0.3em] uppercase flex items-center gap-2">
                <ShieldCheck size={14} /> SCENARIO MATRIX
              </h3>
              <div className="flex gap-4 font-mono text-[8px] uppercase tracking-widest text-hp-text-muted">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-hp-accent-red" /> Bear</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-hp-border" /> Base</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-hp-accent-green" /> Bull</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* HEADER ROW */}
              {["30 DAYS", "90 DAYS", "180 DAYS"].map(day => (
                <div key={day} className="text-center font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.3em] pb-2">
                  {day}
                </div>
              ))}

              {/* MATRIX CELLS */}
              {simulationMatrix.flat().map((cell, idx) => (
                <motion.div
                  key={`${cell.case}-${cell.days}-${idx}`}
                  layout
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "bg-hp-surface border p-4 rounded-sm flex flex-col items-center justify-center gap-1 relative overflow-hidden transition-all duration-500",
                    cell.case === "BEAR" ? "border-hp-accent-red/30" : 
                    cell.case === "BULL" ? "border-hp-accent-green/30" : 
                    "border-hp-border",
                    // Highlight the "BASE" logic equivalent cell if it were exactly current
                  )}
                >
                  <span className={cn(
                    "text-[8px] font-mono tracking-widest uppercase mb-1",
                    cell.case === "BEAR" ? "text-hp-accent-red" : 
                    cell.case === "BULL" ? "text-hp-accent-green" : 
                    "text-hp-text-muted"
                  )}>
                    {cell.case} CASE
                  </span>
                  <div className="font-display text-2xl lg:text-3xl text-white tracking-tighter">
                    {cell.hCash}
                  </div>
                  <div className="font-mono text-xs text-hp-accent-amber font-bold">
                    ${cell.usd}
                  </div>
                  <div className="text-[9px] font-mono text-hp-text-muted mt-2">
                    {cell.share}% SHARE
                  </div>
                  
                  {/* Subtle case background tint */}
                  <div className={cn(
                    "absolute inset-0 pointer-events-none opacity-[0.03]",
                    cell.case === "BEAR" ? "bg-hp-accent-red" : 
                    cell.case === "BULL" ? "bg-hp-accent-green" : 
                    "bg-transparent"
                  )} />
                </motion.div>
              ))}
            </div>

            {/* AI BUTTON & READING */}
            <div className="mt-8 space-y-6">
              <button
                onClick={handleConsultOracle}
                disabled={isConsulting}
                className="w-full bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-black py-4 rounded-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_0_30px_rgba(245,166,35,0.2)] disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isConsulting ? "DECODING SCENARIOS..." : "⬡ GET ORACLE READING"}
                </span>
                <AnimatePresence>
                  {isConsulting && (
                    <motion.div 
                      className="absolute inset-0 bg-white/20"
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence>
                {reading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/80 border-2 border-hp-accent-amber p-8 rounded-sm relative"
                  >
                    {/* Retro UI Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-hp-accent-amber" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hp-accent-amber" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hp-accent-amber" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-hp-accent-amber" />
                    
                    <div className="space-y-4 font-mono text-sm leading-loose">
                      {reading.split('\n').map((line, i) => {
                        const [label, ...val] = line.split(':');
                        if (!val.length) return <p key={i} className="text-hp-text-secondary">{line}</p>;
                        return (
                          <div key={i} className="flex flex-col md:flex-row md:gap-2">
                            <span className="text-hp-accent-amber font-bold shrink-0">{label}:</span>
                            <span className="text-hp-text-primary italic">{val.join(':')}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-8 pt-4 border-t border-hp-border text-[9px] font-mono text-hp-text-muted flex justify-between items-center">
                      <span>ORACLE CONSULTED: {new Date().toLocaleTimeString()}</span>
                      <ShieldCheck size={12} className="text-hp-accent-amber" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4 pt-4 grow items-end">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 text-[10px] font-mono text-hp-text-muted hover:text-hp-accent-amber transition-colors uppercase tracking-widest"
              >
                <Download size={14} /> Export Scenario Matrix
              </button>
              <div className="h-px bg-hp-border flex-1 mb-1.5" />
              <p className="text-[9px] font-mono text-hp-text-muted italic">Simulation v1.02 // Non-Financial Guidance</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
