"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { usePrices } from "@/components/providers/PriceProvider";
import { useAccount } from "wagmi";

const TIERS = ["STARTER", "STANDARD", "ADVANCED", "ELITE"];
const RATES = ["NORMAL", "MEDIUM", "HIGH", "SURGE"];

export default function RoiCalculator() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { hcash, isLoading } = usePrices();
  const [playerHashrate, setPlayerHashrate] = useState<string>("500");
  const [networkHashrate, setNetworkHashrate] = useState<string>("241.85");
  const [price, setPrice] = useState<string>(hcash.price.toString());
  const [tier, setTier] = useState<string>("STANDARD");
  const [rate, setRate] = useState<string>("NORMAL");

  // Sync price when it loads for the first time
  useEffect(() => {
    if (!isLoading && price === "14.2") {
      setPrice(hcash.price < 1 ? hcash.price.toFixed(4) : hcash.price.toFixed(2));
    }
  }, [hcash.price, isLoading, price]);

  const [isCalculated, setIsCalculated] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Derived state math
  const pHs = parseFloat(playerHashrate) || 0;
  const nHs = parseFloat(networkHashrate) || 1;
  const priceNum = parseFloat(price) || 0;

  const claimFee = rate === "NORMAL" ? 0.05 : rate === "MEDIUM" ? 0.1 : rate === "HIGH" ? 0.15 : 0.25;
  const share = (pHs / nHs) * 100;
  const hcashPerBlock = 1.25 * (pHs / nHs);
  const blocksPerDay = 43200;
  const dailyGross = hcashPerBlock * blocksPerDay;
  const dailyNet = dailyGross * (1 - claimFee);

  const maxShare = 1.0; // 1% is considered big in this simulation
  const rawScore = (dailyNet / (dailyGross || 1)) * 0.5 + Math.min(share / maxShare, 1) * 0.5;
  const score = Math.round(rawScore * 100);

  const scoreColor =
    score <= 40 ? "#FF3B3B" : score <= 70 ? "#F5A623" : "#39FF14";

  const handleSimulate = () => {
    setIsSimulating(true);
    setIsCalculated(false);
    setTimeout(() => {
      setIsSimulating(false);
      setIsCalculated(true);
    }, 1500); // Terminal loading simulation delay
  };

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      Gross: dailyGross,
      Net: dailyNet,
    }));
  }, [dailyGross, dailyNet]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-hp-surface-elevated border border-hp-border p-3 rounded-sm shadow-xl font-mono text-xs">
          <p className="text-hp-text-muted mb-2">{label}</p>
          {payload.map((entry) => (
            <div key={entry.name} className="flex gap-4 justify-between mb-1">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span style={{ color: entry.color }} className="font-bold">
                {entry.value.toFixed(2)} hCASH
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Input styles
  const inputContainer = "flex items-center bg-hp-surface border border-hp-border focus-within:border-hp-accent-green rounded-sm transition-colors relative";
  const numInput = "w-full bg-transparent outline-none px-3 py-2 text-hp-text-primary font-mono text-right text-lg font-bold";
  const prefixStyle = "absolute left-3 text-[10px] text-hp-text-muted font-mono tracking-widest uppercase pointer-events-none font-semibold";

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[700px]">
      {/* LEFT PANEL: SETUP INPUT CONSOLE */}
      <div className="w-full lg:w-[45%] bg-[rgba(13,20,36,0.8)] backdrop-blur-md border border-hp-border rounded-sm flex flex-col p-6">
        <h2 className="font-sans font-bold tracking-widest text-hp-accent-amber mb-6 flex items-center gap-2 text-lg">
          <span className="w-2 h-2 bg-hp-accent-amber block animate-pulse"></span>
          CONFIGURATION INPUTS
        </h2>

        <div className="space-y-4 flex-1">
          {/* Hashrate */}
          <div className="space-y-1">
            <div className={inputContainer}>
              <span className={prefixStyle}>MY HASHRATE (TH/s)</span>
              <input
                type="number"
                disabled={isSimulating}
                value={playerHashrate}
                onChange={(e) => setPlayerHashrate(e.target.value)}
                className={numInput}
              />
              {isConnected && connectedAddress && (
                <div className="absolute right-3 top-[-8px] bg-hp-accent-blue text-hp-background text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.4)]">
                  SYNCED
                </div>
              )}
            </div>
          </div>

          {/* Network Hashrate */}
          <div className="space-y-1">
            <div className={inputContainer}>
              <span className={prefixStyle}>NETWORK HASHRATE (TH/s)</span>
              <input
                type="number"
                disabled={isSimulating}
                value={networkHashrate}
                onChange={(e) => setNetworkHashrate(e.target.value)}
                className={numInput}
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className={inputContainer}>
              <span className={prefixStyle}>hCASH PRICE (USD)</span>
              <input
                type="number"
                disabled={isSimulating}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={numInput}
              />
              {Math.abs(parseFloat(price) - hcash.price) < 0.01 && (
                <div className="absolute right-3 top-[-8px] bg-hp-accent-green text-hp-background text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                  LIVE
                </div>
              )}
            </div>
          </div>

          {/* Facility Tier */}
          <div className="space-y-1.5 border border-hp-border p-3 rounded-sm bg-hp-surface">
            <label className="text-[11px] text-hp-text-muted font-mono tracking-widest block mb-2 font-semibold">FACILITY TIER</label>
            <div className="grid grid-cols-4 gap-1">
              {TIERS.map((t) => (
                <button
                  key={t}
                  disabled={isSimulating}
                  onClick={() => setTier(t)}
                  className={cn(
                    "py-2 text-xs font-mono tracking-widest border transition-all rounded-sm font-bold",
                    tier === t
                      ? "bg-hp-accent-amber/20 border-hp-accent-amber text-hp-accent-amber shadow-[0_0_8px_rgba(245,166,35,0.2)]"
                      : "border-transparent bg-hp-surface-elevated text-hp-text-muted hover:text-hp-text-primary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Electricity Rate */}
          <div className="space-y-1.5 border border-hp-border p-3 rounded-sm bg-hp-surface relative overflow-hidden">
            <label className="text-[11px] text-hp-text-muted font-mono tracking-widest block mb-2 font-semibold uppercase">Current Rate</label>
            <div className="grid grid-cols-3 gap-1">
              {RATES.map((r) => {
                const isActive = rate === r;
                let activeClass = "";
                if (isActive) {
                  activeClass = r === "NORMAL" 
                    ? "bg-hp-accent-green/20 border-hp-accent-green text-hp-accent-green shadow-[0_0_8px_rgba(57,255,20,0.2)]"
                    : r === "MEDIUM" 
                    ? "bg-hp-accent-blue/20 border-hp-accent-blue text-hp-accent-blue" 
                    : r === "HIGH"
                    ? "bg-hp-accent-amber/20 border-hp-accent-amber text-hp-accent-amber"
                    : "bg-hp-accent-red/20 border-hp-accent-red text-hp-accent-red animate-pulse";
                }
                return (
                  <button
                    key={r}
                    disabled={isSimulating}
                    onClick={() => setRate(r)}
                    className={cn(
                      "py-2 text-xs font-mono tracking-widest border transition-all rounded-sm font-bold",
                      isActive ? activeClass : "border-transparent bg-hp-surface-elevated text-hp-text-muted hover:text-hp-text-primary"
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-right text-xs font-mono text-hp-text-secondary uppercase">
              UTILITY FEE: <span className="font-bold text-hp-text-primary text-sm">{claimFee * 100}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="mt-6 w-full h-12 bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-bold rounded-sm transition-all overflow-hidden relative group disabled:opacity-80"
        >
          {isSimulating ? (
            <span className="font-mono text-xs tracking-widest flex items-center justify-center gap-2">
              <span className="animate-spin inline-block">|</span> INITIALIZING...
            </span>
          ) : (
            <span className="tracking-widest relative z-10 text-base">RUN SIMULATION</span>
          )}
          {!isSimulating && (
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-white/30 transform skew-x-[-25deg] group-hover:animate-[scan_0.5s_ease-in-out_forwards]" />
          )}
        </button>
      </div>

      {/* RIGHT PANEL: EARNINGS PROJECTION */}
      <div className="w-full lg:w-[55%] bg-hp-surface border border-hp-border rounded-sm p-6 relative flex flex-col">
        {!isCalculated ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-hp-text-muted font-mono text-xs tracking-widest z-10 backdrop-blur-sm bg-hp-surface/50">
            {isSimulating ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="w-12 h-12 border-t-2 border-r-2 border-hp-accent-amber rounded-full animate-spin mb-4" />
                <p className="animate-pulse text-hp-accent-amber text-[10px]">RENDERING DATACUBE...</p>
              </motion.div>
            ) : (
              <p>AWAITING SIMULATION PARAMETERS</p>
            )}
          </div>
        ) : null}

        <AnimatePresence>
          {isCalculated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="font-sans font-bold tracking-widest text-xs text-hp-text-secondary mb-4 uppercase opacity-80">
                EARNINGS PROJECTION
              </h2>
              
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="font-sans font-bold text-hp-text-secondary text-[11px] mb-1 tracking-wider uppercase">DAILY EARNINGS (NET)</h3>
                  <div className="font-display flex items-baseline gap-2">
                    <span className="text-3xl lg:text-4xl xl:text-5xl font-bold text-hp-accent-green animate-glow-pulse drop-shadow-md">
                      {dailyNet.toFixed(2)}
                    </span>
                    <span className="text-xs text-hp-text-secondary font-mono">hCASH</span>
                  </div>
                  <p className="text-hp-text-primary text-xs font-mono mt-1 opacity-80">≈ ${(dailyNet * priceNum).toFixed(2)} USD</p>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative w-12 h-12 rounded-full flex items-center justify-center" 
                    style={{ background: `conic-gradient(${scoreColor} ${score}%, transparent ${score}%)`, borderRadius: '50%' }}
                  >
                    <div className="absolute inset-[2.5px] bg-hp-surface rounded-full flex items-center justify-center">
                      <span className="font-display font-bold text-[10px]" style={{ color: scoreColor }}>{score}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest font-bold text-hp-text-secondary">EFFICIENCY</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                 {[
                   { label: "WEEKLY NET hCASH", val: `${(dailyNet * 7).toFixed(2)}`, sub: `$${(dailyNet * 7 * priceNum).toFixed(2)}` },
                   { label: "MONTHLY NET hCASH", val: `${(dailyNet * 30).toFixed(2)}`, sub: `$${(dailyNet * 30 * priceNum).toFixed(2)}` },
                   { label: "NETWORK SHARE", val: `${share.toFixed(4)}%`, sub: `T: ${TIERS.indexOf(tier) + 1}/4` },
                   { label: "EFFECTIVE FEE RATE", val: `${claimFee * 100}%`, sub: `P: ${rate}` }
                 ].map((metric, idx) => (
                   <div key={idx} className="border border-hp-border p-3 bg-hp-surface-elevated rounded-sm">
                      <p className="text-[10px] text-hp-text-muted font-mono tracking-widest mb-1.5 font-semibold uppercase">{metric.label}</p>
                      <p className="text-xl font-display font-bold text-hp-text-primary">{metric.val}</p>
                      <p className="text-[10px] text-hp-text-secondary font-mono mt-1 font-medium">{metric.sub}</p>
                   </div>
                 ))}
              </div>

              {/* Chart */}
              <div className="flex-1 w-full min-h-[150px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#3D5070", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={5} />
                    <YAxis tick={{ fill: "#3D5070", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} dx={-5} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#1A2035'}} />
                    <Bar dataKey="Gross" fill="#F5A623" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Net" fill="#39FF14" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-hp-border bg-[rgba(5,8,16,0.6)] p-5 rounded-sm font-mono text-base shadow-inner">
                <p className="text-hp-text-secondary mb-3 uppercase tracking-widest text-sm border-b border-hp-border/50 pb-2 w-max font-bold">
                  <span className="text-hp-accent-blue mr-2">🤖</span> STRATEGY TIPS
                </p>
                <div className="space-y-1">
                  {rate === "SURGE" && (
                    <p className="text-hp-accent-red animate-flicker">
                      {`>> WARNING: Surge electricity detected. Delay claiming. Est. fee cost: ${(dailyGross - dailyNet).toFixed(2)} hCASH/day`}
                    </p>
                  )}
                  {share > 0.1 && (
                    <p className="text-hp-accent-green">
                      {`>> Whale status achieved. You control >0.1% of network. Optimize uptime.`}
                    </p>
                  )}
                  {rate !== "SURGE" && share <= 0.1 && (
                     <p className="text-hp-text-primary leading-relaxed">
                     {`>> Current conditions optimal for accumulation. Keep miners active at ${tier} tier. Your setup has reached ELITE STATUS parity.`}
                   </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
