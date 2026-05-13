"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, ArrowRight, Calculator, Zap, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrices } from "@/components/providers/PriceProvider";
import Link from "next/link";

const PRICE_SNAPSHOTS = [
  { date: new Date("2025-09-15"), price: 0.50 },
  { date: new Date("2025-10-15"), price: 1.20 },
  { date: new Date("2025-11-15"), price: 1.80 },
  { date: new Date("2025-12-15"), price: 2.50 },
  { date: new Date("2026-01-01"), price: 3.00 },
  { date: new Date("2026-01-12"), price: 3.20 },
  { date: new Date("2026-02-01"), price: 5.50 },
  { date: new Date("2026-03-01"), price: 8.00 },
  { date: new Date("2026-04-01"), price: 11.00 },
  { date: new Date("2026-05-01"), price: 14.20 },
];

const PRESET_DATES = [
  { label: "Protocol Genesis — Sep 2025", date: "2025-09-15" },
  { label: "6 months ago — Nov 2025", date: "2025-11-13" },
  { label: "Halving 2 — Jan 12, 2026", date: "2026-01-12" },
  { label: "3 months ago — Feb 2026", date: "2026-02-13" },
  { label: "2 months ago — Mar 2026", date: "2026-03-13" },
  { label: "1 month ago — Apr 2026", date: "2026-04-13" },
];

const HASHRATE_PRESETS = [
  { label: "Entry (10 TH/s)", share: "0.004" },
  { label: "Small (100 TH/s)", share: "0.04" },
  { label: "Mid (500 TH/s)", share: "0.21" },
  { label: "Power (2000 TH/s)", share: "0.82" },
  { label: "Whale (10,000 TH/s)", share: "4.1" },
];

function getBlockReward(date: Date): number {
  const HALVING2 = new Date("2026-01-12");
  const HALVING3 = new Date("2026-05-17");
  if (date >= HALVING3) return 1.25;
  if (date >= HALVING2) return 2.5;
  return 5.0;
}

function interpolatePrice(date: Date): number {
  const snaps = PRICE_SNAPSHOTS;
  if (date <= snaps[0].date) return snaps[0].price;
  if (date >= snaps[snaps.length - 1].date) return snaps[snaps.length - 1].price;
  for (let i = 0; i < snaps.length - 1; i++) {
    if (date >= snaps[i].date && date <= snaps[i + 1].date) {
      const t =
        (date.getTime() - snaps[i].date.getTime()) /
        (snaps[i + 1].date.getTime() - snaps[i].date.getTime());
      return snaps[i].price + t * (snaps[i + 1].price - snaps[i].price);
    }
  }
  return snaps[snaps.length - 1].price;
}

