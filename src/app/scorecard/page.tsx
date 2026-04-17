"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, Share2, Info, CheckCircle2, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = ["STARTER", "STANDARD", "ADVANCED", "ELITE"];
const RATES = ["NORMAL", "ELEVATED", "SURGE"];

export default function ScorecardPage() {
  const [myHashrate, setMyHashrate] = useState("500");
  const [netHashrate, setNetHashrate] = useState("10000");
  const [tier, setTier] = useState("STANDARD");
  const [rate, setRate] = useState("NORMAL");
  const [daysSinceClaim, setDaysSinceClaim] = useState("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Score Calculations
  const scores = useMemo(() => {
    const mh = parseFloat(myHashrate) || 0;
    const nh = parseFloat(netHashrate) || 1;
    const days = parseFloat(daysSinceClaim) || 0;

    // 1. Network Position (0.1% share = 100 points, linear below)
    const share = (mh / nh) * 100;
    const networkScore = Math.min(Math.round((share / 0.1) * 100), 100);

    // 2. Facility Efficiency (Simulated based on Tier)
    const tierBonus = TIERS.indexOf(tier) * 20 + 40;
    const facilityScore = Math.min(tierBonus + (mh > 1000 ? 10 : 0), 100);

    // 3. Claim Timing (Optimal 5-10 days depending on rate)
    let claimScore = 100;
    if (days < 2) claimScore = 40; // Too frequent
    if (days > 14) claimScore = 60; // Too infrequent

    // 4. Rate Score
    const rateScore = rate === "NORMAL" ? 100 : rate === "ELEVATED" ? 60 : 20;

    // Weighted average
    const total = Math.round(
      networkScore * 0.3 + 
      facilityScore * 0.25 + 
      claimScore * 0.25 + 
      rateScore * 0.2
    );

    return { total, networkScore, facilityScore, claimScore, rateScore, share };
  }, [myHashrate, netHashrate, tier, rate, daysSinceClaim]);

  const rank = useMemo(() => {
    if (scores.total >= 85) return "ELITE OPERATOR";
    if (scores.total >= 60) return "FIELD AGENT";
    return "RECRUIT";
  }, [scores.total]);

  const scoreColor = 
    scores.total >= 71 ? "text-hp-accent-green" : 
    scores.total >= 41 ? "text-hp-accent-amber" : 
    "text-hp-accent-red";

  const scoreGlow = 
    scores.total >= 71 ? "drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" : 
    scores.total >= 41 ? "drop-shadow-[0_0_15px_rgba(245,166,35,0.5)]" : 
    "drop-shadow-[0_0_15px_rgba(255,59,59,0.5)]";

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `hashpilot-report-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    const text = `Just scored ${scores.total}/100 on HashPilot ⚡ Mining efficiency rated: ${rank}\nCheck your setup → https://hashpilot-taupe.vercel.app\n\n#HashCash #hCASH #Avalanche`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - scores.total / 100);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full pb-20">
      
      {/* HEADER & INPUTS */}
      <section className="bg-hp-surface border border-hp-border p-6 rounded-sm">
        <h2 className="font-sans font-bold tracking-widest text-hp-accent-amber mb-6 flex items-center gap-2 text-xs uppercase">
          <Calculator size={14} /> {"// CONFIGURATION INPUTS"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-hp-text-muted font-mono tracking-widest uppercase">MY HASHRATE (TH/s)</label>
            <input type="number" value={myHashrate} onChange={e => setMyHashrate(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-hp-accent-green outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-hp-text-muted font-mono tracking-widest uppercase">NETWORK HASHRATE (TH/s)</label>
            <input type="number" value={netHashrate} onChange={e => setNetHashrate(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-hp-accent-green outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-hp-text-muted font-mono tracking-widest uppercase">FACILITY TIER</label>
            <select value={tier} onChange={e => setTier(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-hp-accent-green outline-none appearance-none cursor-pointer">
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-hp-text-muted font-mono tracking-widest uppercase">CURRENT RATE</label>
            <select value={rate} onChange={e => setRate(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-hp-accent-green outline-none appearance-none cursor-pointer">
              {RATES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-hp-text-muted font-mono tracking-widest uppercase">DAYS SINCE CLAIM</label>
            <input type="number" value={daysSinceClaim} onChange={e => setDaysSinceClaim(e.target.value)} className="bg-[rgba(5,8,16,0.6)] border border-hp-border rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm focus:border-hp-accent-green outline-none" />
          </div>
        </div>
      </section>

      {/* SCORE CARD SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN GAUGE 60% */}
        <div className="lg:col-span-12 xl:col-span-7 bg-[rgba(13,20,36,0.8)] border border-hp-border rounded-sm p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 font-mono text-[#00D4FF10] text-9xl font-bold select-none pointer-events-none">CODE_88</div>
          
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-hp-border" />
              <motion.circle 
                cx="50%" cy="50%" r="45%" 
                stroke="currentColor" strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn("transition-colors duration-500", scoreColor.replace('text-', 'stroke-'))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={scores.total}
                className={cn("font-display text-7xl md:text-8xl font-bold", scoreColor, scoreGlow)}
              >
                {scores.total}
              </motion.span>
              <span className="font-mono text-xs text-hp-text-muted tracking-widest uppercase mt-2">EFFICIENCY SCORE</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-10 text-center"
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold text-hp-text-primary tracking-widest">{rank}</h3>
            <div className="mt-2 h-1 w-20 bg-hp-accent-amber mx-auto rounded-full" />
          </motion.div>

          {/* SUB-SCORES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 w-full">
            {[
              { label: "NETWORK POSITION", val: scores.networkScore, sub: `${scores.share.toFixed(3)}%` },
              { label: "FACILITY EFFICIENCY", val: scores.facilityScore, sub: tier },
              { label: "CLAIM TIMING", val: scores.claimScore, sub: `${daysSinceClaim}d ago` },
              { label: "SETUP OPTIM.", val: scores.rateScore, sub: rate }
            ].map((sub, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-2">
                   <svg className="w-full h-full -rotate-90">
                     <circle cx="50%" cy="50%" r="42%" stroke="#1E2D4A" strokeWidth="4" fill="transparent" />
                     <motion.circle 
                       cx="50%" cy="50%" r="42%" 
                       stroke={sub.val >= 70 ? "#39FF14" : sub.val >= 40 ? "#F5A623" : "#FF3B3B"} 
                       strokeWidth="4" 
                       fill="transparent" 
                       strokeDasharray={2 * Math.PI * 21}
                       initial={{ strokeDashoffset: 2 * Math.PI * 21 }}
                       animate={{ strokeDashoffset: (2 * Math.PI * 21) * (1 - sub.val / 100) }}
                       transition={{ duration: 1, delay: 1 + i*0.1 }}
                       strokeLinecap="round"
                     />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-hp-text-primary">{sub.val}</div>
                </div>
                <span className="text-[8px] font-mono tracking-widest text-hp-text-muted text-center uppercase leading-tight">{sub.label}</span>
                <span className="text-[10px] font-mono text-hp-text-secondary mt-1">{sub.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMPROVEMENT TIPS & REPORT PREVIEW 40% */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
           <div className="bg-hp-surface border border-hp-border rounded-sm p-6 flex-1">
             <h3 className="font-sans font-bold tracking-widest text-[#00D4FF] mb-4 flex items-center gap-2 text-xs uppercase">
               <Info size={14} /> {"// IMPROVEMENT RECOMMENDATIONS"}
             </h3>
             <div className="space-y-4">
                {scores.rateScore < 100 && (
                  <div className="flex gap-3 items-start border-l-2 border-hp-accent-red bg-hp-accent-red/5 p-3 rounded-sm">
                    <AlertCircle className="text-hp-accent-red shrink-0" size={16} />
                    <p className="text-xs font-mono text-hp-text-primary leading-relaxed">
                      RATE ALERT: Current surge window detected. Wait for &quot;NORMAL&quot; cycle to reclaim ~{scores.rateScore === 20 ? "80%" : "40%"} of efficiency points.
                    </p>
                  </div>
                )}
                {scores.networkScore < 60 && (
                  <div className="flex gap-3 items-start border-l-2 border-hp-accent-amber bg-hp-accent-amber/5 p-3 rounded-sm">
                    <Calculator className="text-hp-accent-amber shrink-0" size={16} />
                    <p className="text-xs font-mono text-hp-text-primary leading-relaxed">
                      DILUTION WARNING: Your network share is below 0.1%. Consider compounding hCASH yields into &quot;MID-TIER&quot; miners to stabilize position.
                    </p>
                  </div>
                )}
                {scores.claimScore < 70 && (
                  <div className="flex gap-3 items-start border-l-2 border-[#00D4FF] bg-[#00D4FF]/5 p-3 rounded-sm">
                    <Info className="text-[#00D4FF] shrink-0" size={16} />
                    <p className="text-xs font-mono text-hp-text-primary leading-relaxed">
                      STRATEGY TIP: Your claim interval ({daysSinceClaim}d) is suboptimal. Targeting 7-10 day windows during Normal rates maximizes ROI.
                    </p>
                  </div>
                )}
                {scores.total > 80 && (
                  <div className="flex gap-3 items-start border-l-2 border-hp-accent-green bg-hp-accent-green/5 p-3 rounded-sm">
                    <CheckCircle2 className="text-hp-accent-green shrink-0" size={16} />
                    <p className="text-xs font-mono text-hp-text-primary leading-relaxed">
                      ELITE STATUS: Your parameters are optimized. Maintain current hashrate lock to preserve dominance.
                    </p>
                  </div>
                )}
             </div>
           </div>

           <div className="bg-hp-surface border border-hp-border rounded-sm p-6">
              <h3 className="font-sans font-bold tracking-widest text-hp-text-muted mb-4 flex items-center gap-2 text-xs uppercase">
                REPORT GENERATOR
              </h3>
              <div className="aspect-[1.91/1] bg-black border border-hp-border rounded-sm overflow-hidden mb-4 p-1 scale-[1] origin-top">
                {/* Scale preview */}
                <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '1200px', height: '630px' }}>
                  <ReportCardView scores={scores} rank={rank} hashrate={myHashrate} tier={tier} />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1 bg-hp-accent-amber hover:bg-amber-400 text-black font-display font-bold py-3 rounded-sm text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download size={16} /> {isGenerating ? "GENERATING..." : "DOWNLOAD PNG"}
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-white hover:bg-gray-200 text-black p-3 rounded-sm transition-all"
                >
                  <Share2 size={16} />
                </button>
              </div>
           </div>
        </div>
      </section>

      {/* HIDDEN TEMPLATE FOR CAPTURE */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={reportRef} style={{ width: '1200px', height: '630px' }}>
          <ReportCardView scores={scores} rank={rank} hashrate={myHashrate} tier={tier} />
        </div>
      </div>
    </div>
  );
}

function ReportCardView({ scores, rank, hashrate, tier }: { scores: { total: number; share: number }; rank: string; hashrate: string; tier: string }) {
  const color = scores.total >= 71 ? "#39FF14" : scores.total >= 41 ? "#F5A623" : "#FF3B3B";
  return (
    <div className="w-full h-full bg-[#050810] flex flex-col p-12 relative overflow-hidden text-white font-sans border-[12px] border-[#0D1424]">
      {/* Grid lines overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#F5A623 1px, transparent 1px), linear-gradient(90deg, #F5A623 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Corner Brackets */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-hp-accent-amber" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-hp-accent-amber" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-hp-accent-amber" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-hp-accent-amber" />

      <div className="relative z-10 flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-hp-accent-amber tracking-tighter">HASHPILOT</h1>
          <p className="font-mono text-sm tracking-[0.3em] opacity-60">{"// MINING REPORT"}</p>
        </div>
        <div className="text-right font-mono text-sm opacity-60">
          DATE: {new Date().toLocaleDateString()}<br/>
          STATION: RIG-ASM-V2-09
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <h2 className="font-mono text-sm uppercase tracking-[0.5em] text-hp-text-muted mb-4 text-center">OVERALL EFFICIENCY</h2>
        <div className="font-display font-bold leading-none mb-4" style={{ fontSize: '180px', color, filter: `drop-shadow(0 0 30px ${color}66)` }}>
          {scores.total}
        </div>
        <h3 className="font-display text-4xl font-bold tracking-widest text-[#E8EDF5]">{rank}</h3>
        <div className="w-32 h-1 bg-hp-accent-amber mt-6 opacity-80" />
      </div>

      <div className="grid grid-cols-4 gap-6 mt-12 relative z-10">
        {[
          { label: "HASHRATE SHARE", val: `${scores.share.toFixed(3)}%` },
          { label: "EST. DAILY", val: `${(parseFloat(hashrate)*0.03).toFixed(1)} hCASH` },
          { label: "FACILITY TIER", val: tier },
          { label: "STATION RATING", val: scores.total > 50 ? "OPTIMAL" : "CRITICAL" }
        ].map((m, i) => (
          <div key={i} className="bg-[#1A2035]/60 border border-[#1E2D4A] p-4 rounded-sm flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-widest opacity-40 mb-2 uppercase">{m.label}</span>
            <span className="font-display text-xl font-bold text-[#39FF14]">{m.val}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-30">
        <span className="font-mono text-[10px] uppercase tracking-widest">hashpilot-taupe.vercel.app</span>
        <div className="w-1 h-1 bg-white rounded-full" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-hp-accent-amber">POWERED BY CLAUDE 3.5</span>
      </div>
    </div>
  );
}

function AlertCircle(props: { className?: string; size?: number }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
