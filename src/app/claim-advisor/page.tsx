"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  AlertCircle, 
  Zap, 
  Bell, 
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  History,
  Power,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHashPilotAccount } from "@/hooks/useHashPilotAccount";
import { useDemoMode } from "@/components/providers/DemoProvider";
import { usePrices } from "@/components/providers/PriceProvider";
import { useCallback } from "react";


function ClaimAdvisorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address: connectedAddress, isConnected } = useHashPilotAccount();
  const { enableDemoMode, demoAddress } = useDemoMode();
  usePrices(); // Initialize price hook but don't destructure unused values

  const [address, setAddress] = useState(searchParams.get("address") || "");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    pendingRewards: number;
    claimFee: number;
    mode: string;
    lastClaim: string;
  } | null>(null);
  const [alertStatus, setAlertStatus] = useState<"IDLE" | "SET">("IDLE");

  const handleAnalyze = useCallback(async (searchAddr: string) => {
    if (!searchAddr.startsWith("0x") || searchAddr.length !== 42) {
      setError("Invalid address");
      setData(null);
      return;
    }

    setAnalyzing(true);
    setError(null);

    // Simulated API Call
    setTimeout(() => {
      setAnalyzing(false);
      if (searchAddr.toLowerCase() === demoAddress.toLowerCase()) {
        setData({
          pendingRewards: 450.25,
          claimFee: 15.40,
          mode: "Aggressive",
          lastClaim: "3 days ago"
        });
      } else {
        setError("No HashCash data found for this wallet");
        setData(null);
      }
    }, 1500);
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
    const threshold = data.claimFee * 2.0;
    const isRecommended = data.pendingRewards >= threshold;
    return {
      type: isRecommended ? "CLAIM NOW" : "WAIT",
      threshold,
      isRecommended
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full pb-20">
      
      {/* SEARCH BAR SECTION */}
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
          <button
            onClick={handleDemo}
            className="text-xs font-mono text-hp-accent-blue hover:text-blue-400 underline underline-offset-4 transition-colors"
          >
            Use demo wallet
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-hp-text-muted">
            <ShieldCheck className="w-3 h-3" />
            READ-ONLY ACCESS GRANTED
          </div>
        </div>
      </section>

      {/* RESULTS AREA */}
      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-12 h-12 border-4 border-hp-accent-amber border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-hp-accent-amber animate-pulse tracking-widest">
              Fetching HashCash data...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="inactive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="bg-[rgba(13,20,36,0.6)] backdrop-blur-xl border-2 border-hp-border rounded-sm overflow-hidden shadow-2xl relative">
              {/* Header Status */}
              <div className="bg-hp-accent-red/20 border-b border-hp-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 bg-hp-accent-red rounded-full animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.6)]" />
                   <span className="font-mono text-xs font-black tracking-widest text-hp-accent-red uppercase">NODE STATUS: OFFLINE</span>
                </div>
                <span className="font-mono text-[10px] text-hp-text-muted uppercase">Terminal v1.0.4 // Unauthorized</span>
              </div>

              <div className="p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-hp-surface border border-hp-border rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <Power size={32} className="text-hp-text-muted" />
                </div>
                
                <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tight">
                  No Active Miners <span className="text-hp-accent-amber">Detected</span>
                </h2>
                
                <p className="font-mono text-hp-text-secondary mb-12 max-w-xl mx-auto leading-relaxed">
                  Your wallet address <span className="text-hp-accent-amber">{address.slice(0, 6)}...{address.slice(-4)}</span> is currently not transmitting hashrate to the Club HashCash protocol. Initialize your mining operation to start earning hCASH.
                </p>

                {/* ONBOARDING STEPS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
                   <div className="bg-hp-surface/50 border border-hp-border p-6 rounded-sm group hover:border-hp-accent-amber transition-all">
                      <div className="w-10 h-10 rounded-full bg-hp-accent-amber/10 flex items-center justify-center mb-4 border border-hp-accent-amber/30 text-hp-accent-amber font-mono font-bold">1</div>
                      <h3 className="font-display text-white font-bold mb-2 uppercase text-sm tracking-widest">Acquire Rig</h3>
                      <p className="font-mono text-[11px] text-hp-text-muted leading-relaxed uppercase">Visit the official RigAssembler to mint your first mining rig.</p>
                   </div>
                   <div className="bg-hp-surface/50 border border-hp-border p-6 rounded-sm group hover:border-hp-accent-amber transition-all">
                      <div className="w-10 h-10 rounded-full bg-hp-accent-amber/10 flex items-center justify-center mb-4 border border-hp-accent-amber/30 text-hp-accent-amber font-mono font-bold">2</div>
                      <h3 className="font-display text-white font-bold mb-2 uppercase text-sm tracking-widest">Power Up</h3>
                      <p className="font-mono text-[11px] text-hp-text-muted leading-relaxed uppercase">Once minted, your miner automatically begins contributing to the pool.</p>
                   </div>
                   <div className="bg-hp-surface/50 border border-hp-border p-6 rounded-sm group hover:border-hp-accent-amber transition-all">
                      <div className="w-10 h-10 rounded-full bg-hp-accent-amber/10 flex items-center justify-center mb-4 border border-hp-accent-amber/30 text-hp-accent-amber font-mono font-bold">3</div>
                      <h3 className="font-display text-white font-bold mb-2 uppercase text-sm tracking-widest">Track ROI</h3>
                      <p className="font-mono text-[11px] text-hp-text-muted leading-relaxed uppercase">Return here to get AI-driven advice on the best time to claim.</p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a 
                    href="https://clubhash.cash/rig-assembler" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-black px-10 py-4 rounded-sm transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,166,35,0.3)]"
                  >
                    <ShoppingBag size={20} />
                    VISIT RIG ASSEMBLER
                  </a>
                  <button 
                    onClick={handleDemo}
                    className="w-full sm:w-auto bg-hp-surface border border-hp-border hover:text-white text-hp-text-secondary font-display font-bold px-10 py-4 rounded-sm transition-all flex items-center justify-center gap-3"
                  >
                    TRY DEMO MODE
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Decorative scanline */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </div>
          </motion.div>
        ) : data && verdict ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* HERO VERDICT CARD */}
            <div className={cn(
              "relative border-2 rounded-sm overflow-hidden p-8 transition-colors duration-500",
              verdict.isRecommended 
                ? "bg-hp-accent-green/5 border-hp-accent-green/30" 
                : "bg-hp-accent-amber/5 border-hp-accent-amber/30"
            )}>
              {/* Pulse background */}
              <div className={cn(
                "absolute inset-0 opacity-10 blur-3xl",
                verdict.isRecommended ? "bg-hp-accent-green" : "bg-hp-accent-amber"
              )} />

              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start lg:justify-between">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <span className="text-xs font-mono tracking-[0.3em] text-hp-text-muted mb-2 uppercase">Claim Advisor Verdict</span>
                  <h2 className={cn(
                    "font-display text-7xl md:text-8xl font-black mb-4 tracking-tighter",
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
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-hp-text-muted">Estimated Claim Fee</span>
                      <span className="text-hp-accent-red font-bold">-{data.claimFee.toFixed(2)} hCASH</span>
                    </div>
                    <div className="pt-2 border-t border-hp-border border-dashed flex justify-between items-baseline group relative">
                      <span className="text-sm text-hp-accent-amber cursor-help flex items-center gap-1">
                        Breakeven Threshold
                        <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible bg-hp-surface-elevated border border-hp-border p-3 rounded-sm w-56 text-xs text-hp-text-secondary normal-case leading-tight z-50">
                          Analysis suggests waiting until rewards are at least 2.0x the claim fee for optimal efficiency.
                        </div>
                      </span>
                      <span className="text-hp-text-secondary font-bold">{verdict.threshold.toFixed(2)} hCASH</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                <button className={cn(
                  "flex-1 min-w-[160px] py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2",
                  verdict.isRecommended 
                    ? "bg-hp-accent-green hover:bg-hp-accent-green/80 text-black" 
                    : "bg-hp-surface border border-hp-border text-hp-text-secondary hover:text-white"
                )}>
                  <Zap className="w-3.5 h-3.5" />
                  CLAIM NOW
                </button>
                <button 
                  onClick={() => setAlertStatus("SET")}
                  className={cn(
                    "flex-1 min-w-[160px] py-2.5 bg-hp-surface border rounded-sm font-display font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2",
                    alertStatus === "SET" ? "border-hp-accent-green text-hp-accent-green" : "border-hp-border text-hp-text-secondary hover:text-white"
                  )}
                >
                  <Bell className="w-3.5 h-3.5" />
                  {alertStatus === "SET" ? "ALERT ACTIVE" : "SET ALERT"}
                </button>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 min-w-[160px] py-2.5 bg-hp-surface border border-hp-border text-hp-text-secondary hover:text-white rounded-sm font-display font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  VIEW FULL OPS SNAPSHOT
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs font-mono text-hp-text-muted uppercase tracking-widest border-t border-hp-border/30 pt-4">
                <AlertCircle className="w-3.5 h-3.5 text-hp-accent-amber" />
                Risk: fee spikes can flip this verdict
              </div>
            </div>

            {/* AI EXPLANATION SECTION */}
            <div className="bg-[#050810] border-l-4 border-hp-accent-blue border-y border-r border-hp-border p-8 rounded-r-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-hp-accent-blue/20 p-2 rounded-sm">
                    <History className="w-5 h-5 text-hp-accent-blue" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white tracking-widest uppercase">Intelligent Analysis</h3>
               </div>
                <p className="font-mono text-base text-hp-text-primary leading-relaxed pb-2">
                  Your node has accumulated <span className="text-white">{data.pendingRewards} hCASH</span> over the last <span className="text-white">{data.lastClaim}</span>. 
                  Current network conditions indicate a {verdict.isRecommended ? "favorable" : "challenging"} window for claims. 
                </p>
                <p className="font-mono text-base text-hp-text-primary leading-relaxed">
                  {verdict.isRecommended 
                    ? ` Your current rewards represent ${(data.pendingRewards / data.claimFee).toFixed(1)}x the estimated gas floor, well above the 2.0x efficiency threshold. Reclaiming now minimizes protocol risk.` 
                    : ` Your current accumulation is under the recommended 2.0x threshold (${(data.pendingRewards / data.claimFee).toFixed(1)}x gas coverage). Waiting for further accrual or a gas dip is structurally superior for your ROI.`}
                </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center opacity-40 grayscale"
          >
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