export default function FomoMachinePage() {
  const { hcash } = usePrices();
  const [selectedDate, setSelectedDate] = useState("");
  const [netShare, setNetShare] = useState("0.21");
  const [calculated, setCalculated] = useState(false);

  const results = useMemo(() => {
    if (!selectedDate || !calculated) return null;
    const startDate = new Date(selectedDate);
    const now = new Date();
    if (startDate >= now) return null;

    const totalDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 86400));
    const share = parseFloat(netShare) || 0;
    const BLOCKS_PER_DAY = 43200;

    let totalHcash = 0;
    let totalUsdAtTime = 0;

    for (let d = 0; d < totalDays; d++) {
      const dayDate = new Date(startDate.getTime() + d * 86400 * 1000);
      const reward = getBlockReward(dayDate);
      const daily = reward * (share / 100) * BLOCKS_PER_DAY;
      totalHcash += daily;
      totalUsdAtTime += daily * interpolatePrice(dayDate);
    }

    return {
      totalDays,
      totalHcash,
      totalUsdAtTime,
      currentValue: totalHcash * hcash.price,
      entryPrice: interpolatePrice(startDate),
      avgPrice: totalHcash > 0 ? totalUsdAtTime / totalHcash : 0,
    };
  }, [selectedDate, netShare, calculated, hcash.price]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      {/* HEADER */}
      <div className="relative overflow-hidden bg-[rgba(13,20,36,0.8)] backdrop-blur-md border border-hp-accent-red/30 rounded-sm p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,59,48,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10 flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full border border-hp-accent-red/30 flex items-center justify-center bg-hp-accent-red/10">
            <Timer className="text-hp-accent-red" size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              FOMO <span className="text-hp-accent-red">MACHINE</span>
            </h1>
            <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.2em]">
              TIME-TRAVEL PROFIT SIMULATOR // REGRET CALCULATOR v1.0
            </p>
          </div>
        </div>
        <p className="relative z-10 font-mono text-sm text-hp-text-secondary max-w-2xl">
          Pick a past date. Set your hashrate share. See exactly how much hCASH you would have accumulated — and what it&apos;s worth at today&apos;s price.
        </p>
      </div>

      {/* CALCULATOR */}
      <div className="bg-hp-surface border border-hp-border rounded-sm p-6">
        <h2 className="font-display font-bold text-white uppercase tracking-tight text-base mb-6 flex items-center gap-2">
          <Calculator size={16} className="text-hp-accent-red" />
          SET PARAMETERS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-[10px] font-mono text-hp-text-muted tracking-[0.2em] uppercase block mb-3">
              If I Had Started Mining On...
            </label>
            <div className="space-y-1.5">
              {PRESET_DATES.map((p) => (
                <button
                  key={p.date}
                  onClick={() => { setSelectedDate(p.date); setCalculated(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-sm font-mono text-xs border transition-all",
                    selectedDate === p.date
                      ? "border-hp-accent-red text-hp-accent-red bg-hp-accent-red/10"
                      : "border-hp-border text-hp-text-secondary hover:border-hp-border/80 hover:text-white"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-mono text-hp-text-muted tracking-[0.2em] uppercase block mb-2">
                Network Share (%)
              </label>
              <input
                type="number"
                value={netShare}
                onChange={(e) => { setNetShare(e.target.value); setCalculated(false); }}
                placeholder="e.g. 0.21"
                step="0.01"
                min="0.001"
                max="100"
                className="w-full bg-[rgba(5,8,16,0.6)] border border-hp-border focus:border-hp-accent-red rounded-sm py-3 px-4 text-hp-text-primary font-mono text-sm outline-none transition-all"
              />
            </div>

            <div className="bg-[rgba(5,8,16,0.4)] border border-hp-border/50 rounded-sm p-4">
              <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-widest mb-2">Quick Presets</p>
              <div className="space-y-1">
                {HASHRATE_PRESETS.map((ref) => (
                  <button
                    key={ref.share}
                    onClick={() => { setNetShare(ref.share); setCalculated(false); }}
                    className={cn(
                      "w-full flex justify-between items-center text-[10px] font-mono py-1 px-1 rounded-sm transition-colors",
                      netShare === ref.share ? "text-hp-accent-red" : "text-hp-text-muted hover:text-white"
                    )}
                  >
                    <span>{ref.label}</span>
                    <span>{ref.share}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCalculated(true)}
          disabled={!selectedDate}
          className="w-full bg-hp-accent-red hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-black py-3.5 rounded-sm tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,59,48,0.15)]"
        >
          <TrendingDown size={16} />
          CALCULATE OPPORTUNITY COST
          <ArrowRight size={16} />
        </button>
      </div>

      {/* RESULTS */}
      <AnimatePresence>
        {results && calculated && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-[rgba(255,59,48,0.04)] border-2 border-hp-accent-red/30 rounded-sm p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,59,48,0.08)_0%,transparent_65%)]" />
              <p className="relative z-10 font-mono text-[10px] text-hp-text-muted uppercase tracking-[0.3em] mb-4">
                Mining {results.totalDays} days at {netShare}% network share
              </p>
              <div className="relative z-10 flex flex-col items-center gap-1 mb-5">
                <span className="font-display text-5xl md:text-7xl font-black text-hp-accent-red drop-shadow-[0_0_30px_rgba(255,59,48,0.5)]">
                  {results.totalHcash.toFixed(0)}
                </span>
                <span className="font-mono text-lg text-hp-text-secondary">hCASH would have been earned</span>
              </div>
              <div className="relative z-10 font-display text-3xl font-bold text-white">
                = <span className="text-hp-accent-green">${results.currentValue.toFixed(2)} today</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-hp-surface border border-hp-border rounded-sm p-5">
                <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-widest mb-2">Entry hCASH Price</p>
                <p className="font-display text-2xl font-bold text-hp-text-primary">${results.entryPrice.toFixed(2)}</p>
                <p className="font-mono text-[10px] text-hp-text-muted mt-1">Price when you could have started</p>
              </div>
              <div className="bg-hp-surface border border-hp-border rounded-sm p-5">
                <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-widest mb-2">Value at Earn-Time Prices</p>
                <p className="font-display text-2xl font-bold text-hp-accent-amber">${results.totalUsdAtTime.toFixed(2)}</p>
                <p className="font-mono text-[10px] text-hp-text-muted mt-1">Avg ${results.avgPrice.toFixed(2)}/hCASH</p>
              </div>
              <div className="bg-hp-surface border border-hp-border rounded-sm p-5">
                <p className="font-mono text-[10px] text-hp-text-muted uppercase tracking-widest mb-2">Value at Live Price</p>
                <p className="font-display text-2xl font-bold text-hp-accent-green">${results.currentValue.toFixed(2)}</p>
                <p className="font-mono text-[10px] text-hp-text-muted mt-1">At ${hcash.price.toFixed(4)}/hCASH now</p>
              </div>
            </div>

            <div className="bg-[#050810] border-l-4 border-hp-accent-red border-y border-r border-hp-border p-6 rounded-r-sm">
              <p className="font-mono text-sm text-hp-text-secondary leading-relaxed">
                <span className="text-hp-accent-red font-bold uppercase">Verdict: </span>
                Waiting cost you approximately{" "}
                <span className="text-hp-accent-red font-bold">{results.totalHcash.toFixed(0)} hCASH</span>{" "}(
                <span className="text-hp-accent-green font-bold">${results.currentValue.toFixed(2)} at today&apos;s price</span>
                ). Every block minted rewards you missed. The{" "}
                <span className="text-hp-accent-amber font-bold">Aug 22 halving</span> cuts emissions in half again — the window to act at full rate is closing.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  href="/claim-advisor"
                  className="inline-flex items-center gap-2 bg-hp-accent-amber text-black font-display font-black text-xs px-6 py-2.5 rounded-sm uppercase tracking-widest hover:bg-amber-400 transition-all"
                >
                  <Zap size={14} /> CHECK CLAIM TIMING
                </Link>
                <a
                  href="https://hashcash.club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-hp-surface border border-hp-border text-hp-text-secondary font-display font-bold text-xs px-6 py-2.5 rounded-sm uppercase tracking-widest hover:text-white transition-all"
                >
                  GET A MINER ↗
                </a>
                <button
                  onClick={() => { setSelectedDate(""); setCalculated(false); setNetShare("0.21"); }}
                  className="font-mono text-xs text-hp-text-muted hover:text-white underline underline-offset-4 uppercase tracking-widest ml-auto"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-[10px] text-hp-text-muted border border-hp-border/20 rounded-sm p-3">
        ⚠ Historical hCASH prices are approximate estimates based on known protocol milestones. Actual results vary based on exact setup and network conditions at the time.
      </p>
    </div>
  );
}
