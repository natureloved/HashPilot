"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Orbit, TrendingUp, TrendingDown, Minus,
  Zap, Activity, Calculator, Shield, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrices } from "@/components/providers/PriceProvider";
import Link from "next/link";

const BLOCK_REWARD = 1.25;
const BLOCKS_PER_DAY = 43200;

function calcEarnings(sharePercent: number, priceUsd: number, networkGrowthPercent: number) {
  const effectiveShare = sharePercent / (1 + networkGrowthPercent / 100);
  const dailyHcash = BLOCK_REWARD * (effectiveShare / 100) * BLOCKS_PER_DAY;
  const dailyUsd = dailyHcash * priceUsd;
  return {
    dailyHcash,
    dailyUsd,
    weeklyUsd: dailyUsd * 7,
    monthlyUsd: dailyUsd * 30,
    yearlyUsd: dailyUsd * 365,
  };
}

type ScenarioKey = "bear" | "base" | "bull";

const SCENARIOS = [
  {
    key: "bear" as ScenarioKey,
    label: "BEAR",
    textColor: "text-hp-accent-red",
    borderColor: "border-hp-accent-red/30",
    bgColor: "bg-hp-accent-red/5",
    glowRgb: "255,59,48",
    inputColor: "#FF3B30",
    Icon: TrendingDown,
  },
  {
    key: "base" as ScenarioKey,
    label: "BASE",
    textColor: "text-hp-accent-amber",
    borderColor: "border-hp-accent-amber/30",
    bgColor: "bg-hp-accent-amber/5",
    glowRgb: "245,166,35",
    inputColor: "#F5A623",
    Icon: Minus,
  },
  {
    key: "bull" as ScenarioKey,
    label: "BULL",
    textColor: "text-hp-accent-green",
    borderColor: "border-hp-accent-green/30",
    bgColor: "bg-hp-accent-green/5",
    glowRgb: "57,255,20",
    inputColor: "#39FF14",
    Icon: TrendingUp,
  },
];

const DILUTION_STEPS = [0, 25, 50, 100, 200];

