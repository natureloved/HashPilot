"use client";

import { useState, useMemo } from "react";
import { MINERS, Miner } from "@/lib/miners";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LayoutGrid, List } from "lucide-react";

type SortOption = "Price ↑" | "Price ↓" | "Hashrate ↑" | "Efficiency ↑" | "Payback ↑";
type ViewMode = "CARD" | "TABLE";

export default function MinerComparePage() {
  const [tierFilter, setTierFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("Price ↑");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("CARD");
  const [selectedMiners, setSelectedMiners] = useState<number[]>([]);

  // Optimizer States
  const [optBudget, setOptBudget] = useState("1000");
  const [optPower, setOptPower] = useState("1000");

  const bFilter = parseFloat(budgetFilter);

  const filteredMiners = useMemo(() => {
    let m = [...MINERS];
    if (tierFilter !== "ALL") {
      m = m.filter(x => x.tier.toUpperCase() === tierFilter);
    }
    if (!isNaN(bFilter) && bFilter > 0) {
      m = m.filter(x => x.priceHCASH <= bFilter);
    }
    m.sort((a, b) => {
      if (sortBy === "Price ↑") return a.priceHCASH - b.priceHCASH;
      if (sortBy === "Price ↓") return b.priceHCASH - a.priceHCASH;
      if (sortBy === "Hashrate ↑") return b.hashrate - a.hashrate;
      if (sortBy === "Efficiency ↑") return b.efficiency - a.efficiency;
      if (sortBy === "Payback ↑") return a.paybackDays - b.paybackDays;
      return 0;
    });
    return m;
  }, [tierFilter, sortBy, bFilter]);

  const handleSelect = (id: number) => {
    setSelectedMiners(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getTierColor = (t: string) => {
    if (t === "Entry") return "bg-hp-accent-blue/20 text-[#00D4FF] border-[#00D4FF]";
    if (t === "Mid") return "bg-hp-accent-green/20 text-hp-accent-green border-hp-accent-green";
    if (t === "Pro") return "bg-hp-accent-amber/20 text-hp-accent-amber border-hp-accent-amber";
    return "bg-hp-accent-red/20 text-hp-accent-red border-hp-accent-red";
  };

  // Optimizer Algorithm
  const optimizedCart = useMemo(() => {
    const budget = parseFloat(optBudget) || 0;
    const powerLim = parseFloat(optPower) || 0;
    if (budget <= 0 || powerLim <= 0) return { items: [], totalCost: 0, totalHash: 0, totalPower: 0 };

    // Greedy: Sort by hashrate per price (descending) as primary metric
    const sorted = [...MINERS].sort((a, b) => b.hashrate/a.priceHCASH - a.hashrate/b.priceHCASH);
    
    const items: { miner: Miner, count: number }[] = [];
    let remCost = budget;
    let remPower = powerLim;
    let totalHash = 0;

    for (const m of sorted) {
      // Find max count we can buy of this miner without breaking either limit
      const maxByCost = Math.floor(remCost / m.priceHCASH);
      const maxByPower = Math.floor(remPower / m.power);
      const count = Math.min(maxByCost, maxByPower);

      if (count > 0) {
        items.push({ miner: m, count });
        remCost -= count * m.priceHCASH;
        remPower -= count * m.power;
        totalHash += count * m.hashrate;
      }
    }

    return {
      items,
      totalCost: budget - remCost,
      totalPower: powerLim - remPower,
      totalHash
    };
  }, [optBudget, optPower]);

  return (
    <div className={cn(
      "flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto h-full relative px-4 transition-all duration-300",
      selectedMiners.length >= 2 ? "pb-[450px] md:pb-[350px] lg:pb-80" : "pb-20"
    )}>
      
      {/* MAIN LEFT COLUMN */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        
        {/* TOP FILTER BAR */}
        <div className="bg-hp-background/95 backdrop-blur-sm border border-hp-border rounded-sm p-3 sticky top-0 z-40 shadow-xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 mb-2">
           
           <div className="flex bg-hp-surface border border-hp-border rounded-sm overflow-hidden h-9">
             {["ALL", "ENTRY", "MID", "PRO", "ELITE"].map(t => (
               <button 
                 key={t} 
                 onClick={() => setTierFilter(t)}
                 className={cn(
                   "px-3 py-1 text-[10px] font-mono tracking-widest transition-colors border-r border-hp-border last:border-0",
                   tierFilter === t ? "bg-hp-accent-amber text-black font-bold" : "text-hp-text-muted hover:text-hp-text-primary hover:bg-hp-surface-elevated"
                 )}
               >
                 {t}
               </button>
             ))}
           </div>

           <div className="flex items-center gap-3">
             <div className="flex flex-col">
               <label className="text-[9px] text-hp-text-muted font-mono tracking-widest mb-0.5">MAX BUDGET</label>
               <input 
                 type="number" 
                 value={budgetFilter} 
                 onChange={e => setBudgetFilter(e.target.value)} 
                 placeholder="No limit" 
                 className="bg-hp-surface border border-hp-border focus:border-hp-accent-green px-2 py-1 text-xs font-mono text-hp-text-primary rounded-sm w-24 outline-none" 
               />
             </div>
             
             <div className="flex flex-col">
               <label className="text-[9px] text-hp-text-muted font-mono tracking-widest mb-0.5">SORT BY</label>
               <select 
                 value={sortBy} 
                 onChange={(e) => setSortBy(e.target.value as SortOption)}
                 className="bg-hp-surface border border-hp-border px-2 py-1 text-xs font-mono text-hp-accent-blue rounded-sm outline-none appearance-none pr-5 max-w-[120px]"
               >
                 {["Price ↑", "Price ↓", "Hashrate ↑", "Efficiency ↑", "Payback ↑"].map(o => <option key={o} value={o}>{o}</option>)}
               </select>
             </div>
           </div>

           <div className="flex gap-1 bg-hp-surface border border-hp-border p-1 rounded-sm">
             <button onClick={() => setViewMode("TABLE")} className={cn("p-1.5 rounded-sm transition-colors", viewMode === "TABLE" ? "bg-hp-accent-amber text-black" : "text-hp-text-muted")}>
               <List size={16} />
             </button>
             <button onClick={() => setViewMode("CARD")} className={cn("p-1.5 rounded-sm transition-colors", viewMode === "CARD" ? "bg-hp-accent-amber text-black" : "text-hp-text-muted")}>
               <LayoutGrid size={16} />
             </button>
           </div>
        </div>

        {/* LISTINGS */}
        {viewMode === "CARD" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredMiners.map(m => {
                const effPercent = Math.min((m.efficiency / 0.15) * 100, 100);
                const isSelected = selectedMiners.includes(m.id);
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={m.id} 
                    className={cn(
                      "bg-[rgba(13,20,36,0.8)] border rounded-sm p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer",
                      isSelected ? "border-hp-accent-amber shadow-[0_0_15px_rgba(245,166,35,0.2)]" : "border-hp-border"
                    )}
                    onClick={() => handleSelect(m.id)}
                  >
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent top-0 left-[-100%] w-1/2 h-full transform skew-x-[-25deg] group-hover:animate-[scan_1s_ease-in-out] pointer-events-none" />
                    
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                       <span className="text-xs font-mono text-hp-text-muted">COMPARE</span>
                       <div className={cn("w-4 h-4 border flex items-center justify-center rounded-sm transition-colors", isSelected ? "bg-hp-accent-amber border-hp-accent-amber" : "border-hp-border bg-[#050810]")}>
                          {isSelected && <div className="w-2 h-2 bg-black" />}
                       </div>
                    </div>

                    <div className={cn("inline-block px-2 py-0.5 text-xs font-mono font-bold tracking-widest border rounded-sm mb-3", getTierColor(m.tier))}>{m.tier}</div>
                    
                    <h3 className="font-display text-xl text-hp-text-primary tracking-widest font-bold mb-4">{m.name}</h3>
                    
                    <div className="flex items-baseline gap-1 mb-4">
                       <span className="font-display text-4xl font-bold text-hp-accent-green drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">{m.hashrate}</span>
                       <span className="font-mono text-sm text-hp-text-secondary tracking-widest">MH/s</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 font-mono text-sm border-t border-b border-hp-border/50 py-3 mb-3">
                       <div><span className="block text-xs text-hp-text-muted mb-0.5">PRICE</span><span className="text-hp-text-primary font-bold">{m.priceHCASH} hCASH</span></div>
                       <div><span className="block text-xs text-hp-text-muted mb-0.5">POWER</span><span className="text-hp-text-primary">{m.power} W</span></div>
                       <div><span className="block text-xs text-hp-text-muted mb-0.5">EFFICIENCY</span><span className="text-[#00D4FF]">{m.efficiency.toFixed(3)}</span></div>
                       <div><span className="block text-xs text-hp-text-muted mb-0.5">PAYBACK</span><span className="text-hp-accent-amber">{Math.round(m.paybackDays)} days</span></div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs font-mono text-hp-text-muted mb-1">
                        <span>EFFICIENCY RATING</span>
                      </div>
                      <div className="w-full h-1 bg-[#050810] rounded-sm overflow-hidden">
                        <div 
                           className="h-full bg-gradient-to-r from-hp-accent-red via-hp-accent-amber to-hp-accent-green"
                           style={{ width: `${effPercent}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-hp-background border border-hp-border rounded-sm overflow-x-auto relative">
            <table className="w-full text-left font-mono text-xs whitespace-nowrap border-separate border-spacing-0">
              <thead className="bg-[#051124] text-[10px] text-hp-text-muted tracking-widest border-b border-hp-border sticky top-[60px] lg:top-[64px] z-10">
                <tr>
                  <th className="p-4 font-normal">COMPARE</th>
                  <th className="p-4 font-normal">MODEL</th>
                  <th className="p-4 font-normal">TIER</th>
                  <th className="p-4 font-normal">COST (hCASH)</th>
                  <th className="p-4 font-normal">HASHRATE (MH/s)</th>
                  <th className="p-4 font-normal">POWER (W)</th>
                  <th className="p-4 font-normal">EFFICIENCY</th>
                  <th className="p-4 font-normal">PAYBACK (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hp-border">
                {filteredMiners.map(m => {
                  const isSelected = selectedMiners.includes(m.id);
                  return (
                    <tr key={m.id} onClick={() => handleSelect(m.id)} className={cn("cursor-pointer transition-colors", isSelected ? "bg-hp-accent-amber/5" : "hover:bg-hp-surface-elevated")}>
                      <td className="p-4 border-r border-hp-border/30">
                        <div className={cn("w-4 h-4 border flex items-center justify-center rounded-sm ml-2", isSelected ? "bg-hp-accent-amber border-hp-accent-amber" : "border-hp-border bg-[#050810]")}>
                          {isSelected && <div className="w-2 h-2 bg-black" />}
                        </div>
                      </td>
                      <td className="p-4 text-hp-text-primary font-bold font-sans">{m.name}</td>
                      <td className="p-4"><span className={cn("px-3 py-1 text-xs tracking-widest border rounded-sm", getTierColor(m.tier))}>{m.tier}</span></td>
                      <td className="p-4 text-hp-text-primary">{m.priceHCASH}</td>
                      <td className="p-4 text-hp-accent-green font-bold">{m.hashrate}</td>
                      <td className="p-4 text-[#00D4FF]">{m.power}</td>
                      <td className="p-4">
                         <span className={m.efficiency > 0.05 ? "text-hp-accent-green" : m.efficiency > 0.02 ? "text-hp-accent-amber" : "text-hp-accent-red"}>
                           {m.efficiency.toFixed(3)}
                         </span>
                      </td>
                      <td className="p-4 text-hp-text-secondary">{Math.ceil(m.paybackDays)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SIDEBAR - BUDGET OPTIMIZER */}
      <div className="w-full lg:w-[280px] shrink-0">
        <div className="bg-[#050810] border border-hp-border rounded-sm sticky top-[72px] overflow-hidden shadow-lg">
          <div className="bg-[#0A0D18] p-3 border-b border-hp-border select-none">
            <h3 className="font-sans uppercase text-hp-text-primary text-sm tracking-widest font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00D4FF] block rounded-sm"></span>
              OPTIMIZER
            </h3>
          </div>
          
          <div className="p-4 space-y-3 font-mono text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-hp-text-muted tracking-widest uppercase">Budget (hCASH)</label>
              <input type="number" value={optBudget} onChange={e => setOptBudget(e.target.value)} className="bg-hp-surface border border-hp-border p-2 focus:border-[#00D4FF] text-hp-text-primary rounded-sm outline-none text-right font-bold text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-hp-text-muted tracking-widest uppercase">Power (Watts)</label>
              <input type="number" value={optPower} onChange={e => setOptPower(e.target.value)} className="bg-hp-surface border border-hp-border p-2 focus:border-[#00D4FF] text-hp-text-primary rounded-sm outline-none text-right font-bold text-sm" />
            </div>
          </div>

          <div className="p-4 border-t border-hp-border bg-hp-surface-elevated/30">
             <h4 className="font-sans text-[10px] tracking-widest font-bold text-hp-text-secondary mb-2 uppercase">Recommended</h4>
             {optimizedCart.items.length === 0 ? (
               <div className="text-hp-accent-red font-mono text-[10px] animate-pulse opacity-70">INSUFFICIENT RESOURCES</div>
             ) : (
               <div className="space-y-3">
                 <div className="space-y-1.5">
                   {optimizedCart.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center text-xs font-mono bg-[#050810] border border-hp-border p-2 rounded-sm">
                       <span className="text-hp-text-primary">{item.count}x {item.miner.name}</span>
                       <span className="text-hp-text-muted">{item.count * item.miner.priceHCASH}</span>
                     </div>
                   ))}
                 </div>
                 
                 <div className="pt-2 border-t border-hp-border border-dashed font-mono space-y-1">
                   <div className="flex justify-between text-[10px]">
                     <span className="text-hp-text-muted">Power Draw:</span>
                     <span className="text-[#00D4FF]">{optimizedCart.totalPower} W</span>
                   </div>
                   <div className="flex justify-between text-sm mt-1.5 items-end">
                     <span className="text-hp-text-muted text-[10px]">Net Hash:</span>
                     <span className="text-hp-accent-green font-bold">{optimizedCart.totalHash} MH/s</span>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* BOTTOM COMPARISON DRAWER */}
      <AnimatePresence>
        {selectedMiners.length >= 2 && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 w-full bg-[rgba(5,8,16,0.98)] backdrop-blur-xl border-t border-hp-border shadow-[0_-10px_60px_rgba(0,0,0,0.8)] z-[99] p-4 pb-10"
          >
            <div className="max-w-[1400px] mx-auto relative flex flex-col lg:flex-row gap-6">
              <button 
                onClick={() => setSelectedMiners([])}
                className="absolute -top-3 right-0 lg:-top-3 bg-hp-surface border border-hp-border text-hp-text-muted p-1 hover:text-white rounded-sm z-10"
              >
                <ChevronDown size={20} />
              </button>

              <div className="flex-[2] flex gap-4 overflow-x-auto pb-2">
                {selectedMiners.map(id => {
                  const m = MINERS.find(x => x.id === id)!;
                  return (
                    <div key={m.id} className="min-w-[250px] flex-1 bg-hp-surface border border-hp-border p-4 rounded-sm flex flex-col hover:border-hp-accent-amber/50 transition-colors">
                      <div className="flex justify-between items-start mb-3 border-b border-hp-border/30 pb-2">
                        <span className="font-display font-bold text-hp-text-primary tracking-widest text-sm uppercase">{m.name}</span>
                        <span className="text-[9px] font-mono font-bold text-hp-accent-amber bg-hp-accent-amber/10 px-2 py-0.5 rounded-sm border border-hp-accent-amber/20">{m.tier}</span>
                      </div>
                      <div className="space-y-2 font-mono text-xs mt-auto">
                        <div className="flex justify-between"><span className="text-hp-text-muted">Cost</span><span className="text-white font-bold">{m.priceHCASH} hCASH</span></div>
                        <div className="flex justify-between"><span className="text-hp-text-muted">Hash</span><span className="text-hp-accent-green font-bold">{m.hashrate} MH/s</span></div>
                        <div className="flex justify-between"><span className="text-hp-text-muted">Efficiency</span><span className="text-[#00D4FF]">{m.efficiency.toFixed(3)}</span></div>
                        <div className="flex justify-between border-t border-hp-border/30 pt-1 mt-1 font-bold">
                          <span className="text-hp-text-muted">Payback</span>
                          <span className="text-hp-accent-amber">{Math.round(m.paybackDays)} Days</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex-1 bg-hp-surface-elevated/50 border border-hp-accent-amber/50 rounded-sm p-5 font-mono text-sm flex flex-col justify-center">
                 <h4 className="text-hp-accent-amber font-bold mb-2">VERDICT ANALYSIS</h4>
                 <p className="text-hp-text-primary leading-relaxed">
                   Based on standard power ceilings, the <span className="text-hp-accent-green">most efficient</span> selection is the lowest power draw variant, but <span className="text-hp-accent-amber">highest gross yield</span> comes from the peak hashrate variant. Use the optimizer to align with your exact constraints.
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes scan {
          0% { left: -100%; opacity: 0; }
          50% { opacity: 1; }
          100% { left: 200%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
