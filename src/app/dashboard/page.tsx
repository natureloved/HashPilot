"use client";

import { useHashPilotAccount } from "@/hooks/useHashPilotAccount";
import StatCard from "@/components/dashboard/StatCard";
import HashrateChart from "@/components/dashboard/HashrateChart";
import QuickSetup from "@/components/dashboard/QuickSetup";
import DailyDigest from "@/components/dashboard/DailyDigest";
import Leaderboard from "@/components/dashboard/Leaderboard";

import { usePrices } from "@/components/providers/PriceProvider";

export default function Dashboard() {
  const { address: connectedAddress, isConnected, isDemoMode: isDemo } = useHashPilotAccount();
  const { hcash, isLoading: isPriceLoading } = usePrices();
  const [gasGwei, setGasGwei] = useState<number | null>(null);

  useEffect(() => {
    const fetchGas = async () => {
      try {
        const res = await fetch('/api/network-data');
        const data = await res.json();
        if (data.gasGwei) setGasGwei(data.gasGwei);
      } catch (e) {
        console.warn("Gas fetch failed", e);
      }
    };
    fetchGas();
  }, []);

  const gasLabel = gasGwei ? (gasGwei < 30 ? "OPTIMAL" : gasGwei < 60 ? "ELEVATED" : "SURGE") : "SCANNING";

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto h-full">
      {/* Daily AI Digest */}
      <DailyDigest />

      {/* Top Section - Command Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="NETWORK HASHRATE"
          value={311.02}
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