export default function OraclePage() {
  const { hcash, isLoading } = usePrices();
  const [share, setShare] = useState("0.21");
  const [investment, setInvestment] = useState("500");
  const [networkGrowth, setNetworkGrowth] = useState("0");
  const [gasGwei, setGasGwei] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<ScenarioKey, string>>({ bear: "", base: "", bull: "" });
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!isLoading && hcash.price > 0 && !synced) {
      setPrices({
        bear: (hcash.price * 0.4).toFixed(2),
        base: hcash.price.toFixed(2),
        bull: (hcash.price * 2.5).toFixed(2),
      });
      setSynced(true);
    }
  }, [isLoading, hcash.price, synced]);

  useEffect(() => {
    fetch("/api/network-data")
      .then(r => r.json())
      .then(d => { if (d.gasGwei) setGasGwei(d.gasGwei); })
      .catch(() => {});
  }, []);

  const s = parseFloat(share) || 0;
  const g = parseFloat(networkGrowth) || 0;
  const inv = parseFloat(investment) || 0;

  const results = useMemo(() => ({
    bear: calcEarnings(s, parseFloat(prices.bear) || 0, g),
    base: calcEarnings(s, parseFloat(prices.base) || 0, g),
    bull: calcEarnings(s, parseFloat(prices.bull) || 0, g),
  }), [s, prices, g]);

  const breakEvenDays = useMemo(() => {
    if (results.base.dailyUsd <= 0 || inv <= 0) return null;
    return Math.ceil(inv / results.base.dailyUsd);
  }, [inv, results.base.dailyUsd]);

  const signal = useMemo(() => {
    if (!gasGwei) return { label: "SCANNING...", color: "text-hp-text-muted", border: "border-hp-border/40", bg: "bg-hp-border/10", Icon: Orbit };
    if (gasGwei < 30 && hcash.price > 5) return { label: "CLAIM ✅ — OPTIMAL WINDOW", color: "text-hp-accent-green", border: "border-hp-accent-green/40", bg: "bg-hp-accent-green/10", Icon: TrendingUp };
    if (gasGwei > 60) return { label: "HOLD ⛔ — GAS SURGE", color: "text-hp-accent-red", border: "border-hp-accent-red/40", bg: "bg-hp-accent-red/10", Icon: TrendingDown };
    return { label: "CAUTION ⚠️ — MONITOR GAS", color: "text-hp-accent-amber", border: "border-hp-accent-amber/40", bg: "bg-hp-accent-amber/10", Icon: Minus };
  }, [gasGwei, hcash.price]);

  const SignalIcon = signal.Icon;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20">

      {/* HEADER */}
      <div className="relative overflow-hidden bg-[rgba(13,20,36,0.8)] backdrop-blur-md border border-hp-accent-amber/20 rounded-sm p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(245,166,35,0.06)_0%,transparent_60%)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-hp-accent-amber/30 flex items-center justify-center bg-hp-accent-amber/10 shrink-0">
              <Orbit className="text-hp-accent-amber" size={24} style={{ animation: "spin 8s linear infinite" }} />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                ORACLE <span className="text-hp-accent-amber">MATRIX</span>
              </h1>
              <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.2em]">
                SCENARIO SIMULATION ENGINE // PREDICTIVE MODELING v1.0
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-sm border font-mono text-xs font-bold uppercase tracking-widest shrink-0",
            signal.bg, signal.border, signal.color
          )}>
            <SignalIcon size={13} />
            {signal.label}
            {gasGwei && <span className="opacity-50 ml-1 text-[10px]">{'// '}{gasGwei} GWEI</span>}
          </div>
        </div>
        <p className="relative z-10 font-mono text-sm text-hp-text-secondary max-w-2xl mt-4">
          Simulate BEAR, BASE, and BULL market outcomes for your mining operation. Adjust network dilution and investment cost to find your break-even point.
        </p>
      </div>

      {/* PARAMETERS */}
      <div className="bg-hp-surface border border-hp-border rounded-sm p-6">
        <h2 className="font-display font-bold text-white uppercase tracking-tight text-sm mb-5 flex items-center gap-2">
          <Calculator size={14} className="text-hp-accent-amber" /> OPERATION PARAMETERS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {([
            { label: "Network Share (%)", value: share, setter: setShare, step: "0.01", hint: "Your % of total network hashrate" },
            { label: "Investment Cost (USD)", value: investment, setter: setInvestment, step: "10", hint: "Total spent on miners & facilities" },
            { label: "Network Growth (%)", value: networkGrowth, setter: setNetworkGrowth, step: "5", hint: "Expected dilution — reduces your effective share" },
          ] as const).map(({ label, value, setter, step, hint }) => (
            <div key={label}>
              <label className="text-[10px] font-mono text-hp-text-muted tracking-[0.2em] uppercase block mb-1.5">{label}</label>
              <input
                type="number"
                value={value}
                onChange={e => (setter as (v: string) => void)(e.target.value)}
                step={step}
                className="w-full bg-[rgba(5,8,16,0.6)] border border-hp-border focus:border-hp-accent-amber rounded-sm py-2.5 px-3 text-hp-text-primary font-mono text-sm outline-none transition-all"
              />
              <p className="text-[9px] font-mono text-hp-text-muted mt-1">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SCENARIO MATRIX */}
      <div>
        <h2 className="font-display font-bold text-white uppercase tracking-tight text-sm mb-4 flex items-center gap-2">
          <Activity size={14} className="text-hp-accent-amber" /> SCENARIO SIMULATION MATRIX
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCENARIOS.map(sc => {
            const res = results[sc.key];
            const ScIcon = sc.Icon;
            return (
              <motion.div
                key={sc.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("border rounded-sm p-6 relative overflow-hidden", sc.borderColor, sc.bgColor)}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, rgba(${sc.glowRgb},0.12) 0%, transparent 65%)` }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <ScIcon size={13} className={sc.textColor} />
                      <span className={cn("font-mono text-xs font-black uppercase tracking-widest", sc.textColor)}>
                        {sc.label} CASE
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="font-mono text-[10px] text-hp-text-muted">$</span>
                      <input
                        type="number"
                        value={prices[sc.key]}
                        onChange={e => setPrices(prev => ({ ...prev, [sc.key]: e.target.value }))}
                        step="0.01"
                        className="w-20 bg-transparent border-b text-sm font-mono font-bold outline-none text-right pb-0.5"
                        style={{ borderBottomColor: sc.inputColor, color: sc.inputColor }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-end font-mono text-xs pb-2 border-b border-hp-border/20">
                      <span className="text-hp-text-muted">Daily hCASH</span>
                      <span className={cn("font-bold", sc.textColor)}>{res.dailyHcash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-hp-text-muted">Daily USD</span>
                      <span className="text-hp-text-primary font-bold">${res.dailyUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-hp-text-muted">Weekly</span>
                      <span className="text-hp-text-primary font-bold">${res.weeklyUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-hp-text-muted">Monthly</span>
                      <span className="text-hp-text-primary font-bold">${res.monthlyUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs pt-2 border-t border-hp-border/20">
                      <span className="text-hp-text-muted">Yearly</span>
                      <span className={cn("font-black text-base", sc.textColor)}>${res.yearlyUsd.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* BREAK-EVEN + DILUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-hp-surface border border-hp-border rounded-sm p-6">
          <h3 className="font-display font-bold text-white uppercase tracking-tight text-sm mb-5 flex items-center gap-2">
            <Target size={14} className="text-hp-accent-amber" /> BREAK-EVEN ANALYSIS
          </h3>
          <div className="text-center py-4">
            {breakEvenDays !== null ? (
              <>
                <div className={cn(
                  "font-display font-black drop-shadow-[0_0_20px_rgba(245,166,35,0.4)]",
                  breakEvenDays > 9999 ? "text-hp-accent-red text-4xl mt-4" : "text-hp-accent-amber text-7xl"
                )}>
                  {breakEvenDays > 9999 ? "NEVER" : breakEvenDays}
                </div>
                <p className="font-mono text-sm text-hp-text-secondary mt-2">
                  {breakEvenDays > 9999
                    ? "Recovery impossible at base-case price"
                    : `days to recover $${investment} investment`}
                </p>
                {results.base.dailyUsd > 0 && (
                  <p className="font-mono text-[10px] text-hp-text-muted mt-1 uppercase tracking-widest">
                    earning ${results.base.dailyUsd.toFixed(2)}/day at BASE price
                  </p>
                )}
              </>
            ) : (
              <p className="font-mono text-sm text-hp-text-muted">
                Set investment cost and network share to calculate
              </p>
            )}
          </div>
        </div>

        <div className="bg-hp-surface border border-hp-border rounded-sm p-6">
          <h3 className="font-display font-bold text-white uppercase tracking-tight text-sm mb-3 flex items-center gap-2">
            <Shield size={14} className="text-hp-accent-amber" /> NETWORK DILUTION IMPACT
          </h3>
          <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-widest mb-4">
            Monthly earnings at BASE price vs. network growth
          </p>
          <div className="space-y-1.5">
            {DILUTION_STEPS.map(step => {
              const r = calcEarnings(s, parseFloat(prices.base) || 0, step);
              const isActive = parseFloat(networkGrowth) === step;
              return (
                <button
                  key={step}
                  onClick={() => setNetworkGrowth(step.toString())}
                  className={cn(
                    "w-full flex items-center justify-between font-mono text-xs py-2 px-3 rounded-sm transition-all",
                    isActive
                      ? "bg-hp-accent-amber/10 border border-hp-accent-amber/30 text-hp-accent-amber"
                      : "hover:bg-hp-border/20 text-hp-text-muted"
                  )}
                >
                  <span className="font-bold">{step === 0 ? "No growth" : `+${step}% network`}</span>
                  <span className={cn("font-bold", isActive ? "text-hp-accent-amber" : "text-hp-text-primary")}>
                    ${r.monthlyUsd.toFixed(2)}/mo
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* VERDICT CTA */}
      <div className="bg-[#050810] border-l-4 border-hp-accent-amber border-y border-r border-hp-border p-6 rounded-r-sm">
        <p className="font-mono text-sm text-hp-text-secondary leading-relaxed">
          <span className="text-hp-accent-amber font-bold uppercase">Oracle Verdict: </span>
          {signal.label.includes("CLAIM")
            ? "Conditions are OPTIMAL. Execute your claim before the window closes."
            : signal.label.includes("HOLD")
            ? "Gas is spiking. Hold your rewards — claiming now eats directly into your margins."
            : "Conditions are mixed. Monitor gas and hCASH price before committing to a claim."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/claim-advisor"
            className="inline-flex items-center gap-2 bg-hp-accent-amber text-black font-display font-black text-xs px-6 py-2.5 rounded-sm uppercase tracking-widest hover:bg-amber-400 transition-all"
          >
            <Zap size={13} /> OPEN CLAIM ADVISOR
          </Link>
          <Link
            href="/roi-calculator"
            className="inline-flex items-center gap-2 bg-hp-surface border border-hp-border text-hp-text-secondary font-display font-bold text-xs px-6 py-2.5 rounded-sm uppercase tracking-widest hover:text-white transition-all"
          >
            ROI CALCULATOR
          </Link>
        </div>
      </div>

      <p className="font-mono text-[10px] text-hp-text-muted border border-hp-border/20 rounded-sm p-3">
        ⚠ Projections use current block reward (1.25 hCASH/block) and 43,200 blocks/day. Results are estimates and do not account for future halvings, gas costs, or network changes beyond the dilution input above.
      </p>
    </div>
  );
}
