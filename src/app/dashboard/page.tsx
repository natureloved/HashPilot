"use client";

import { motion } from "framer-motion";
import { useHashPilotAccount } from "@/hooks/useHashPilotAccount";
import { useDemoMode } from "@/components/providers/DemoProvider";
import StatCard from "@/components/dashboard/StatCard";
import HashrateChart from "@/components/dashboard/HashrateChart";
import QuickSetup from "@/components/dashboard/QuickSetup";
import DailyDigest from "@/components/dashboard/DailyDigest";

const intelData = [
  {
    id: 1,
    time: "04.18.2026 | 13:12 UTC",
    type: "SUPPLY",
    message: "Protocol transparency confirmed. Supply: 4,142,824.10 hCASH. Burned: 4,722,187.50 hCASH.",
    color: "text-hp-accent-blue",
  },
  {
    id: 2,
    time: "04.17.2026 | 14:32 UTC",
    type: "CONTRACT",
    message: "rigassembler.v2 transition detected. Assembler cost raw updated for current epoch.",
    color: "text-hp-accent-amber",
  },
  {
    id: 3,
    time: "04.17.2026 | 12:05 UTC",
    type: "NETWORK",
    message: "bigcoin.v1 hashrate spike +4.2% detected by main.v1 protocol. Difficulty adjusted.",
    color: "text-hp-accent-blue",
  },
];

export default function Dashboard() {
  const { address: connectedAddress, isConnected, isDemoMode: isDemo } = useHashPilotAccount();

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full">
      {/* Daily AI Digest */}
      <DailyDigest />

      {/* Top Section - Command Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="NETWORK HASHRATE"
          value={241.85}
          suffix="GH/s"
          type="primary"
          trend="up"
          trendValue="1.2%"
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
          title="hCASH PER BLOCK"
          value={1.25}
          type="primary"
          subValue="NEXT HALVING: 2,973,540 BLOCKS"
          delay={0.3}
        />
        <StatCard
          title="CLAIM STATUS"
          value={isDemo ? "HOLD ⛔" : "SCANNING 🔍"}
          type="warning"
          subValue={isDemo ? "Surge rates active" : "Analyzing gas floor"}
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

      {/* Bottom Section - Recent Intel */}
      <section className="mt-4">
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center gap-4 mb-6"
        >
          <h2 className="text-hp-accent-amber font-mono text-base tracking-widest shrink-0">
            LIVE INTEL FEED
          </h2>
          <div className="h-[1px] bg-hp-accent-amber/50 w-full rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {intelData.map((intel, idx) => (
            <motion.div
              key={intel.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + idx * 0.15, duration: 0.5 }}
              className="bg-[rgba(5,8,16,0.8)] border border-hp-border p-4 rounded-sm border-l-2 hover:bg-hp-surface transition-colors"
              style={{ borderLeftColor: idx === 0 ? "#F5A623" : idx === 1 ? "#00D4FF" : "#39FF14" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-hp-text-muted">{intel.time}</span>
                <span className={`font-mono text-xs font-bold tracking-widest px-2 py-0.5 rounded-sm bg-hp-surface-elevated border border-hp-border ${intel.color}`}>
                  [{intel.type}]
                </span>
              </div>
              <p className="font-sans text-base text-hp-text-primary leading-relaxed">
                <span className="text-hp-text-secondary font-mono mr-2">{'>'}</span>
                {intel.message}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

