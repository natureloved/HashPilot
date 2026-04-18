"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
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
  const [timeLeft, setTimeLeft] = useState({ d: 68, h: 18, m: 42, s: 15 });
  const [blocksLeft, setBlocksLeft] = useState(2973540); 

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
    // Simulated countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        return { d, h, m, s };
      });
    }, 1000);

    const blockTimer = setInterval(() => {
      setBlocksLeft(prev => prev - 1);
    }, 2000);

    return () => { clearInterval(timer); clearInterval(blockTimer); };
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
      <section className="bg-[rgba(13,20,36,0.8)] backdrop-blur-md border border-hp-border rounded-sm p-8 text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#F5A62310_1px,transparent_1px),linear-gradient(to_bottom,#F5A62310_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <h2 className="relative z-10 text-hp-accent-amber font-mono tracking-widest text-xl mb-4">
          NEXT HALVING EVENT
        </h2>
        
        <div className="relative z-10 flex gap-4 md:gap-8 font-display text-5xl md:text-7xl lg:text-9xl text-hp-accent-amber font-bold tracking-widest drop-shadow-[0_0_20px_rgba(245,166,35,0.4)]">
          <div className="flex flex-col items-center">
            <span>{timeLeft.d.toString().padStart(2, '0')}</span><span className="text-xs font-mono tracking-widest mt-2 uppercase">Days</span>
          </div>
          <span className="animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-xs font-mono tracking-widest mt-2 uppercase">Hours</span>
          </div>
          <span className="animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-xs font-mono tracking-widest mt-2 uppercase">Mins</span>
          </div>
          <span className="opacity-50">:</span>
          <div className="flex flex-col items-center opacity-80">
            <span>{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-xs font-mono tracking-widest mt-2 uppercase">Secs</span>
          </div>
        </div>

        <div className="relative z-10 mt-8 font-mono text-hp-text-primary text-sm flex flex-col md:flex-row items-center gap-6">
          <div className="bg-[#050810] border border-hp-border px-4 py-2 rounded-sm border-l-4 border-l-hp-accent-amber">
            BLOCKS UNTIL HALVING: <span className="font-bold text-hp-accent-amber">{blocksLeft.toLocaleString()}</span>
          </div>
          <div className="bg-[#050810] border border-hp-border px-4 py-2 rounded-sm text-hp-text-secondary">
            Block reward drops from <span className="text-white font-bold">1.25</span> → <span className="text-hp-accent-red font-bold">0.625</span> hCASH
          </div>
        </div>
      </section>

      {/* TOKENOMICS OVERVIEW */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-hp-surface border border-hp-border p-6 rounded-sm flex flex-col items-center">
          <span className="text-xs font-mono text-hp-text-muted uppercase tracking-[0.2em] mb-2">Total hCASH Supply</span>
          <span className="font-display text-2xl font-bold text-hp-text-primary">4,142,824.10 hCASH</span>
          <div className="mt-4 w-full h-1 bg-hp-border rounded-full overflow-hidden">
             <div className="h-full bg-hp-accent-blue w-[20%]" />
          </div>
        </div>
        <div className="bg-hp-surface border border-hp-border p-6 rounded-sm flex flex-col items-center">
          <span className="text-xs font-mono text-hp-text-muted uppercase tracking-[0.2em] mb-2">Total hCASH Burned</span>
          <span className="font-display text-2xl font-bold text-hp-accent-red">4,722,187.50 hCASH</span>
          <div className="mt-4 w-full h-1 bg-hp-border rounded-full overflow-hidden">
             <div className="h-full bg-hp-accent-red w-[53%]" />
          </div>
        </div>
      </section>

      {/* PERSONAL IMPACT CALCULATOR */}
      <section>
        <h3 className="font-sans uppercase text-hp-text-secondary text-sm tracking-widest font-semibold flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-[#00D4FF] block rounded-sm animate-pulse"></span>
          PERSONAL IMPACT CALCULATOR
        </h3>
        
        <div className="bg-hp-surface border border-hp-border rounded-sm p-4 md:p-6 lg:p-8">
           <div className="flex flex-wrap md:flex-nowrap gap-4 mb-8">
              <div className="w-full flex flex-col gap-1">
                <label className="text-xs text-hp-text-muted tracking-widest font-mono">YOUR HASHRATE (TH/s)</label>
                <input type="number" value={hashrate} onChange={(e) => setHashrate(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-[#00D4FF] outline-none" />
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-xs text-hp-text-muted tracking-widest font-mono">NETWORK SHARE (%)</label>
                <input type="number" value={netShare} onChange={(e) => setNetShare(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-[#00D4FF] outline-none" />
              </div>
              <div className="w-full flex flex-col gap-1 relative">
                <label className="text-xs text-hp-text-muted tracking-widest font-mono">hCASH PRICE (USD)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-[#00D4FF] outline-none" />
                {Math.abs(parseFloat(price) - hcash.price) < 0.01 && (
                  <div className="absolute right-3 top-[-10px] bg-hp-accent-green text-hp-background text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                    LIVE
                  </div>
                )}
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* BEFORE */}
              <div className="flex-1 w-full border border-hp-accent-green bg-hp-accent-green/5 rounded-sm p-6 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050810] border border-hp-accent-green text-hp-accent-green font-mono text-[10px] px-3 py-1 font-bold tracking-widest rounded-sm">BEFORE HALVING</div>
                 <div className="space-y-4 font-mono text-sm mt-3">
                   <div className="flex justify-between items-end border-b border-hp-accent-green/20 pb-1">
                     <span className="text-hp-text-muted">Daily:</span>
                     <span className="text-xl font-display font-bold text-hp-accent-green">{currentHcashDay.toFixed(1)} hCASH</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-hp-accent-green/20 pb-1">
                     <span className="text-hp-text-muted">Weekly:</span>
                     <span className="text-lg font-display text-hp-text-primary">{(currentHcashDay * 7).toFixed(1)} hCASH</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-hp-accent-green/20 pb-1">
                     <span className="text-hp-text-muted">Monthly:</span>
                     <span className="text-lg font-display text-hp-text-primary">{(currentHcashDay * 30).toFixed(1)} hCASH</span>
                   </div>
                   <div className="flex justify-between items-end pt-2">
                     <span className="text-hp-text-muted">USD/day:</span>
                     <span className="text-hp-text-secondary font-bold">${(currentHcashDay * p).toFixed(2)}</span>
                   </div>
                 </div>
              </div>

              {/* ARROW */}
              <div className="font-mono text-hp-text-muted text-4xl shrink-0 animate-pulse">→</div>

              {/* AFTER */}
              <div className="flex-1 w-full border border-hp-accent-amber bg-hp-accent-amber/5 rounded-sm p-6 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050810] border border-hp-accent-amber text-hp-accent-amber font-mono text-[10px] px-3 py-1 font-bold tracking-widest rounded-sm">AFTER HALVING</div>
                 <div className="space-y-4 font-mono text-sm mt-3">
                   <div className="flex justify-between items-end border-b border-hp-accent-amber/20 pb-1">
                     <span className="text-hp-text-muted">Daily:</span>
                     <span className="text-xl font-display font-bold text-hp-accent-amber">{nextHcashDay.toFixed(1)} hCASH</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-hp-accent-amber/20 pb-1">
                     <span className="text-hp-text-muted">Weekly:</span>
                     <span className="text-lg font-display text-hp-text-primary">{(nextHcashDay * 7).toFixed(1)} hCASH</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-hp-accent-amber/20 pb-1">
                     <span className="text-hp-text-muted">Monthly:</span>
                     <span className="text-lg font-display text-hp-text-primary">{(nextHcashDay * 30).toFixed(1)} hCASH</span>
                   </div>
                   <div className="flex justify-between items-end pt-2">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm p-6 hover:border-hp-accent-amber transition-colors flex flex-col">
            <h4 className="font-display font-bold text-xl mb-2 text-hp-text-primary text-center">⚡ COMPOUND NOW</h4>
            <p className="text-base font-mono text-hp-text-muted text-center mb-6 flex-1">Buy more miners before halving to offset income drop. Accumulate hashrate aggressively while yields are high.</p>
            <button className="w-full border border-hp-accent-amber text-hp-accent-amber hover:bg-hp-accent-amber hover:text-black py-3 text-sm font-mono font-bold tracking-widest rounded-sm transition-all focus:outline-none">
              CALCULATE TARGET
            </button>
          </div>
          <div className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm p-6 hover:border-hp-accent-green transition-colors flex flex-col">
            <h4 className="font-display font-bold text-xl mb-2 text-hp-text-primary text-center">🏦 ACCUMULATE hCASH</h4>
            <p className="text-base font-mono text-hp-text-muted text-center mb-6 flex-1">Delay taking USD profits. Stockpile hCASH right now before emission cuts artificially restrict supply growth.</p>
            <button className="w-full border border-hp-accent-green text-hp-accent-green hover:bg-hp-accent-green hover:text-black py-3 text-sm font-mono font-bold tracking-widest rounded-sm transition-all focus:outline-none">
              CALCULATE TARGET
            </button>
          </div>
          <div className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm p-6 hover:border-[#00D4FF] transition-colors flex flex-col">
            <h4 className="font-display font-bold text-xl mb-2 text-hp-text-primary text-center">⬆️ UPGRADE FACILITY</h4>
            <p className="text-base font-mono text-hp-text-muted text-center mb-6 flex-1">Higher tier = more miner capacity. Prep your infrastructure to support the raw hashrate needed post-halving.</p>
            <button className="w-full border border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-black py-3 text-sm font-mono font-bold tracking-widest rounded-sm transition-all focus:outline-none">
              VIEW UPGRADES
            </button>
          </div>
        </div>
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
