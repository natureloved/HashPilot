"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Simulated 14-day network hashrate (TH/s)
const data = [
  { day: "04.04", hashrate: 6800 },
  { day: "04.05", hashrate: 7100 },
  { day: "04.06", hashrate: 6900 },
  { day: "04.07", hashrate: 7400 },
  { day: "04.08", hashrate: 7600 },
  { day: "04.09", hashrate: 7550 },
  { day: "04.10", hashrate: 7800 },
  { day: "04.11", hashrate: 8100 },
  { day: "04.12", hashrate: 8050 },
  { day: "04.13", hashrate: 8200 },
  { day: "04.14", hashrate: 8250 },
  { day: "04.15", hashrate: 8300 },
  { day: "04.16", hashrate: 8400 },
  { day: "04.17", hashrate: 8420 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-hp-surface-elevated border border-hp-border p-3 rounded-sm shadow-xl font-mono text-xs">
        <p className="text-hp-text-muted mb-1">{label}</p>
        <p className="text-hp-accent-amber font-bold flex items-center gap-2">
          {payload[0].value.toLocaleString()} <span className="text-hp-text-secondary font-normal">TH/s</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function HashrateChart({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6 }}
      className="h-full w-full bg-transparent flex flex-col"
    >
      <div className="mb-4 flex items-center justify-between px-2">
        <h3 className="font-sans uppercase text-hp-text-secondary text-sm tracking-widest font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-hp-accent-amber block rounded-sm"></span>
          NETWORK HASHRATE TREND
        </h3>
        <span className="font-mono text-xs text-hp-text-muted bg-hp-surface-elevated px-2 py-1 rounded-sm border border-hp-border">
          14 DAYS
        </span>
      </div>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHashrate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5A623" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fill: "#3D5070", fontSize: 10, fontFamily: "monospace" }} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              tick={{ fill: "#3D5070", fontSize: 10, fontFamily: "monospace" }} 
              axisLine={false} 
              tickLine={false} 
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F5A623', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="hashrate"
              stroke="#F5A623"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorHashrate)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

