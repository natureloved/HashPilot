"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ShieldCheck } from "lucide-react";
import { useHashPilotAccount } from "@/hooks/useHashPilotAccount";
import StatCard from "@/components/dashboard/StatCard";
import HashrateChart from "@/components/dashboard/HashrateChart";
import QuickSetup from "@/components/dashboard/QuickSetup";
import DailyDigest from "@/components/dashboard/DailyDigest";
import Leaderboard from "@/components/dashboard/Leaderboard";
import LiveIntelFeed from "@/components/dashboard/LiveIntelFeed";

import { usePrices } from "@/components/providers/PriceProvider";

export default function Dashboard() {
  const { address: connectedAddress, isConnected, isDemoMode: isDemo } = useHashPilotAccount();
  const { hcash, isLoading: isPriceLoading } = usePrices();
  const [gasGwei, setGasGwei] = useState<number | null>(null);
  const [networkHashrate, setNetworkHashrate] = useState<number | null>(null);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const res = await fetch('/api/network-data');
        const data = await res.json();
        if (data.gasGwei) setGasGwei(data.gasGwei);
        if (data.networkHashrateGH) setNetworkHashrate(data.networkHashrateGH);
      } catch (e) {
        console.warn("Network data fetch failed", e);
      }
    };
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const gasLabel = gasGwei ? (gasGwei < 30 ? "OPTIMAL" : gasGwei < 60 ? "ELEVATED" : "SURGE") : "SCANNING";

  const isOptimal = gasGwei && gasGwei < 35 && hcash.price > 4.0;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full">
      {/* Strategic Opportunity Banner */}
      <AnimatePresence>
        {isOptimal && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-hp-accent-green/10 border-2 border-hp-accent-green p-4 rounded-sm relative overflow-hidden flex items-center justify-between group shadow-[0_0_20px_rgba(57,255,20,0.1)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-hp-accent-green/20 flex items-center justify-center text-hp-accent-green animate-pulse">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="font-display font-bold text-white uppercase tracking-tight">CRITICAL OPPORTUNITY: OPTIMAL CLAIM WINDOW</h4>
                <p className="text-[10px] font-mono text-hp-accent-green uppercase tracking-widest">Low Gas ({gasGwei} GWEI) + Bullish Price Action detected. Efficiency yield maximized.</p>
              </div>
            </div>
            <button className="bg-hp-accent-green text-black px-4 py-2 font-display font-bold text-xs uppercase tracking-widest hover:bg-white transition-all">
              EXECUTE CLAIM
            </button>
            <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
               <ShieldCheck size={100} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily AI Digest */}
      <DailyDigest />

      {/* Top Section - Command Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="NETWORK HASHRATE"
          value={networkHashrate ?? 420.83}
          suffix="GH/s"
          type={networkHashrate ? "primary" : "warning"}
          subValue={networkHashrate ? "LIVE" : "~ APPROX. LAST KNOWN"}
          delay={0.1}
        />
        <StatCard
          title="YOUR HASHRATE SHARE"
          value={isDemo ? 0.25 : 0.0}
          suffix="%"
          type={isDemo ? "primary" : "warning"}
          subValue={isConnected ? (isDemo ? "Demo Node Active" : `Node ${connectedAddress?.slice(0, 6)}... Syncing`) : "Input setup below"}
          delay={0.2}
        />
        <StatCard
          title="hCASH PRICE (USD)"
          value={hcash.price}
          type="primary"
          suffix=""
          trend={hcash.change24h >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(hcash.change24h).toFixed(1)}%`}
          subValue={isPriceLoading ? "Syncing..." : "DEX SCREENER LIVE"}
          delay={0.3}
        />
        <StatCard
          title="CLAIM STATUS"
          value={isDemo ? (gasGwei && gasGwei > 60 ? "HOLD ⛔" : "READY ✅") : gasLabel}
          type={gasGwei && gasGwei > 60 ? "warning" : "primary"}
          subValue={gasGwei ? `${gasGwei} GWEI // ${gasLabel}` : "Analyzing gas floor"}
          delay={0.4}
        />
      </section>

      {/* Middle Section - Asymmetric Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
        {/* Left Column 60% */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[rgba(13,20,36,0.6)] backdrop-blur-md rounded-sm p-6 flex flex-col items-center justify-center border border-transparent">
           <HashrateChart delay={0.6} />
        </div>
        
        {/* Right Column 40% */}
        <div className="lg:col-span-5 xl:col-span-4">
           <QuickSetup delay={0.7} />
        </div>
      </section>

      {/* Bottom Section - Leaderboard & Live Intel Feed */}
      <Leaderboard delay={0.8} />
      <LiveIntelFeed />
    </div>
  );
}

