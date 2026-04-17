const RAW_MINERS = [
  { id: 1, name: "USB Nano", tier: "Entry", hashrate: 0.5, power: 15, priceHCASH: 50, priceAVAX: 0.3, maxSupply: 10000, description: "Low risk starter miner. High liquidity on secondary market." },
  { id: 2, name: "Arc Miner", tier: "Entry", hashrate: 2, power: 45, priceHCASH: 180, priceAVAX: 1.1, maxSupply: 5000, description: "Best entry-level hashrate-to-cost ratio." },
  { id: 3, name: "Rig-X", tier: "Mid", hashrate: 8, power: 120, priceHCASH: 650, priceAVAX: 3.9, maxSupply: 2000, description: "Mid-tier workhorse. Excellent for Standard facilities." },
  { id: 4, name: "Plasma Core", tier: "Mid", hashrate: 15, power: 200, priceHCASH: 1100, priceAVAX: 6.6, maxSupply: 1500, description: "High efficiency mid-tier. Power-hungry but rewarding." },
  { id: 5, name: "Titan Array", tier: "Pro", hashrate: 40, power: 450, priceHCASH: 2800, priceAVAX: 16.8, maxSupply: 500, description: "Elite performance. Advanced facility required." },
  { id: 6, name: "Genesis Block", tier: "Elite", hashrate: 100, power: 900, priceHCASH: 6500, priceAVAX: 39, maxSupply: 100, description: "Rarest miner. Maximum hashrate. Elite-only." },
];

export type Miner = typeof RAW_MINERS[0] & {
  efficiency: number;
  paybackDays: number;
  hashPerHCASH: number;
};

// Base assumption: Network hashrate is 10,000 TH/s
const DEFAULT_NETWORK_HASHRATE = 10000;
const BLOCKS_PER_DAY = 43200;
const REWARD_PER_BLOCK = 2.5;

export const MINERS: Miner[] = RAW_MINERS.map((m) => {
  const dailyEarnings = REWARD_PER_BLOCK * (m.hashrate / DEFAULT_NETWORK_HASHRATE) * BLOCKS_PER_DAY;
  
  return {
    ...m,
    efficiency: m.hashrate / m.power,
    paybackDays: m.priceHCASH / (dailyEarnings || 1),
    hashPerHCASH: m.hashrate / m.priceHCASH,
  };
});
