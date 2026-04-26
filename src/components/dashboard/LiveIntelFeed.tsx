"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrices } from "@/components/providers/PriceProvider";

interface IntelItem {
  id: number;
  time: string;
  type: "SUPPLY" | "CONTRACT" | "NETWORK" | "PRICE" | "PROTOCOL";
  message: string;
  color: string;
}

const INTEL_TYPES = {
  SUPPLY: { label: "SUPPLY", color: "text-hp-accent-blue", border: "#00D4FF" },
  CONTRACT: { label: "CONTRACT", color: "text-hp-accent-amber", border: "#F5A623" },
  NETWORK: { label: "NETWORK", color: "text-hp-accent-blue", border: "#00D4FF" },
  PRICE: { label: "PRICE", color: "text-hp-accent-green", border: "#39FF14" },
  PROTOCOL: { label: "PROTOCOL", color: "text-hp-accent-amber", border: "#F5A623" },
};

const RANDOM_MESSAGES = [
  { type: "NETWORK", text: "Hashrate spike detected in BigCoin v1 pool. Difficulty adjustment incoming." },
  { type: "CONTRACT", text: "RigAssembler v2 sync complete. Gas optimization parameters updated." },
  { type: "SUPPLY", text: "Transparency check: Supply vs Burn ratio remains deflationary." },
  { type: "PROTOCOL", text: "Main v1 node heartbeat confirmed. Peer-to-peer sync at 99.8%." },
  { type: "NETWORK", text: "Mempool congestion clearing. Projected claim fees dropping." },
  { type: "PROTOCOL", text: "Protocol governance proposal #42 finalized. View details in portal." },
];

export default function LiveIntelFeed() {
  const [items, setItems] = useState<IntelItem[]>([]);
  const { avax, hcash } = usePrices();

  // Helper to format current time
  const getFormattedTime = () => {
    const now = new Date();
    return `${now.getMonth() + 1}.${now.getDate()}.${now.getFullYear()} | ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} UTC`;
  };

  // Initial set of items
  useEffect(() => {
    const initialItems: IntelItem[] = [
      {
        id: Date.now() - 3600000,
        time: "1 hour ago",
        type: "SUPPLY",
        message: "Protocol transparency confirmed. Supply: 4,142,824.10 hCASH. Burned: 4,722,187.50 hCASH.",
        color: "text-hp-accent-blue",
      },
      {
        id: Date.now() - 1800000,
        time: "30 mins ago",
        type: "CONTRACT",
        message: "rigassembler.v2 transition detected. Assembler cost raw updated for current epoch.",
        color: "text-hp-accent-amber",
      },
      {
        id: Date.now(),
        time: "JUST NOW",
        type: "NETWORK",
        message: "bigcoin.v1 hashrate spike +4.2% detected by main.v1 protocol. Difficulty adjusted.",
        color: "text-hp-accent-blue",
      },
    ];
    setItems(initialItems);

    // Periodically add new items
    const interval = setInterval(() => {
      const isPriceUpdate = Math.random() > 0.7;
      let newItem: IntelItem;

      if (isPriceUpdate) {
        const coin = Math.random() > 0.5 ? "hCASH" : "AVAX";
        const price = coin === "hCASH" ? hcash.price : avax.price;
        newItem = {
          id: Date.now(),
          time: getFormattedTime(),
          type: "PRICE",
          message: `${coin} price volatility detected. Current: $${price.toFixed(coin === "hCASH" ? 4 : 2)}. Strategic claim windows adjusted.`,
          color: "text-hp-accent-green",
        };
      } else {
        const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
        newItem = {
          id: Date.now(),
          time: getFormattedTime(),
          type: msg.type as IntelItem["type"],
          message: msg.text,
          color: INTEL_TYPES[msg.type as keyof typeof INTEL_TYPES].color,
        };
      }

      setItems(prev => [newItem, ...prev.slice(0, 5)]); // Keep last 6 items
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, [avax.price, hcash.price]);

  return (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((intel, idx) => (
            <motion.div
              key={intel.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[rgba(5,8,16,0.8)] border border-hp-border p-4 rounded-sm border-l-2 hover:bg-hp-surface transition-colors h-full"
              style={{ borderLeftColor: INTEL_TYPES[intel.type].border }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-hp-text-muted uppercase tracking-widest">{intel.time}</span>
                <span className={`font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-sm bg-hp-surface-elevated border border-hp-border ${intel.color}`}>
                  [{intel.type}]
                </span>
              </div>
              <p className="font-sans text-sm text-hp-text-primary leading-relaxed">
                <span className="text-hp-text-secondary font-mono mr-2">{'>'}</span>
                {intel.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
