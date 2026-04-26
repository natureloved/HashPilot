"use client";

import { useHashPilotAccount } from "@/hooks/useHashPilotAccount";
import StatCard from "@/components/dashboard/StatCard";
import HashrateChart from "@/components/dashboard/HashrateChart";
import QuickSetup from "@/components/dashboard/QuickSetup";
import DailyDigest from "@/components/dashboard/DailyDigest";

import LiveIntelFeed from "@/components/dashboard/LiveIntelFeed";

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

      {/* Bottom Section - Live Intel Feed */}
      <LiveIntelFeed />
    </div>
  );
}

