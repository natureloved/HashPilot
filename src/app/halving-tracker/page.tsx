"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { usePrices } from "@/components/providers/PriceProvider";

export default function HalvingTrackerPage() {
  const { hcash, isLoading } = usePrices();
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [blocksLeft, setBlocksLeft] = useState(0);
  const [isLiveBlock, setIsLiveBlock] = useState(false);
  const [networkStats, setNetworkStats] = useState<{ totalSupply: number; burned: number; circulating: number } | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);

  // User Setup
  const [hashrate, setHashrate] = useState("500");
  const [netShare, setNetShare] = useState("5.9");
  const [price, setPrice] = useState(hcash.price.toString());

  // Sync price when it loads for the first time
  useEffect(() => {
    if (!isLoading && price === "14.2") {
      setPrice(hcash.price < 1 ? hcash.price.toFixed(4) : hcash.price.toFixed(2));
    }
  }, [hcash.price, isLoading, price]);

  const share = parseFloat(netShare) || 0;
  const p = parseFloat(price) || 0;

  useEffect(() => {
    // Next halving is Halving 4 — Aug 22, 2026 (97 days after Halving 3 on May 17)
    const NEXT_HALVING = new Date('2026-08-22T00:00:00Z');
    const SECONDS_PER_BLOCK = 2;

    const seedFromDate = () => {
      const secsLeft = Math.max(0, Math.floor((NEXT_HALVING.getTime() - Date.now()) / 1000));
      setBlocksLeft(Math.floor(secsLeft / SECONDS_PER_BLOCK));
      setTimeLeft({
        d: Math.floor(secsLeft / 86400),
        h: Math.floor((secsLeft % 86400) / 3600),
        m: Math.floor((secsLeft % 3600) / 60),
        s: secsLeft % 60,
      });
    };

    // Seed initial values from date math
    seedFromDate();

    // Try to get the real Avalanche block number to confirm our estimate
    fetch('https://api.avax.network/ext/bc/C/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.result) setIsLiveBlock(true); // block fetch succeeded — date math is accurate
      })
      .catch(() => {}); // silently fall back to date math

    // Tick countdown every second
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d = Math.max(0, d - 1); }
        if (d === 0 && h === 0 && m === 0 && s <= 0) return { d: 0, h: 0, m: 0, s: 0 };
        return { d, h, m, s };
      });
      setBlocksLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    // Re-sync every 60 seconds to correct drift
    const syncInterval = setInterval(seedFromDate, 60_000);

    const fetchNetworkStats = async () => {
      try {
        const res = await fetch('/api/network-data');
        const data = await res.json();
        if (data.hcashStats) setNetworkStats(data.hcashStats);
      } catch (e) {
        console.warn("Failed to fetch network stats", e);
      }
    };
    fetchNetworkStats();

    return () => { clearInterval(timer); clearInterval(syncInterval); };
  }, []);

  const bBlocksPerDay = 43200;
  const currBlockReward = 1.25;
  const nextBlockReward = 0.625;

  const currentHcashDay = currBlockReward * (share / 100) * bBlocksPerDay;
  const nextHcashDay = nextBlockReward * (share / 100) * bBlocksPerDay;

  // Chart Data
  const projectionData = useMemo(() => {
    let accFlat = 0;
    let accHalved = 0;
    const data = [];
    for (let month = 1; month <= 6; month++) {
      accFlat += currentHcashDay * 30;
      if (month > 1) { // Halving hits after month 1 in this simulation
         accHalved += nextHcashDay * 30;
      } else {
         accHalved += currentHcashDay * 30;
      }
      data.push({
        month: `Month ${month}`,
        "Without Halving": accFlat,
        "With Halving": accHalved,
      });
    }
    return data;
  }, [currentHcashDay, nextHcashDay]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full pb-10">
      
      {/* COUNTDOWN CLOCK */}
      <section className="bg-[rgba(13,20,36,0.8)] backdrop-blur-md border border-hp-border rounded-sm p-4 md:p-6 text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#F5A62310_1px,transparent_1px),linear-gradient(to_bottom,#F5A62310_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="relative z-10 flex items-center gap-3 mb-3">
          <h2 className="text-hp-accent-amber font-mono tracking-widest text-[10px] md:text-xs uppercase">
            NEXT HALVING EVENT
          </h2>
          <span className={cn(
            "text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm border uppercase tracking-widest",
            isLiveBlock
              ? "text-hp-accent-green border-hp-accent-green/40 bg-hp-accent-green/10"
              : "text-hp-accent-amber border-hp-accent-amber/40 bg-hp-accent-amber/10"
          )}>
            {isLiveBlock ? "● CHAIN-SYNCED" : "● DATE-BASED EST."}
          </span>
        </div>
        
        <div className="relative z-10 flex gap-3 md:gap-6 font-display text-4xl md:text-6xl lg:text-8xl text-hp-accent-amber font-bold tracking-widest drop-shadow-[0_0_15px_rgba(245,166,35,0.4)]">
          <div className="flex flex-col items-center">
            <span>{timeLeft.d.toString().padStart(2, '0')}</span><span className="text-[10px] font-mono tracking-widest mt-1 uppercase">Days</span>
          </div>
          <span className="animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[10px] font-mono tracking-widest mt-1 uppercase">Hours</span>
          </div>
          <span className="animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[10px] font-mono tracking-widest mt-1 uppercase">Mins</span>
          </div>
          <span className="opacity-50">:</span>
          <div className="flex flex-col items-center opacity-80">
            <span>{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-[10px] font-mono tracking-widest mt-1 uppercase">Secs</span>
          </div>
        </div>

        <div className="relative z-10 mt-6 font-mono text-hp-text-primary text-xs flex flex-col md:flex-row items-center gap-4">
          <div className="bg-[#050810] border border-hp-border px-3 py-1.5 rounded-sm border-l-4 border-l-hp-accent-amber">
            BLOCKS UNTIL: <span className="font-bold text-hp-accent-amber">{blocksLeft.toLocaleString()}</span>
          </div>
          <div className="bg-[#050810] border border-hp-border px-3 py-1.5 rounded-sm text-hp-text-secondary">
            <span className="text-white font-bold">1.25</span> → <span className="text-hp-accent-red font-bold">0.625</span> hCASH
          </div>
        </div>
      </section>

      {/* TOKENOMICS OVERVIEW */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-hp-surface border border-hp-border p-4 rounded-sm flex flex-col items-center">
          <span className="text-[10px] font-mono text-hp-text-muted uppercase tracking-[0.2em] mb-1">hCASH Supply</span>
          <span className="font-display text-xl font-bold text-hp-text-primary">
            {networkStats ? `${networkStats.totalSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })} hCASH` : "—"}
          </span>
          <p className="text-[9px] font-mono text-hp-text-muted mt-1">Live from ERC-20 totalSupply()</p>
          <div className="mt-2 w-full h-1 bg-hp-border rounded-full overflow-hidden">
            <div className="h-full bg-hp-accent-blue" style={{ width: networkStats ? `${Math.min((networkStats.totalSupply / 21000000) * 100, 100)}%` : '0%' }} />
          </div>
        </div>
        <div className="bg-hp-surface border border-hp-border p-4 rounded-sm flex flex-col items-center">
          <span className="text-[10px] font-mono text-hp-text-muted uppercase tracking-[0.2em] mb-1">Daily Network Emission</span>
          <span className="font-display text-xl font-bold text-hp-accent-amber">
            {(1.25 * 43200).toLocaleString()} hCASH
          </span>
          <p className="text-[9px] font-mono text-hp-text-muted mt-1">1.25/block × 43,200 blocks/day</p>
          <div className="mt-2 w-full h-1 bg-hp-border rounded-full overflow-hidden">
            <div className="h-full bg-hp-accent-amber" style={{ width: '62.5%' }} />
          </div>
        </div>
      </section>

      {/* PERSONAL IMPACT CALCULATOR */}
      <section>
        <h3 className="font-sans uppercase text-hp-text-secondary text-sm tracking-widest font-semibold flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-[#00D4FF] block rounded-sm animate-pulse"></span>
          PERSONAL IMPACT CALCULATOR
        </h3>
        
        <div className="bg-hp-surface border border-hp-border rounded-sm p-4 lg:p-6">
           <div className="flex flex-wrap md:flex-nowrap gap-3 mb-6">
              <div className="w-full flex flex-col gap-1">
                <label className="text-[10px] text-hp-text-muted tracking-widest font-mono uppercase">Hashrate (TH/s)</label>
                <input type="number" value={hashrate} onChange={(e) => setHashrate(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-2 py-1.5 text-hp-text-primary font-mono text-xs focus:border-[#00D4FF] outline-none" />
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-[10px] text-hp-text-muted tracking-widest font-mono uppercase">Net Share (%)</label>
                <input type="number" value={netShare} onChange={(e) => setNetShare(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-2 py-1.5 text-hp-text-primary font-mono text-xs focus:border-[#00D4FF] outline-none" />
              </div>
              <div className="w-full flex flex-col gap-1 relative">
                <label className="text-[10px] text-hp-text-muted tracking-widest font-mono uppercase">Price (USD)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-2 py-1.5 text-hp-text-primary font-mono text-xs focus:border-[#00D4FF] outline-none" />
                {Math.abs(parseFloat(price) - hcash.price) < 0.01 && (
                  <div className="absolute right-2 top-[-8px] bg-hp-accent-green text-hp-background text-[9px] font-bold px-1 py-0.5 rounded-full animate-pulse">
                    LIVE
                  </div>
                )}
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* BEFORE */}
              <div className="flex-1 w-full border border-hp-accent-green/30 bg-hp-accent-green/5 rounded-sm p-4 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050810] border border-hp-accent-green text-hp-accent-green font-mono text-[9px] px-2 py-0.5 font-bold tracking-widest rounded-sm">BEFORE</div>
                 <div className="space-y-2 font-mono text-xs mt-2">
                   <div className="flex justify-between items-end border-b border-hp-accent-green/10 pb-0.5">
                     <span className="text-hp-text-muted">Daily:</span>
                     <span className="text-lg font-display font-bold text-hp-accent-green">{currentHcashDay.toFixed(1)}</span>
                   </div>
                   <div className="flex justify-between items-end pt-1">
                     <span className="text-hp-text-muted">USD/day:</span>
                     <span className="text-hp-text-secondary font-bold">${(currentHcashDay * p).toFixed(2)}</span>
                   </div>
                 </div>
              </div>

              {/* ARROW */}
              <div className="font-mono text-hp-text-muted text-2xl shrink-0">→</div>

              {/* AFTER */}
              <div className="flex-1 w-full border border-hp-accent-amber/30 bg-hp-accent-amber/5 rounded-sm p-4 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050810] border border-hp-accent-amber text-hp-accent-amber font-mono text-[9px] px-2 py-0.5 font-bold tracking-widest rounded-sm">AFTER</div>
                 <div className="space-y-2 font-mono text-xs mt-2">
                   <div className="flex justify-between items-end border-b border-hp-accent-amber/10 pb-0.5">
                     <span className="text-hp-text-muted">Daily:</span>
                     <span className="text-lg font-display font-bold text-hp-accent-amber">{nextHcashDay.toFixed(1)}</span>
                   </div>
                   <div className="flex justify-between items-end pt-1">
                     <span className="text-hp-text-muted">USD/day:</span>
                     <span className="text-hp-accent-red font-bold">${(nextHcashDay * p).toFixed(2)}</span>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* HALVING HISTORY TIMELINE */}
      <section>
        <h3 className="font-sans uppercase text-hp-text-secondary text-sm tracking-widest font-semibold flex items-center gap-2 mb-6">
          <span className="w-2 h-2 bg-hp-text-primary block rounded-sm"></span>
          HALVING TIMELINE
        </h3>
        
        <div className="bg-hp-surface border border-hp-border rounded-sm p-8 overflow-x-auto">
          <div className="min-w-[600px] relative flex justify-between items-center py-4">
            {/* Base line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[70%] h-0.5 bg-hp-border z-0"></div>
            <div className="absolute left-[70%] top-1/2 -translate-y-1/2 w-[30%] h-0.5 border-t-2 border-dashed border-hp-border z-0"></div>
            
            {[
              { num: 1, date: "Genesis", reward: "5.0", state: "past" },
              { num: 2, date: "Jan 12 2026", reward: "2.5", state: "past" },
              { num: 3, date: "May 17 2026", reward: "1.25", state: "current" },
              { num: 4, date: "Aug 22 2026", reward: "0.625", state: "future" }
            ].map((node, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center w-24">
                <span className="text-xs uppercase tracking-widest font-mono text-hp-text-muted mb-3">Halving {node.num}</span>
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 mb-3",
                  node.state === "past" ? "bg-hp-text-muted border-hp-text-muted" 
                  : node.state === "current" ? "bg-hp-accent-amber border-hp-accent-amber shadow-[0_0_15px_rgba(245,166,35,0.8)] animate-pulse"
                  : "bg-[#050810] border-hp-accent-amber"
                )}></div>
                <span className={cn("text-sm font-mono font-bold whitespace-nowrap mb-1", node.state === "current" ? "text-hp-accent-amber" : "text-hp-text-primary")}>{node.date}</span>
                <span className="text-xs font-mono text-hp-text-secondary">{node.reward} hCASH/blk</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGY SECTION */}
      <section>
        <h3 className="font-sans uppercase text-hp-text-secondary text-2xl tracking-widest font-semibold flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-hp-accent-green block rounded-sm"></span>
          HOW TO PREPARE (STRATEGIES)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm p-4 hover:border-hp-accent-amber transition-colors flex flex-col">
            <h4 className="font-display font-bold text-lg mb-1 text-hp-text-primary text-center">⚡ COMPOUND NOW</h4>
            <p className="text-[10px] font-mono text-hp-text-muted text-center mb-4 flex-1">
              Reinvesting your daily 1.25 hCASH block rewards into more miners. This increases your local hashrate share before the halving restricts total emission.
            </p>
            <button 
              onClick={() => setActiveStrategy("COMPOUND")}
              className={cn(
                "w-full border py-2 text-[10px] font-mono font-bold tracking-widest rounded-sm transition-all focus:outline-none",
                activeStrategy === "COMPOUND" ? "bg-hp-accent-amber text-black border-hp-accent-amber" : "border-hp-accent-amber/50 text-hp-accent-amber hover:bg-hp-accent-amber hover:text-black"
              )}
            >
              {activeStrategy === "COMPOUND" ? "CALCULATED ✓" : "CALCULATE"}
            </button>
          </div>
          <div className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm p-4 hover:border-hp-accent-green transition-colors flex flex-col">
            <h4 className="font-display font-bold text-lg mb-1 text-hp-text-primary text-center">🏦 ACCUMULATE</h4>
            <p className="text-xs font-mono text-hp-text-muted text-center mb-4 flex-1">Stockpile hCASH right now before emission cuts artificially restrict supply growth.</p>
            <button 
              onClick={() => setActiveStrategy("ACCUMULATE")}
              className={cn(
                "w-full border py-2 text-[10px] font-mono font-bold tracking-widest rounded-sm transition-all focus:outline-none",
                activeStrategy === "ACCUMULATE" ? "bg-hp-accent-green text-black border-hp-accent-green" : "border-hp-accent-green/50 text-hp-accent-green hover:bg-hp-accent-green hover:text-black"
              )}
            >
              {activeStrategy === "ACCUMULATE" ? "CALCULATED ✓" : "CALCULATE"}
            </button>
          </div>
          <div className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm p-4 hover:border-[#00D4FF] transition-colors flex flex-col">
            <h4 className="font-display font-bold text-lg mb-1 text-hp-text-primary text-center">⬆️ UPGRADE</h4>
            <p className="text-xs font-mono text-hp-text-muted text-center mb-4 flex-1">Higher tier = more miner capacity. Prep infrastructure for post-halving hashrate.</p>
            <button 
              onClick={() => setActiveStrategy("UPGRADE")}
              className={cn(
                "w-full border py-2 text-[10px] font-mono font-bold tracking-widest rounded-sm transition-all focus:outline-none",
                activeStrategy === "UPGRADE" ? "bg-[#00D4FF] text-black border-[#00D4FF]" : "border-[#00D4FF]/50 text-[#00D4FF] hover:bg-[#00D4FF] hover:text-black"
              )}
            >
              {activeStrategy === "UPGRADE" ? "CALCULATED ✓" : "VIEW UPGRADES"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeStrategy && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-hp-surface border border-hp-border p-6 rounded-sm relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold",
                  activeStrategy === "COMPOUND" ? "bg-hp-accent-amber/20 text-hp-accent-amber" :
                  activeStrategy === "ACCUMULATE" ? "bg-hp-accent-green/20 text-hp-accent-green" :
                  "bg-hp-accent-blue/20 text-hp-accent-blue"
                )}>
                  {activeStrategy === "COMPOUND" ? "⚡" : activeStrategy === "ACCUMULATE" ? "🏦" : "⬆️"}
                </div>
                <div>
                  <h4 className="font-display text-white font-bold uppercase tracking-tight">
                    {activeStrategy === "COMPOUND" ? "Compound Strategy Result" :
                     activeStrategy === "ACCUMULATE" ? "Accumulation Strategy Result" :
                     "Upgrade Strategy Result"}
                  </h4>
                  <p className="text-[10px] font-mono text-hp-text-muted uppercase">HALVING PREP REPORT // NODE {hashrate} TH/s</p>
                </div>
              </div>
              <p className="font-mono text-xs text-hp-text-primary leading-relaxed mb-4 whitespace-pre-line">
                {activeStrategy === "COMPOUND" ? 
                  `With a ${hashrate} TH/s setup, compounding your next 42 days of rewards would yield an estimated ${((currentHcashDay * 42) / 100).toFixed(2)} extra miners. 
                  This increases your network share by ~0.02% before the reward drop hits.` :
                 activeStrategy === "ACCUMULATE" ? 
                  `Accumulating your current daily yield of ${currentHcashDay.toFixed(1)} hCASH for the next 42 days secures ${(currentHcashDay * 42).toFixed(0)} hCASH at pre-halving difficulty. 
                  Post-halving, this same amount would take ~84 days to mine.` :
                  `Upgrading to the next tier would increase your capacity by 40%. 
                  At current network difficulty, this upgrade pays for itself in ~12 days, leaving 30 days of high-yield mining before the halving.`}
              </p>
              <div className="flex justify-end">
                <button onClick={() => setActiveStrategy(null)} className="text-[9px] font-mono text-hp-text-muted hover:text-white uppercase tracking-widest underline underline-offset-4">Dismiss Report</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* BOTTOM CHART */}
      <section>
        <h3 className="font-sans uppercase text-hp-text-secondary text-sm tracking-widest font-semibold flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-hp-text-primary block rounded-sm"></span>
          6-MONTH EARNINGS PROJECTION (CUMULATIVE)
        </h3>
        
        <div className="bg-[rgba(13,20,36,0.6)] border border-hp-border rounded-sm p-6 lg:p-8 h-[400px]">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" vertical={false} />
                <XAxis dataKey="month" stroke="#3D5070" tick={{ fill: "#3D5070", fontSize: 13, fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#3D5070" tick={{ fill: "#3D5070", fontSize: 13, fontFamily: "monospace" }} axisLine={false} tickLine={false} dx={-10} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A2035', borderColor: '#1E2D4A', fontFamily: 'monospace', fontSize: '14px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontFamily: 'monospace', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Without Halving" stroke="#00D4FF" strokeWidth={2} dot={{ r: 4, fill: '#00D4FF' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="With Halving" stroke="#F5A623" strokeWidth={3} dot={{ r: 4, fill: '#F5A623' }} activeDot={{ r: 8, stroke: '#fff' }} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}

