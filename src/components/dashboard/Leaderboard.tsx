"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowUp, ArrowDown, Activity, Loader2 } from "lucide-react";

interface MinerData {
  id: number;
  rank: number;
  address: string;
  score: number;
  change: string;
  tier: string;
}

export default function Leaderboard({ delay = 0 }: { delay?: number }) {
  const [data, setData] = useState<MinerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const result = await response.json();
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="mt-6 w-full"
    >
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-hp-accent-amber font-mono text-base tracking-widest shrink-0 flex items-center gap-2">
          <Trophy size={18} /> EFFICIENCY LEADERBOARD
        </h2>
        <div className="h-[1px] bg-hp-accent-amber/50 w-full rounded-full" />
      </div>

      <div className="bg-[rgba(5,8,16,0.8)] border border-hp-border rounded-sm overflow-hidden">
        <div className="grid grid-cols-5 md:grid-cols-6 gap-4 p-4 border-b border-hp-border/50 bg-hp-surface text-hp-text-muted font-mono text-[10px] uppercase tracking-widest">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-2 md:col-span-2">Miner Address</div>
          <div className="hidden md:block col-span-1 text-center">Facility</div>
          <div className="col-span-1 text-right">Score</div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 text-hp-accent-amber">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="flex flex-col">
            {data.map((miner, idx) => (
              <motion.div
                key={miner.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + idx * 0.1, duration: 0.4 }}
                className="grid grid-cols-5 md:grid-cols-6 gap-4 p-4 items-center border-b border-hp-border/30 last:border-0 hover:bg-hp-surface/60 transition-colors"
              >
                <div className="col-span-1 text-center">
                  <span className={`font-display text-xl font-bold ${
                    miner.rank === 1 ? "text-hp-accent-amber" :
                    miner.rank === 2 ? "text-[#E8EDF5]" :
                    miner.rank === 3 ? "text-[#CD7F32]" : "text-hp-text-secondary"
                  }`}>
                    #{miner.rank}
                  </span>
                </div>
                <div className="col-span-2 md:col-span-2 font-mono text-sm text-hp-text-primary">
                  {miner.address}
                </div>
                <div className="hidden md:flex col-span-1 justify-center">
                  <span className={`font-mono text-[10px] px-2 py-1 rounded-sm border ${
                    miner.tier === "ELITE" ? "border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10" :
                    miner.tier === "ADVANCED" ? "border-hp-accent-amber text-hp-accent-amber bg-hp-accent-amber/10" :
                    "border-hp-text-muted text-hp-text-secondary bg-hp-surface"
                  }`}>
                    {miner.tier}
                  </span>
                </div>
                <div className="col-span-1 text-right font-display text-lg text-hp-accent-green font-bold">
                  {miner.score}
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  {miner.change === "up" && <ArrowUp size={16} className="text-hp-accent-green" />}
                  {miner.change === "down" && <ArrowDown size={16} className="text-hp-accent-red" />}
                  {miner.change === "same" && <Activity size={16} className="text-hp-text-muted" />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
