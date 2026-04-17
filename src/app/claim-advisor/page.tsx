"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const RATES = ["NORMAL", "ELEVATED", "SURGE"];
const TIERS = ["STARTER", "STANDARD", "ADVANCED", "ELITE"];

export default function ClaimAdvisorPage() {
  const [rate, setRate] = useState("SURGE");
  const [unclaimed, setUnclaimed] = useState("450");
  const [tier, setTier] = useState("STANDARD");
  const [price, setPrice] = useState("14.20");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Math logic
  const unclaimedVal = parseFloat(unclaimed) || 0;
  const priceVal = parseFloat(price) || 0;
  
  const feePercent = rate === "NORMAL" ? 0.05 : rate === "ELEVATED" ? 0.10 : 0.20;
  const feeCost = unclaimedVal * feePercent;
  const netNow = unclaimedVal - feeCost;

  // Mocked 24h & 48h based on Tier tier
  const tierEarningRates: Record<string, number> = { "STARTER": 15, "STANDARD": 38.2, "ADVANCED": 120, "ELITE": 450 };
  const base24h = tierEarningRates[tier] || 38.2;
  const projected24h = base24h;
  const projected48h = base24h * 2;

  // Recommendations logic
  const statusConfig = {
    NORMAL: {
      label: "✅ CLAIM NOW",
      bg: "bg-[#0A2E1A] border-hp-accent-green shadow-[0_0_20px_rgba(57,255,20,0.3)] animate-glow-pulse",
      text: "text-hp-accent-green",
      desc: "ELECTRICITY RATES: NORMAL — Fees at minimum threshold",
      verdict: "Claiming now maximizes net retention.",
      recBadge: "RECOMMENDED",
    },
    ELEVATED: {
      label: "⚠️ PROCEED WITH CAUTION",
      bg: "bg-[#2E0B0A] border-hp-accent-red shadow-[0_0_20px_rgba(255,59,59,0.3)] animate-glow-pulse",
      text: "text-hp-accent-red",
      desc: "ELECTRICITY RATES: ELEVATED — Fees increased 10%+",
      verdict: "Claim only if immediate liquidity is required.",
      recBadge: "",
    },
    SURGE: {
      label: "⛔ HOLD POSITION",
      bg: "bg-[#2E1A0A] border-hp-accent-amber shadow-[0_0_20px_rgba(245,166,35,0.3)] animate-flicker",
      text: "text-hp-accent-amber",
      desc: "ELECTRICITY RATES: SURGE — Fees elevated 20%+",
      verdict: `Waiting 24H saves net hCASH`,
      recBadge: "",
    }
  };

  const activeConf = statusConfig[rate as keyof typeof statusConfig];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // cycle rate for demo
      const nextIdx = (RATES.indexOf(rate) + 1) % RATES.length;
      setRate(RATES[nextIdx]);
      setIsRefreshing(false);
    }, 600);
  };

  const inputClasses = "bg-[rgba(5,8,16,0.6)] border border-hp-border focus:border-hp-accent-green focus:outline-none rounded-sm px-3 py-2 text-hp-text-primary font-mono text-sm w-full";
  const labelClasses = "text-[10px] text-hp-text-muted font-mono tracking-widest block mb-1";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      {/* TOP SECTION */}
      <section className={cn(
        "relative rounded-sm border-2 overflow-hidden flex items-center justify-center min-h-[250px] p-8 text-center transition-colors duration-500",
        activeConf.bg
      )}>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className={cn("font-display text-5xl md:text-7xl font-bold tracking-wider mb-4 drop-shadow-lg", activeConf.text)}>
            {activeConf.label}
          </h1>
          <p className="font-mono text-hp-text-primary bg-black/40 px-4 py-2 rounded-sm border border-hp-border/50 text-sm md:text-base">
            {activeConf.desc}
          </p>
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-6 border border-hp-border bg-black/50 hover:bg-black text-hp-text-secondary font-mono text-xs px-4 py-2 rounded-sm transition-all"
          >
            {isRefreshing ? "SYNCING..." : "REFRESH STATUS"}
          </button>
        </div>
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none mix-blend-overlay"></div>
      </section>

      {/* USER INPUT PANEL */}
      <section className="bg-hp-surface border border-hp-border p-4 rounded-sm flex flex-wrap lg:flex-nowrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className={labelClasses}>CURRENT ELECTRICITY RATE</label>
          <div className="flex border border-hp-border rounded-sm overflow-hidden bg-[rgba(5,8,16,0.6)]">
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={cn(
                  "flex-1 py-2 text-[10px] font-mono tracking-widest transition-colors border-r border-hp-border last:border-0",
                  rate === r 
                    ? r === "NORMAL" ? "bg-hp-accent-green text-black font-bold" 
                      : r === "ELEVATED" ? "bg-hp-accent-red text-black font-bold"
                      : "bg-hp-accent-amber text-black font-bold"
                    : "text-hp-text-muted hover:bg-hp-surface-elevated hover:text-hp-text-primary"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        
        <div className="w-full sm:w-1/4 min-w-[150px]">
          <label className={labelClasses}>UNCLAIMED hCASH</label>
          <input type="number" value={unclaimed} onChange={(e) => setUnclaimed(e.target.value)} className={inputClasses} />
        </div>

        <div className="w-full sm:w-1/4 min-w-[150px]">
          <label className={labelClasses}>FACILITY TIER</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)} className={cn(inputClasses, "appearance-none cursor-pointer")}>
            {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="w-full sm:w-1/4 min-w-[150px]">
          <label className={labelClasses}>hCASH PRICE (USD)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClasses} />
        </div>
      </section>

      {/* BREAKDOWN SECTION */}
      <h3 className="font-sans uppercase text-hp-text-secondary text-sm tracking-widest font-semibold flex items-center gap-2 mt-2">
        <span className="w-2 h-2 bg-hp-accent-blue block rounded-sm animate-pulse"></span>
        COST ANALYSIS
      </h3>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CLAIM NOW */}
        <div className="bg-hp-surface border-t-4 border-t-hp-accent-green border-x border-b border-hp-border rounded-b-sm p-5 relative overflow-hidden">
          {rate === "NORMAL" && <span className="absolute top-2 right-2 bg-hp-accent-green text-black font-bold font-mono text-[8px] px-2 py-0.5 rounded-sm">RECOMMENDED</span>}
          <h4 className="font-display font-bold text-hp-text-primary tracking-widest mb-4">CLAIM NOW</h4>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Fee Amount ({feePercent*100}%):</span>
              <span className="text-hp-accent-red font-bold">-{feeCost.toFixed(1)} hCASH</span>
            </div>
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Net Received:</span>
              <span className="text-hp-accent-green font-bold">{netNow.toFixed(1)} hCASH</span>
            </div>
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">USD Value:</span>
              <span className="text-hp-text-primary">${(netNow * priceVal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* WAIT 24H */}
        <div className="bg-hp-surface border-t-4 border-t-hp-accent-amber border-x border-b border-hp-border rounded-b-sm p-5 relative overflow-hidden">
           {rate === "SURGE" && <span className="absolute top-2 right-2 bg-hp-accent-amber text-black font-bold font-mono text-[8px] px-2 py-0.5 rounded-sm">RECOMMENDED</span>}
          <h4 className="font-display font-bold text-hp-text-primary tracking-widest mb-4">WAIT 24H</h4>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Est. 24h Yield:</span>
              <span className="text-hp-text-primary">+{projected24h} hCASH</span>
            </div>
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Est. Subtotal:</span>
              <span className="text-hp-text-primary">{(unclaimedVal + projected24h).toFixed(1)} hCASH</span>
            </div>
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Est. Normal Fee (5%):</span>
              <span className="text-hp-accent-red font-bold">-{((unclaimedVal + projected24h)*0.05).toFixed(1)} hCASH</span>
            </div>
          </div>
        </div>

        {/* WAIT 48H */}
        <div className="bg-hp-surface border-t-4 border-t-hp-accent-blue border-x border-b border-hp-border rounded-b-sm p-5 relative overflow-hidden">
          {rate === "ELEVATED" && <span className="absolute top-2 right-2 bg-hp-accent-blue text-black font-bold font-mono text-[8px] px-2 py-0.5 rounded-sm relative">RECOMMENDED</span>}
          <h4 className="font-display font-bold text-hp-text-primary tracking-widest mb-4">WAIT 48H</h4>
          <div className="space-y-3 font-mono text-sm">
             <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Est. 48h Yield:</span>
              <span className="text-hp-text-primary">+{projected48h} hCASH</span>
            </div>
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Est. Subtotal:</span>
              <span className="text-hp-text-primary">{(unclaimedVal + projected48h).toFixed(1)} hCASH</span>
            </div>
            <div className="flex justify-between border-b border-hp-border/50 pb-1">
              <span className="text-hp-text-muted">Est. Normal Fee (5%):</span>
              <span className="text-hp-accent-red font-bold">-{((unclaimedVal + projected48h)*0.05).toFixed(1)} hCASH</span>
            </div>
          </div>
        </div>
      </section>

      {/* DECISION LOGIC DISPLAY */}
      <section className="bg-[#050810] border border-hp-border p-6 rounded-sm font-mono text-sm text-hp-accent-green leading-relaxed shadow-inner">
        <p>ANALYZING SETUP...</p>
        <p>Electricity Rate: <span className="text-hp-text-primary">{rate}</span> ({(feePercent*100).toFixed(0)}% fee multiplier)</p>
        <p>Unclaimed Balance: <span className="text-hp-text-primary">{unclaimedVal} hCASH</span></p>
        <p>Claim Cost: <span className="text-hp-text-primary">~{feeCost.toFixed(1)} hCASH in fees</span></p>
        <p>24H Earning Projection: <span className="text-hp-text-primary">+{projected24h} hCASH</span></p>
        
        <p className="mt-4">
          VERDICT: {
            rate === "NORMAL" 
            ? "Claiming now locks in minimum 5% fee rate." 
            : `Waiting 24H for Normal rates saves ${(feeCost - (unclaimedVal*0.05)).toFixed(1)} hCASH net.`
          }
        </p>
        <p className="mt-1 flex items-center gap-2">
          RECOMMENDATION: <span className={cn("font-bold", activeConf.text)}>{activeConf.label.replace(/[^a-zA-Z ]/g, '')}</span> 
          <span className="inline-block w-2.5 h-4 bg-hp-accent-green animate-pulse ml-1" />
        </p>
      </section>

      <div className="border border-hp-accent-amber/50 bg-[#2E1A0A]/50 p-4 rounded-sm text-sm font-mono text-hp-accent-amber flex items-start gap-4">
        <span className="text-xl">💡</span>
        <div>
          <span className="font-bold">Pro Tip: </span>
          Surge rates typically last 4-12 hours. Claim during Normal windows for maximum efficiency.
        </div>
      </div>
    </div>
  );
}
