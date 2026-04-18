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
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrices } from "@/components/providers/PriceProvider";

const DEMO_WALLET = "0x8f9a59b6574f9bf10398863673c6c06a6c0735d9";

function ClaimAdvisorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  useEffect(() => {
    const addr = searchParams.get("address");
    if (addr) {
      handleAnalyze(addr);
    }
  }, [searchParams]);

  const handleAnalyze = async (searchAddr: string) => {
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
      if (searchAddr.toLowerCase() === DEMO_WALLET.toLowerCase()) {
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
  };

  const handleDemo = () => {
    setAddress(DEMO_WALLET);
    router.push(`/claim-advisor?address=${DEMO_WALLET}`);
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
        <label className="text-[10px] text-hp-text-muted font-mono tracking-widest block mb-3 uppercase">
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
            className="text-[10px] font-mono text-hp-accent-blue hover:text-blue-400 underline underline-offset-4 transition-colors"
          >
            Use demo wallet
          </button>
          <div className="flex items-center gap-2 font-mono text-[10px] text-hp-text-muted">
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
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-hp-accent-red/10 border border-hp-accent-red/30 p-8 rounded-sm text-center"
          >
            <AlertCircle className="w-12 h-12 text-hp-accent-red mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-hp-accent-red mb-2 uppercase tracking-tight">Analysis Failed</h2>
            <p className="font-mono text-hp-text-secondary">{error}</p>
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
                  <span className="text-[10px] font-mono tracking-[0.3em] text-hp-text-muted mb-2 uppercase">Claim Advisor Verdict</span>
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
                  <h3 className="font-sans text-[10px] tracking-widest font-bold text-hp-text-muted mb-6 uppercase border-b border-hp-border pb-2">Technical Parameters</h3>
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
                      <span className="text-xs text-hp-accent-amber cursor-help flex items-center gap-1">
                        Breakeven Threshold
                        <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible bg-hp-surface-elevated border border-hp-border p-2 rounded-sm w-48 text-[10px] text-hp-text-secondary normal-case leading-tight z-50">
                          Analysis suggests waiting until rewards are at least 2.0x the claim fee for optimal efficiency.
                        </div>
                      </span>
                      <span className="text-hp-text-secondary font-bold">{verdict.threshold.toFixed(2)} hCASH</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-4 relative z-10">
                <button className={cn(
                  "flex-1 min-w-[200px] py-4 rounded-sm font-display font-bold tracking-widest transition-all flex items-center justify-center gap-2",
                  verdict.isRecommended 
                    ? "bg-hp-accent-green hover:bg-hp-accent-green/80 text-black" 
                    : "bg-hp-surface border border-hp-border text-hp-text-secondary hover:text-white"
                )}>
                  <Zap className="w-4 h-4" />
                  CLAIM NOW
                </button>
                <button className="flex-1 min-w-[200px] py-4 bg-hp-surface border border-hp-border text-hp-text-secondary hover:text-white rounded-sm font-display font-bold tracking-widest transition-all flex items-center justify-center gap-2">
                  <Bell className="w-4 h-4" />
                  SET ALERT
                </button>
                <button className="flex-1 min-w-[200px] py-4 bg-hp-surface border border-hp-border text-hp-text-secondary hover:text-white rounded-sm font-display font-bold tracking-widest transition-all flex items-center justify-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  VIEW FULL OPS SNAPSHOT
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-hp-text-muted uppercase tracking-widest border-t border-hp-border/30 pt-4">
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
               <p className="font-mono text-hp-text-secondary leading-relaxed first-letter:text-hp-accent-blue first-letter:text-2xl first-letter:font-bold first-letter:float-left first-letter:mr-2">
                 Your node has accumulated <span className="text-white">{data.pendingRewards} hCASH</span> over the last <span className="text-white">{data.lastClaim}</span>. 
                 Current network conditions indicate a {verdict.isRecommended ? "favorable" : "challenging"} window for claims. 
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
