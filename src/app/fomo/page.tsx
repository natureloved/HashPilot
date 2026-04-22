"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  History,
  Lock,
  Unlock,
  AlertTriangle,
  Lightbulb,
  FileText,
  Bot
} from "lucide-react";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";

const TIERS = ["STARTER", "STANDARD", "ADVANCED", "ELITE"];

export default function FomoPage() {
  // SECTION 1: REALITY
  const [dailyHcash, setDailyHcash] = useState("25.5");
  const [daysMining, setDaysMining] = useState("45");
  const [tier, setTier] = useState("STANDARD");
  const [hCashPrice, setHCashPrice] = useState("4.50");
  const [totalEarned, setTotalEarned] = useState("1147");
  const [isLocked, setIsLocked] = useState(false);

  // SECTION 2: SCENARIOS
  const [earlyDays, setEarlyDays] = useState(30); // 7 to 180
  const [upgradeTier, setUpgradeTier] = useState("ADVANCED");
  const [upgradeDays, setUpgradeDays] = useState(30);
  const [surgeClaims, setSurgeClaims] = useState(4);

  // SECTION 4: AI
  const [story, setStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // --- MATH ---
  const baseline = useMemo(() => ({
    daily: parseFloat(dailyHcash) || 0,
    days: parseFloat(daysMining) || 0,
    price: parseFloat(hCashPrice) || 0,
    total: parseFloat(totalEarned) || 0,
    totalUsd: (parseFloat(totalEarned) || 0) * (parseFloat(hCashPrice) || 0)
  }), [dailyHcash, daysMining, hCashPrice, totalEarned]);

  const earlyBird = useMemo(() => {
    // Current daily * extra days (simpler for MVP, could use growth curves)
    const extraHcash = baseline.daily * earlyDays;
    const extraUsd = extraHcash * baseline.price;
    return { delta: extraHcash, deltaUsd: extraUsd };
  }, [baseline, earlyDays]);

  const upgradePath = useMemo(() => {
    // Assume each tier adds 2.5x the previous tier's capacity/hashrate approx for sim
    const tierIndex = TIERS.indexOf(tier);
    const targetIndex = TIERS.indexOf(upgradeTier);
    const boostFactor = Math.max(0, targetIndex - tierIndex) * 0.4; // 40% boost per tier jump
    const extraDaily = baseline.daily * boostFactor;
    const deltaHcash = extraDaily * upgradeDays;
    const deltaUsd = deltaHcash * baseline.price;
    return { delta: deltaHcash, deltaUsd: deltaUsd };
  }, [baseline, tier, upgradeTier, upgradeDays]);

  const claimMaster = useMemo(() => {
    // Assume average claim was 100 hCASH. Surge fee 15%, Normal 2%.
    const wastePerClaim = 100 * 0.13; // 13 hCASH wasted per surge claim
    const deltaHcash = surgeClaims * wastePerClaim;
    const deltaUsd = deltaHcash * baseline.price;
    return { delta: deltaHcash, deltaUsd: deltaUsd };
  }, [baseline, surgeClaims]);

  const opportunityCost = useMemo(() => {
    const dailyLoss = baseline.daily * 0.4; // Cost of not being one tier higher
    const monthlyLossHcash = dailyLoss * 30;
    const monthlyLossUsd = monthlyLossHcash * baseline.price;
    return { dailyLoss, hCash: monthlyLossHcash, usd: monthlyLossUsd };
  }, [baseline]);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setStory(null);
    try {
      const response = await fetch('/api/fomo-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actual: { daysMining: baseline.days, totalHCash: baseline.total, totalUsd: baseline.totalUsd, tier },
          scenarios: {
            earlyBird: { delta: earlyBird.delta.toFixed(0), deltaUsd: earlyBird.deltaUsd.toFixed(0) },
            upgradePath: { delta: upgradePath.delta.toFixed(0), deltaUsd: upgradePath.deltaUsd.toFixed(0) },
            claimMaster: { delta: claimMaster.delta.toFixed(0), deltaUsd: claimMaster.deltaUsd.toFixed(0) }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setStory(data.story);
    } catch (err) {
      console.error("FOMO API Failure:", err);
      setStory("SYSTEM ERROR: The HashPilot narrative engine could not be reached. \n\nANALYSIS: This usually indicates an authentication failure with the protocol core (Anthropic API Key). \n\nACTION: Verify credentials in .env.local and ensure the station is fully synced.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    const url = await toPng(cardRef.current, { pixelRatio: 2 });
    const l = document.createElement('a');
    l.download = `fomo-report-${Date.now()}.png`;
    l.href = url;
    l.click();
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* HEADER */}
        <header className="mb-12 border-b border-hp-border pb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="text-hp-accent-amber" size={24} />
            <h1 className="font-display text-4xl font-bold tracking-tighter text-white uppercase">
              THE FOMO <span className="text-hp-accent-amber">MACHINE</span>
            </h1>
          </div>
          <p className="font-mono text-sm text-hp-accent-amber/60 tracking-[0.2em] uppercase">
            What could have been. What still can be.
          </p>
        </header>

        {/* SECTION 1: REALITY */}
        <section className={cn(
          "transition-all duration-500 mb-12 relative overflow-hidden",
          isLocked ? "h-16" : "bg-hp-surface border border-hp-border p-8 rounded-sm"
        )}>
          {!isLocked ? (
            <div className="space-y-8">
              <h3 className="font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <Lock size={12} /> ESTABLISH CURRENT REALITY
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                <InputGroup label="DAILY hCASH" value={dailyHcash} onChange={setDailyHcash} />
                <InputGroup label="DAYS MINING" value={daysMining} onChange={setDaysMining} />
                <InputGroup label="TOTAL EARNED" value={totalEarned} onChange={setTotalEarned} />
                <InputGroup label="hCASH PRICE ($)" value={hCashPrice} onChange={setHCashPrice} />
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-hp-text-muted uppercase tracking-widest">FACILITY TIER</label>
                  <select 
                    value={tier} 
                    onChange={e => setTier(e.target.value)}
                    className="bg-black/40 border border-hp-border px-4 py-3 text-hp-text-primary font-mono text-base md:text-lg focus:border-hp-accent-amber outline-none cursor-pointer"
                  >
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setIsLocked(true)}
                className="w-full bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-black py-4 rounded-sm transition-all tracking-widest uppercase shadow-[0_0_20px_rgba(245,166,35,0.2)]"
              >
                LOCK IN REALITY
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 bg-hp-surface/90 backdrop-blur-md border-b border-hp-border flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 md:py-0 gap-4 overflow-y-auto">
              <div className="flex flex-wrap gap-4 md:gap-8 items-center justify-center md:justify-start">
                <span className="font-mono text-hp-accent-amber text-[9px] md:text-[10px] tracking-[0.2em] font-bold uppercase shrink-0">REALITY LOCKED //</span>
                <div className="flex gap-4 sm:gap-6">
                  <StatusItem label="EARNED" val={`${baseline.total} hCASH`} />
                  <StatusItem label="VALUE" val={`$${baseline.totalUsd.toFixed(0)}`} />
                  <StatusItem label="DAYS" val={baseline.days} />
                </div>
              </div>
              <button 
                onClick={() => setIsLocked(false)}
                className="text-hp-text-muted hover:text-hp-accent-amber flex items-center gap-2 font-mono text-[9px] md:text-[10px] uppercase transition-colors shrink-0"
              >
                <Unlock size={12} /> Unlock to Edit
              </button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* SECTION 2: SCENARIOS (8 Cols) */}
          <div className={cn("xl:col-span-8 space-y-8", !isLocked && "opacity-20 pointer-events-none grayscale")}>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              
              {/* SCENARIO 1: EARLY BIRD */}
              <ScenarioCard 
                title="THE EARLY BIRD"
                hypothetical={`WHAT IF you had started mining earlier?`}
                deltaHcash={earlyBird.delta}
                deltaUsd={earlyBird.deltaUsd}
                narrative={earlyBird.delta > 500 
                  ? `That's ${Math.floor(earlyBird.delta / 100)} more miners you could have bought by now.` 
                  : "Every day at the start counted for more."}
              >
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-[10px] font-mono text-hp-text-muted uppercase">
                    <span>Backdated Days</span>
                    <span className="text-hp-accent-amber">{earlyDays}d Earlier</span>
                  </div>
                  <input 
                    type="range" min="7" max="180" 
                    value={earlyDays} 
                    onChange={e => setEarlyDays(parseInt(e.target.value))}
                    className="w-full h-1 bg-hp-border rounded-lg appearance-none cursor-pointer accent-hp-accent-amber"
                  />
                </div>
              </ScenarioCard>

              {/* SCENARIO 2: UPGRADE PATH */}
              <ScenarioCard 
                title="THE UPGRADE PATH"
                hypothetical={`WHAT IF you had upgraded your facility sooner?`}
                deltaHcash={upgradePath.delta}
                deltaUsd={upgradePath.deltaUsd}
                narrative={upgradePath.delta > 0 
                  ? "Upgrading sooner would have paid for itself over time." 
                  : "Waiting for 'perfection' has a daily cost."}
              >
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[8px] font-mono text-hp-text-muted uppercase">Target Tier</label>
                    <select 
                      value={upgradeTier} 
                      onChange={e => setUpgradeTier(e.target.value)}
                      className="bg-black/40 border border-hp-border px-3 py-1 text-hp-text-primary font-mono text-xs outline-none"
                    >
                      {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <label className="text-[8px] font-mono text-hp-text-muted uppercase">Days Ago</label>
                    <input 
                      type="number" value={upgradeDays} 
                      onChange={e => setUpgradeDays(parseInt(e.target.value))}
                      className="bg-black/40 border border-hp-border px-3 py-1 text-hp-text-primary font-mono text-xs text-right outline-none"
                    />
                  </div>
                </div>
              </ScenarioCard>

              {/* SCENARIO 3: CLAIM MASTER */}
              <ScenarioCard 
                title="THE CLAIM MASTER"
                hypothetical="WHAT IF you had never claimed during surge?"
                deltaHcash={claimMaster.delta}
                deltaUsd={claimMaster.deltaUsd}
                narrative={`That's ${Math.floor(claimMaster.delta / 13)} potential USB Nanos paid in unnecessary fees.`}
              >
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-[10px] font-mono text-hp-text-muted uppercase">
                    <span>Surge Claims Made</span>
                    <span className="text-hp-accent-amber">{surgeClaims} Claims</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" 
                    value={surgeClaims} 
                    onChange={e => setSurgeClaims(parseInt(e.target.value))}
                    className="w-full h-1 bg-hp-border rounded-lg appearance-none cursor-pointer accent-hp-accent-amber"
                  />
                  <div className="h-12 flex justify-center items-end gap-1 overflow-hidden opacity-20">
                     {Array.from({ length: 20 }).map((_, i) => (
                       <div key={i} className="w-2 bg-hp-accent-red" style={{ height: `${Math.random() * 100}%` }} />
                     ))}
                  </div>
                </div>
              </ScenarioCard>

              {/* CUSTOM BUILDER MOCK */}
              <div className="bg-hp-surface/40 border border-hp-border border-dashed p-8 rounded-sm flex flex-col items-center justify-center text-center opacity-60">
                 <Lock className="text-hp-text-muted mb-4" size={24} />
                 <h4 className="font-display text-sm font-bold text-white mb-2 uppercase">Custom What-If Builder</h4>
                 <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-widest leading-relaxed">
                   Logic expansion in progress.<br/>Construct custom counterfactuals soon.
                 </p>
              </div>
            </div>

            {/* AI NARRATIVE */}
            <section className="space-y-6">
               {!story ? (
                 <button
                   onClick={handleGenerateStory}
                   disabled={isGenerating || !isLocked}
                   className="w-full group bg-hp-surface border-2 border-hp-accent-amber/30 hover:border-hp-accent-amber p-8 rounded-sm transition-all flex flex-col items-center gap-4 group"
                 >
                   <Bot className="text-hp-accent-amber group-hover:scale-110 transition-transform" size={40} />
                   <div className="text-center">
                     <span className="font-display text-xl text-white block mb-1">GET MY MINING MISSION DEBRIEF</span>
                     <span className="font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.2em]">HashPilot AI Counterfactual Analysis</span>
                   </div>
                 </button>
               ) : (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-hp-surface border-2 border-hp-accent-amber p-10 rounded-sm relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                      <FileText size={200} />
                    </div>
                    <h3 className="font-mono text-hp-accent-amber text-xs tracking-[0.4em] uppercase mb-10 flex items-center gap-3">
                      <FileText size={16} /> MISSION DEBRIEF ANALYSIS
                    </h3>
                    <div className="space-y-8 font-mono text-sm leading-loose text-hp-text-primary italic whitespace-pre-wrap">
                      {story}
                    </div>
                    <div className="mt-12 pt-6 border-t border-hp-border flex justify-between items-center text-[9px] font-mono text-hp-text-muted uppercase">
                      <span>Verified Terminal Output // Claude 3.5</span>
                      <span>STATION_LOG_ID: {Math.random().toString(36).slice(2, 9).toUpperCase()}</span>
                    </div>
                 </motion.div>
               )}
            </section>
          </div>

          {/* SECTION 4: OPPORTUNITY COST (4 Cols) */}
          <div className="xl:col-span-4 space-y-8">
            <motion.div 
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              className="bg-hp-accent-red/5 border-2 border-hp-accent-red p-8 rounded-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-hp-accent-red text-white py-1 px-4 font-black font-mono text-[10px] tracking-tighter shadow-lg">
                URGENT RADAR
              </div>
              <h3 className="font-display text-xl text-hp-accent-red font-black tracking-tight mb-6 flex items-center gap-3 uppercase">
                <AlertTriangle size={24} /> THE COST OF WAITING
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-hp-accent-red/20 pb-4">
                  <span className="font-mono text-[10px] text-hp-text-secondary uppercase">Next 30 Days Loss</span>
                  <div className="text-right">
                    <span className="font-display text-2xl text-hp-accent-red block">-{opportunityCost.hCash.toFixed(0)} hCASH</span>
                    <span className="font-mono text-xs text-hp-text-muted">valued at ${opportunityCost.usd.toFixed(0)}</span>
                  </div>
                </div>

                <div className="bg-hp-surface/60 p-4 rounded-sm space-y-3">
                   <p className="text-xs font-mono text-hp-text-primary leading-relaxed opacity-80">
                     &quot;Every day you continue at your current tier without optimizing hashrate, you&apos;re forfeiting <span className="text-hp-accent-red font-bold">{opportunityCost.dailyLoss.toFixed(1)} hCASH</span> to more aggressive operators.&quot;
                   </p>
                   <div className="flex items-center gap-2 text-hp-accent-amber font-mono text-[10px] uppercase font-bold">
                     <Lightbulb size={12} /> Upgrade pays for itself in ~12 days
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-hp-accent-red/20 text-[9px] font-mono text-hp-text-muted italic leading-relaxed">
                ADVISORY: Counterfactual modeling is an educational tool. Mining conditions fluctuate based on protocol variables.
              </div>
            </motion.div>

            {/* SHARE ACTION */}
            <div className="bg-hp-surface border border-hp-border p-6 rounded-sm text-center">
               <h4 className="font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.2em] mb-6">Generated Share Card</h4>
               <div className="aspect-[1.91/1] bg-[#080303] border-4 border-hp-accent-red/20 rounded-sm mb-6 overflow-hidden relative group" ref={cardRef}>
                  {/* GLITCH EFFECTS */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1)_0%,transparent_70%)]" />
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-hp-accent-red/30 animate-[scan_3s_linear_infinite]" />
                  
                  <div className="p-10 h-full flex flex-col justify-between items-start text-left relative z-10">
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-mono text-[9px] text-hp-accent-red tracking-[0.5em] uppercase font-black">REALITY DISTORTION DETECTED</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-hp-accent-red" />
                          <div className="w-1 h-3 bg-hp-accent-red opacity-50" />
                          <div className="w-1 h-3 bg-hp-accent-red opacity-20" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h2 className="font-display text-5xl font-black text-hp-accent-red leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.4)]">
                          +{earlyBird.delta.toFixed(0)} hCASH
                        </h2>
                        <p className="font-mono text-[10px] text-white/90 uppercase tracking-[0.2em] font-medium pt-2">
                          LOST TO THE TIME STREAM — STARTING {earlyDays} DAYS EARLIER
                        </p>
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-end border-t border-white/10 pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className="font-mono text-[7px] text-hp-text-muted uppercase tracking-widest">ACTUAL REALITY</span>
                           <span className="font-display text-2xl text-white font-bold">{baseline.total} hCASH</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <div className="flex flex-col">
                           <span className="font-mono text-[7px] text-hp-text-muted uppercase tracking-widest">EST. VALUE</span>
                           <span className="font-display text-2xl text-hp-accent-amber font-bold">${baseline.totalUsd.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[8px] text-hp-accent-red uppercase font-black tracking-widest animate-pulse">⬡ CRITICAL OPPORTUNITY LOSS</span>
                      </div>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={handleExport}
                 className="w-full bg-white hover:bg-gray-200 text-black font-display font-bold py-3 rounded-sm flex items-center justify-center gap-2 transition-all uppercase text-xs"
               >
                 <Download size={18} /> DOWNLOAD PNG
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-mono text-hp-text-muted uppercase tracking-widest">{label}</label>
      <input 
        type="number" value={value} 
        onChange={e => onChange(e.target.value)}
        className="bg-black/40 border border-hp-border px-4 py-3 text-hp-text-primary font-mono text-lg focus:border-hp-accent-amber outline-none"
      />
    </div>
  );
}

function StatusItem({ label, val }: { label: string; val: string | number }) {
  return (
    <div className="flex flex-col">
       <span className="font-mono text-[8px] text-hp-text-muted uppercase tracking-wider">{label}</span>
       <span className="font-mono text-xs text-white font-bold tracking-tight">{val}</span>
    </div>
  );
}

function ScenarioCard({ title, hypothetical, deltaHcash, deltaUsd, narrative, children }: { 
  title: string; 
  hypothetical: string; 
  deltaHcash: number; 
  deltaUsd: number; 
  narrative: string; 
  children: React.ReactNode 
}) {
  return (
    <div className="bg-[#0A0A0B] border border-hp-border/50 p-8 rounded-sm hover:border-hp-accent-red/50 transition-all flex flex-col relative group overflow-hidden">
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_40px] pointer-events-none" />
      
      <div className="absolute top-5 right-5 flex gap-1">
        <div className="w-1 h-3 bg-hp-accent-red animate-pulse" />
        <div className="w-1 h-3 bg-hp-accent-red/40" />
      </div>

      <h4 className="font-mono text-[10px] text-hp-accent-red uppercase tracking-[0.5em] mb-6 font-black flex items-center gap-2">
        <AlertTriangle size={12} className="text-hp-accent-red" /> {title}
      </h4>
      
      <p className="font-display text-xl text-white mb-8 uppercase tracking-tighter font-black leading-[1.1] max-w-[90%]">
        {hypothetical}
      </p>
      
      <div className="mb-6 bg-black/40 p-5 border-l-4 border-hp-accent-red/40 rounded-r-sm">
        <span className={cn("font-display text-5xl block tracking-tighter leading-none mb-2", deltaHcash >= 0 ? "text-hp-accent-green" : "text-hp-accent-red")}>
          {deltaHcash >= 0 ? "+" : ""}{deltaHcash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          <span className="text-xs ml-2 opacity-50 uppercase tracking-widest">hCASH</span>
        </span>
        <span className="font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.2em] font-bold">
           MISSING VALUE: ${deltaUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
        </span>
      </div>

      <p className="font-mono text-[11px] text-hp-text-secondary italic mb-6 leading-relaxed opacity-80">
        {narrative}
      </p>

      <div className="mt-auto">
        {children}
      </div>
    </div>
  );
}

