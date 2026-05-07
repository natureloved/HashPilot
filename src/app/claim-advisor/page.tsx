"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, AlertCircle, Zap, Bell, LayoutDashboard,
  ShieldCheck, TrendingUp, History, Power, ShoppingBag,
  ArrowRight, Wifi, WifiOff, Fuel
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHashPilotAccount } from "@/hooks/useHashPilotAccount";
import { useDemoMode } from "@/components/providers/DemoProvider";

interface LiveData {
  gasGwei: number;
  gasRateLabel: string;
  gasCostUsd: number;
  gasCostHcash: number;
  hcashUsd: number;
  avaxUsd: number;
  rewardsUsd: number;
  netPnlUsd: number;
  netPnlHcash: number;
  roiRatio: number;
  forcedWait: boolean;
  isLive: boolean;
}

interface MinerData {
  pendingRewards: number;
  claimFee: number;
  mode: string;
  lastClaim: string;
}

function ClaimAdvisorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useHashPilotAccount();
  const { enableDemoMode, demoAddress } = useDemoMode();

  const [address, setAddress] = useState(searchParams.get("address") || "");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MinerData | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [alertStatus, setAlertStatus] = useState<"IDLE" | "SET">("IDLE");

  const handleAnalyze = useCallback(async (searchAddr: string) => {
    if (!searchAddr.startsWith("0x") || searchAddr.length !== 42) {
      setError("Invalid address");
      setData(null);
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAiReading(null);
    setLiveData(null);

    // Simulate on-chain data fetch (replace with real contract read later)
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (searchAddr.toLowerCase() !== demoAddress.toLowerCase()) {
      setError("No HashCash data found for this wallet");
      setData(null);
      setAnalyzing(false);
      return;
    }

    const minerData: MinerData = {
      pendingRewards: 450.25,
      claimFee: 15.40,
      mode: "Aggressive",
      lastClaim: "3 days ago",
    };
    setData(minerData);
    setAnalyzing(false);

    // Now call the AI Oracle with live network data
    setAiLoading(true);
    try {
      const res = await fetch("/api/claim-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendingRewards: minerData.pendingRewards,
          lastClaim: minerData.lastClaim,
          mode: minerData.mode,
        }),
      });
      if (!res.ok) throw new Error(`Oracle error ${res.status}`);
      const json = await res.json();
      setAiReading(json.aiReading);
      setLiveData(json.liveData);
    } catch (err) {
      console.error("Claim Oracle error:", err);
      setAiReading("COMMUNICATION ERROR: Oracle backend unreachable. Verify ANTHROPIC_API_KEY.");
    } finally {
      setAiLoading(false);
    }
  }, [demoAddress]);

  useEffect(() => {
    const searchAddr = searchParams.get("address");
    if (isConnected && connectedAddress && !searchAddr) {
      setAddress(connectedAddress);
      handleAnalyze(connectedAddress);
    } else if (searchAddr) {
      setAddress(searchAddr);
      handleAnalyze(searchAddr);
    }
  }, [searchParams, isConnected, connectedAddress, handleAnalyze]);

  const handleDemo = () => {
    enableDemoMode();
    setAddress(demoAddress);
    router.push(`/claim-advisor?address=${demoAddress}`);
  };

  const verdict = useMemo(() => {
    if (!data) return null;
    // If live data arrived, use its forced verdict; otherwise fall back to simple ratio
    if (liveData) {
      return {
        type: (liveData.forcedWait || liveData.roiRatio < 1.5) ? "WAIT" : "CLAIM NOW",
        isRecommended: !liveData.forcedWait && liveData.roiRatio >= 1.5,
        threshold: data.claimFee * 2.0,
      };
    }
    const threshold = data.claimFee * 2.0;
    const isRecommended = data.pendingRewards >= threshold;
    return { type: isRecommended ? "CLAIM NOW" : "WAIT", threshold, isRecommended };
  }, [data, liveData]);

  const gasColor = liveData
    ? liveData.gasRateLabel === "NORMAL" ? "text-hp-accent-green"
    : liveData.gasRateLabel === "ELEVATED" ? "text-hp-accent-amber"
    : "text-hp-accent-red"
    : "text-hp-text-muted";

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full pb-20">
      {/* SEARCH BAR */}
      <section className="bg-[rgba(13,20,36,0.8)] backdrop-blur-md border border-hp-border p-6 rounded-sm shadow-xl">
        <label className="text-xs text-hp-text-muted font-mono tracking-widest block mb-3 uppercase">
          Wallet Address Analytics
        </label>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-text-muted" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-hp-surface border border-hp-border focus:border-hp-accent-amber rounded-sm py-3 pl-10 pr-4 text-hp-text-primary font-mono text-sm outline-none transition-all"
            />
          </div>
          <button
            onClick={() => handleAnalyze(address)}
            disabled={analyzing}
            className="bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-bold px-8 py-3 rounded-sm transition-all disabled:opacity-50"
          >
            {analyzing ? "ANALYZING..." : "EXECUTE ANALYSIS"}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={handleDemo} className="text-xs font-mono text-hp-accent-blue hover:text-blue-400 underline underline-offset-4 transition-colors">
            Use demo wallet
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-hp-text-muted">
            <ShieldCheck className="w-3 h-3" />
            READ-ONLY ACCESS GRANTED
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-hp-accent-amber border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-hp-accent-amber animate-pulse tracking-widest">Fetching HashCash data...</p>
          </motion.div>

        ) : error ? (
          <motion.div key="inactive" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto">
            <div className="bg-[rgba(13,20,36,0.6)] backdrop-blur-xl border-2 border-hp-border rounded-sm overflow-hidden shadow-2xl relative">
              <div className="bg-hp-accent-red/20 border-b border-hp-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-hp-accent-red rounded-full animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.6)]" />
                  <span className="font-mono text-xs font-black tracking-widest text-hp-accent-red uppercase">NODE STATUS: OFFLINE</span>
                </div>
                <span className="font-mono text-[10px] text-hp-text-muted uppercase">Terminal v1.0.4 // Unauthorized</span>
              </div>
              <div className="p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-hp-surface border border-hp-border rounded-full flex items-center justify-center mx-auto mb-8">
                  <Power size={32} className="text-hp-text-muted" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tight">
                  No Active Miners <span className="text-hp-accent-amber">Detected</span>
                </h2>
                <p className="font-mono text-hp-text-secondary mb-12 max-w-xl mx-auto leading-relaxed">
                  Your wallet address <span className="text-hp-accent-amber">{address.slice(0, 6)}...{address.slice(-4)}</span> is currently not transmitting hashrate to the Club HashCash protocol.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
                  {[["1","Acquire Rig","Visit the official Mining Center to acquire your first mining rig."],
                    ["2","Power Up","Once minted, your miner automatically begins contributing to the pool."],
                    ["3","Track ROI","Return here to get AI-driven advice on the best time to claim."]].map(([n, t, d]) => (
                    <div key={n} className="bg-hp-surface/50 border border-hp-border p-6 rounded-sm hover:border-hp-accent-amber transition-all">
                      <div className="w-10 h-10 rounded-full bg-hp-accent-amber/10 flex items-center justify-center mb-4 border border-hp-accent-amber/30 text-hp-accent-amber font-mono font-bold">{n}</div>
                      <h3 className="font-display text-white font-bold mb-2 uppercase text-sm tracking-widest">{t}</h3>
                      <p className="font-mono text-[11px] text-hp-text-muted leading-relaxed uppercase">{d}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://hashcash.club/" target="_blank" rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-black px-10 py-4 rounded-sm transition-all flex items-center justify-center gap-3">
                    <ShoppingBag size={20} /> VISIT MINING CENTER
                  </a>
                  <button onClick={handleDemo}
                    className="w-full sm:w-auto bg-hp-surface border border-hp-border hover:text-white text-hp-text-secondary font-display font-bold px-10 py-4 rounded-sm transition-all flex items-center justify-center gap-3">
                    TRY DEMO MODE <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        ) : data && verdict ? (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* LIVE NETWORK ECONOMICS STRIP */}
            <div className="bg-hp-surface border border-hp-border rounded-sm px-6 py-4 flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center gap-2">
                {liveData?.isLive
                  ? <Wifi size={14} className="text-hp-accent-green" />
                  : <WifiOff size={14} className="text-hp-text-muted" />}
                <span className={cn("font-mono text-[10px] uppercase tracking-widest font-bold", liveData?.isLive ? "text-hp-accent-green" : "text-hp-text-muted")}>
                  {liveData?.isLive ? "LIVE NETWORK DATA" : "ESTIMATED DATA"}
                </span>
              </div>
              {liveData ? (
                <div className="flex flex-wrap gap-6 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Fuel size={12} className={gasColor} />
                    <span className="text-hp-text-muted">GAS:</span>
                    <span className={cn("font-bold", gasColor)}>{liveData.gasGwei} Gwei</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 border rounded-sm font-bold", gasColor,
                      liveData.gasRateLabel === "NORMAL" ? "border-hp-accent-green bg-hp-accent-green/10" :
                      liveData.gasRateLabel === "ELEVATED" ? "border-hp-accent-amber bg-hp-accent-amber/10" :
                      "border-hp-accent-red bg-hp-accent-red/10"
                    )}>{liveData.gasRateLabel}</span>
                  </div>
                  <div><span className="text-hp-text-muted">hCASH: </span><span className="text-hp-text-primary font-bold">${liveData.hcashUsd.toFixed(4)}</span></div>
                  <div><span className="text-hp-text-muted">AVAX: </span><span className="text-hp-text-primary font-bold">${liveData.avaxUsd.toFixed(2)}</span></div>
                  <div><span className="text-hp-text-muted">Gas Cost: </span><span className="text-hp-accent-red font-bold">${liveData.gasCostUsd.toFixed(3)}</span></div>
                  <div><span className="text-hp-text-muted">Net P&L: </span>
                    <span className={cn("font-bold", liveData.netPnlUsd >= 0 ? "text-hp-accent-green" : "text-hp-accent-red")}>
                      {liveData.netPnlUsd >= 0 ? "+" : ""}${liveData.netPnlUsd.toFixed(2)}
                    </span>
                  </div>
                  <div><span className="text-hp-text-muted">ROI Ratio: </span>
                    <span className={cn("font-bold", liveData.roiRatio >= 3 ? "text-hp-accent-green" : liveData.roiRatio >= 1.5 ? "text-hp-accent-amber" : "text-hp-accent-red")}>
                      {liveData.roiRatio}x
                    </span>
                  </div>
                </div>
              ) : (
                <div className="font-mono text-xs text-hp-text-muted animate-pulse">Fetching live market data...</div>
              )}
            </div>

            {/* HERO VERDICT CARD */}
            <div className={cn("relative border-2 rounded-sm overflow-hidden p-8 transition-colors duration-500",
              verdict.isRecommended ? "bg-hp-accent-green/5 border-hp-accent-green/30" : "bg-hp-accent-amber/5 border-hp-accent-amber/30"
            )}>
              <div className={cn("absolute inset-0 opacity-10 blur-3xl", verdict.isRecommended ? "bg-hp-accent-green" : "bg-hp-accent-amber")} />
              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start lg:justify-between">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <span className="text-xs font-mono tracking-[0.3em] text-hp-text-muted mb-2 uppercase">Claim Advisor Verdict</span>
                  <h2 className={cn("font-display text-4xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tighter",
                    verdict.isRecommended ? "text-hp-accent-green" : "text-hp-accent-amber"
                  )}>
                    {verdict.type}
                  </h2>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-sm border border-hp-border font-mono text-xs text-hp-text-secondary">
                    <TrendingUp className="w-3.5 h-3.5" />
                    STRATEGY MODE: {data.mode}
                  </div>
                </div>
                <div className="bg-hp-surface border border-hp-border p-6 rounded-sm min-w-[320px] shadow-2xl">
                  <h3 className="font-sans text-xs tracking-widest font-bold text-hp-text-muted mb-6 uppercase border-b border-hp-border pb-2">Technical Parameters</h3>
                  <div className="space-y-4 font-mono">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-hp-text-muted">Pending Rewards</span>
                      <span className="text-hp-text-primary font-bold">{data.pendingRewards.toFixed(2)} hCASH</span>
                    </div>
                    {liveData && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-hp-text-muted">Reward Value (USD)</span>
                        <span className="text-hp-text-primary font-bold">${liveData.rewardsUsd.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-hp-text-muted">Est. Gas Cost</span>
                      <span className="text-hp-accent-red font-bold">
                        {liveData ? `-${liveData.gasCostHcash.toFixed(2)} hCASH ($${liveData.gasCostUsd.toFixed(3)})` : `-${data.claimFee.toFixed(2)} hCASH`}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-hp-border border-dashed flex justify-between items-baseline">
                      <span className="text-sm text-hp-accent-amber">Net P&L</span>
                      <span className={cn("font-bold", liveData ? (liveData.netPnlUsd >= 0 ? "text-hp-accent-green" : "text-hp-accent-red") : "text-hp-text-secondary")}>
                        {liveData
                          ? `${liveData.netPnlHcash >= 0 ? "+" : ""}${liveData.netPnlHcash.toFixed(2)} hCASH`
                          : `${(data.pendingRewards - data.claimFee).toFixed(2)} hCASH`}
                      </span>
                    </div>
                    {liveData && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-hp-text-muted">ROI Efficiency</span>
                        <span className={cn("font-bold text-sm",
                          liveData.roiRatio >= 3 ? "text-hp-accent-green" :
                          liveData.roiRatio >= 1.5 ? "text-hp-accent-amber" : "text-hp-accent-red"
                        )}>
                          {liveData.roiRatio}x {liveData.roiRatio < 1.5 ? "⚠ WEAK" : liveData.roiRatio >= 3 ? "✓ STRONG" : "✓ OK"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                <button className={cn("flex-1 min-w-[160px] py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2",
                  verdict.isRecommended ? "bg-hp-accent-green hover:bg-hp-accent-green/80 text-black" : "bg-hp-surface border border-hp-border text-hp-text-secondary hover:text-white"
                )}>
                  <Zap className="w-3.5 h-3.5" /> CLAIM NOW
                </button>
                <button onClick={() => setAlertStatus("SET")}
                  className={cn("flex-1 min-w-[160px] py-2.5 bg-hp-surface border rounded-sm font-display font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2",
                    alertStatus === "SET" ? "border-hp-accent-green text-hp-accent-green" : "border-hp-border text-hp-text-secondary hover:text-white"
                  )}>
                  <Bell className="w-3.5 h-3.5" />
                  {alertStatus === "SET" ? "ALERT ACTIVE" : "SET ALERT"}
                </button>
                <button onClick={() => router.push("/dashboard")}
                  className="flex-1 min-w-[160px] py-2.5 bg-hp-surface border border-hp-border text-hp-text-secondary hover:text-white rounded-sm font-display font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5" /> VIEW FULL OPS SNAPSHOT
                </button>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-hp-text-muted uppercase tracking-widest border-t border-hp-border/30 pt-4">
                <AlertCircle className="w-3.5 h-3.5 text-hp-accent-amber" />
                {liveData?.forcedWait ? "⛔ GAS EXCEEDS REWARD VALUE — CLAIM WOULD RESULT IN NET LOSS" : "Risk: fee spikes can flip this verdict"}
              </div>
            </div>

            {/* AI ORACLE READING */}
            <div className="bg-[#050810] border-l-4 border-hp-accent-blue border-y border-r border-hp-border p-8 rounded-r-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-hp-accent-blue/20 p-2 rounded-sm">
                  <History className="w-5 h-5 text-hp-accent-blue" />
                </div>
                <h3 className="font-display text-xl font-bold text-white tracking-widest uppercase">Oracle Reading</h3>
                {liveData?.isLive && (
                  <span className="ml-auto font-mono text-[9px] text-hp-accent-green border border-hp-accent-green/30 px-2 py-0.5 rounded-sm bg-hp-accent-green/10 uppercase tracking-widest">GROUNDED IN LIVE DATA</span>
                )}
              </div>
              {aiLoading ? (
                <div className="space-y-3">
                  {[120, 90, 140, 80].map((w, i) => (
                    <div key={i} className="h-4 bg-hp-surface animate-pulse rounded-sm" style={{ width: `${w * 0.7}%` }} />
                  ))}
                  <p className="font-mono text-[10px] text-hp-text-muted animate-pulse uppercase tracking-widest mt-4">Oracle analyzing live economics...</p>
                </div>
              ) : aiReading ? (
                <div className="space-y-3 font-mono text-sm leading-loose">
                  {aiReading.split('\n').filter(Boolean).map((line, i) => {
                    const [label, ...rest] = line.split(':');
                    if (!rest.length) return <p key={i} className="text-hp-text-secondary italic">{line}</p>;
                    const isVerdict = label.trim().toUpperCase() === 'VERDICT';
                    return (
                      <div key={i} className={cn("flex flex-col md:flex-row md:gap-3", isVerdict && "py-2 border-y border-hp-border/30 my-2")}>
                        <span className={cn("font-bold shrink-0", isVerdict ? "text-hp-accent-amber text-base" : "text-hp-accent-blue")}>{label}:</span>
                        <span className={cn("text-hp-text-primary", isVerdict && "font-bold text-base")}>{rest.join(':')}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-mono text-hp-text-secondary italic">Oracle is standing by. Analyze a wallet to receive a live reading.</p>
              )}
            </div>
          </motion.div>

        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center opacity-40 grayscale">
            <div className="w-24 h-24 border border-hp-border rounded-full flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-hp-text-muted" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase mb-2 tracking-tighter">Awaiting Navigation</h3>
            <p className="font-mono text-sm max-w-sm mx-auto">
              Enter a wallet address or use the demo link to initialize the strategic claiming advisor.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClaimAdvisorPage() {
  return (
    <Suspense fallback={<div>Loading advisor...</div>}>
      <ClaimAdvisorContent />
    </Suspense>
  );
}
