"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, ArrowRight, ShieldCheck, Activity, TrendingUp, Globe, Cpu, Zap, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoMode } from "@/components/providers/DemoProvider";
import { useHashPilotAccount } from "@/hooks/useHashPilotAccount";
import { usePrices } from "@/components/providers/PriceProvider";

export default function Home() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const { address: connectedAddress, isConnected } = useHashPilotAccount();
  const { enableDemoMode, demoAddress } = useDemoMode();
  const { avax, hcash } = usePrices();

  // Sync with connected wallet
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setAddress(connectedAddress);
    }
  }, [isConnected, connectedAddress]);

  const handleAnalyze = (e?: React.FormEvent) => {
    e?.preventDefault();
    const targetAddress = isConnected && connectedAddress ? connectedAddress : address;
    if (targetAddress.trim()) {
      router.push(`/claim-advisor?address=${targetAddress.trim()}`);
    }
  };

  const handleDemo = () => {
    enableDemoMode();
    setAddress(demoAddress);
    setTimeout(() => {
      router.push(`/claim-advisor?address=${demoAddress}`);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center px-4 pt-20 md:pt-32 pb-32 max-w-6xl mx-auto">
      {/* 1. HERO SECTION (Above the fold focus) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full text-center mb-24 relative z-10"
      >
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-8 uppercase leading-[1.1]">
          HashPilot for <br />
          <span className="text-hp-accent-amber drop-shadow-[0_0_20px_rgba(245,166,35,0.4)]">
            Club HashCash Miners
          </span>
        </h1>

        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="bg-hp-accent-amber/10 border border-hp-accent-amber/30 px-6 py-2 rounded-full flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-hp-accent-amber" />
            <span className="text-[11px] font-mono font-bold tracking-[0.3em] text-hp-accent-amber uppercase">
              Terminal Authorized v1.0
            </span>
          </div>
          
          {isConnected ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-mono text-hp-accent-green uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-hp-accent-green shadow-[0_0_8px_rgba(57,255,10,0.6)] animate-pulse" />
              PROTOCOL SYNCED // NODE ACTIVE
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-mono text-hp-accent-amber uppercase tracking-[0.2em] animate-pulse flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-hp-accent-amber shadow-[0_0_8px_rgba(245,166,35,0.6)]" />
              Connect wallet to initialize full protocol experience
            </motion.div>
          )}
        </div>

        <p className="font-mono text-lg md:text-xl text-hp-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Input a wallet address <span className="text-hp-accent-amber">or connect your portal</span> to access real-time <span className="text-hp-accent-green font-bold">claim-cycle intelligence</span>.
        </p>

        <form 
          onSubmit={handleAnalyze}
          className="relative max-w-2xl mx-auto mb-6 group"
        >
          <div className="relative mb-4">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-hp-text-muted group-focus-within:text-hp-accent-amber transition-colors">
              <Wallet className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste your wallet address (0x...)"
              className="w-full bg-[rgba(5,11,24,0.7)] backdrop-blur-xl border-2 border-hp-border focus:border-hp-accent-amber rounded-sm py-6 pl-14 pr-4 text-hp-text-primary font-mono text-lg outline-none transition-all shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            />
          </div>

          <button
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full max-w-md mx-auto bg-hp-accent-amber hover:bg-amber-400 text-hp-background font-display font-black py-3 md:py-4 rounded-sm transition-all flex items-center justify-center gap-4 group relative overflow-hidden shadow-[0_0_25px_rgba(245,166,35,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-3 text-sm md:text-lg tracking-widest">
              ANALYZE MY WALLET
              <ArrowRight className={cn("w-5 h-5 transition-transform", isHovered ? "translate-x-1" : "")} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-[12px] font-mono text-hp-text-muted tracking-widest uppercase flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Read only. No transactions.
            </p>
            <div className="hidden md:block w-px h-3 bg-hp-border" />
            <button
              type="button"
              onClick={handleDemo}
              className="text-[12px] font-mono text-hp-accent-blue hover:text-blue-400 underline underline-offset-4 transition-colors uppercase tracking-widest"
            >
              Use demo wallet
            </button>
          </div>
        </form>
      </motion.div>

      {/* 2. "HOW IT WORKS" ROW (Immediate value prop) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-32 z-10"
      >
        {[
          { step: "1", title: "Sync Wallet", desc: "Connect or Paste address", icon: Wallet },
          { step: "2", title: "Get verdict", desc: "Claim now vs Wait", icon: Activity },
          { step: "3", title: "Take action", desc: "Claim, Alert, View ops", icon: ArrowRight },
        ].map((item, idx) => (
          <div key={idx} className="bg-hp-surface/40 backdrop-blur-sm border border-hp-border p-8 rounded-sm hover:border-hp-accent-amber/50 transition-all group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-hp-accent-amber/10 flex items-center justify-center text-hp-accent-amber font-mono font-black border border-hp-accent-amber/30">
                {item.step}
              </div>
              <h3 className="font-display text-xl text-white group-hover:text-hp-accent-amber transition-colors font-bold uppercase tracking-tight">
                {item.title}
              </h3>
            </div>
            <p className="font-mono text-xs text-hp-text-muted uppercase tracking-[0.2em]">
              {item.desc}
            </p>
          </div>
        ))}
      </motion.div>
      
      {/* 3. ECOSYSTEM STATS (Live Data) */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="w-full mb-32 z-10"
      >
        <div className="flex items-center gap-4 mb-8">
           <h2 className="font-display text-2xl font-bold text-white uppercase tracking-tight">ECOSYSTEM STATUS</h2>
           <div className="h-px bg-hp-border flex-1" />
           <div className="flex items-center gap-2 text-[10px] font-mono text-hp-accent-green">
              <div className="w-1.5 h-1.5 bg-hp-accent-green rounded-full animate-pulse" />
              LIVE DATA STREAM
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatBox 
             label="hCASH" 
             value={`$${hcash.price.toFixed(4)}`} 
             change={hcash.change24h} 
             icon={TrendingUp} 
             color="text-hp-accent-amber"
           />
           <StatBox 
             label="AVAX PRICE" 
             value={`$${avax.price.toFixed(2)}`} 
             change={avax.change24h} 
             icon={Globe} 
             color="text-hp-accent-blue"
           />
           <StatBox 
             label="MINERS TRACKED" 
             value="12,842" 
             sub="Across 4 Tiers" 
             icon={Cpu} 
             color="text-hp-accent-green"
           />
           <StatBox 
             label="CLAIM EFFICIENCY" 
             value="94.2%" 
             sub="Avg. User ROI Boost" 
             icon={Zap} 
             color="text-hp-accent-amber"
           />
        </div>
      </motion.div>

      {/* 4. CHANGELOG / WHAT'S NEW */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl mb-32 z-10"
      >
        <div className="bg-hp-surface/30 backdrop-blur-md border border-hp-border rounded-sm p-8 md:p-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
             <ListChecks size={200} />
           </div>
           
           <h2 className="font-display text-3xl font-bold text-white mb-8 flex items-center gap-4 uppercase tracking-tighter">
             <ListChecks className="text-hp-accent-amber" /> What&apos;s New
           </h2>

           <div className="space-y-8">
              <ChangelogItem 
                date="APR 26, 2026" 
                tag="MAJOR"
                title="Unified Demo Protocol & Live Markets"
                desc="Launched fully functional Demo Mode with unified state management. Integrated live DexScreener and CoinGecko feeds for real-time portfolio tracking."
              />
              <ChangelogItem 
                date="APR 24, 2026" 
                tag="UPDATE"
                title="AI Claim Optimization v1.2"
                desc="Enhanced the Claim Advisor with more aggressive gas-floor analysis. Added 'Whale Status' detection for high-hashrate nodes."
              />
              <ChangelogItem 
                date="APR 22, 2026" 
                tag="FIX"
                title="Identity Scan Resolution"
                desc="Optimized the Archetype Identity Scan performance and fixed UI scaling issues on ultra-wide terminals."
              />
           </div>
        </div>
      </motion.div>

    </div>
  );
}

function StatBox({ label, value, change, sub, icon: Icon, color }: { 
  label: string; 
  value: string; 
  change?: number; 
  sub?: string; 
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-hp-surface/40 border border-hp-border p-6 rounded-sm relative group hover:border-white/20 transition-all">
       <Icon className={cn("absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity", color)} size={40} />
       <p className="font-mono text-[10px] text-hp-text-muted tracking-[0.2em] mb-2 uppercase">{label}</p>
       <p className="font-display text-2xl font-bold text-white mb-1">{value}</p>
       {change !== undefined ? (
         <p className={cn("font-mono text-[10px] font-bold uppercase", change >= 0 ? "text-hp-accent-green" : "text-hp-accent-red")}>
           {change >= 0 ? "+" : ""}{change.toFixed(2)}% <span className="opacity-50">24H</span>
         </p>
       ) : (
         <p className="font-mono text-[10px] text-hp-text-secondary uppercase">{sub}</p>
       )}
    </div>
  );
}

function ChangelogItem({ date, title, desc, tag }: { date: string; title: string; desc: string; tag: string }) {
  return (
    <div className="relative pl-8 border-l border-hp-border pb-2 last:border-0 last:pb-0">
       <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-hp-accent-amber" />
       <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <span className="font-mono text-[10px] text-hp-accent-amber font-bold tracking-widest">{date}</span>
          <span className={cn(
            "text-[8px] font-black px-1.5 py-0.5 rounded-sm w-max tracking-tighter",
            tag === "MAJOR" ? "bg-hp-accent-red text-white" : tag === "UPDATE" ? "bg-hp-accent-blue text-white" : "bg-hp-surface text-hp-text-muted border border-hp-border"
          )}>{tag}</span>
       </div>
       <h3 className="font-display text-lg text-white font-bold mb-2 uppercase tracking-tight">{title}</h3>
       <p className="font-mono text-xs text-hp-text-secondary leading-relaxed max-w-2xl">{desc}</p>
    </div>
  );
}

