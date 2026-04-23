const RAW_MINERS = [
  { id: 1, name: "Home Brew CPU Miner", tier: "Entry", hashrate: 10, power: 100, priceHCASH: 300, priceAVAX: 99999, maxSupply: 1885, description: "CPU miner. Low entry cost." },
  { id: 2, name: "DragonTech - RedDragon", tier: "Entry", hashrate: 14, power: 100, priceHCASH: 750, priceAVAX: 999, maxSupply: 125, description: "Standard GPU miner." },
  { id: 3, name: "DragonTech - RedDragon Ti", tier: "Entry", hashrate: 24, power: 300, priceHCASH: 750, priceAVAX: 99999, maxSupply: 100, description: "Enhanced GPU miner." },
  { id: 4, name: "RedDragon Quadro", tier: "Mid", hashrate: 70, power: 800, priceHCASH: 2000, priceAVAX: 50, maxSupply: 30, description: "GPU Rig. High performance." },
  { id: 5, name: "RedDragon Quadro Ti", tier: "Mid", hashrate: 110, power: 1200, priceHCASH: 2000, priceAVAX: 99999, maxSupply: 15, description: "GPU Rig. Top mid-tier." },
  { id: 6, name: "Quad Socket CPU Miner", tier: "Mid", hashrate: 40, power: 200, priceHCASH: 99999, priceAVAX: 99999, maxSupply: 325, description: "Custom Rig. High supply." },
  { id: 7, name: "RedDragon Tri-Rig", tier: "Mid", hashrate: 45, power: 400, priceHCASH: 2500, priceAVAX: 3.5, maxSupply: 25, description: "Custom Rig. Efficient." },
  { id: 8, name: "RedDragon Ti Duo-Rig", tier: "Mid", hashrate: 70, power: 700, priceHCASH: 99999, priceAVAX: 99999, maxSupply: 26, description: "Custom Rig." },
  { id: 9, name: "Lightning - G1", tier: "Entry", hashrate: 20, power: 100, priceHCASH: 750, priceAVAX: 99999, maxSupply: 100, description: "Efficient GPU." },
  { id: 10, name: "Lightning - G2", tier: "Entry", hashrate: 35, power: 200, priceHCASH: 1000, priceAVAX: 99999, maxSupply: 100, description: "Efficient GPU." },
  { id: 11, name: "HashTech ASIC Prototype", tier: "Pro", hashrate: 250, power: 2000, priceHCASH: 5000, priceAVAX: 99999, maxSupply: 0, description: "ASIC Prototype." },
  { id: 12, name: "Plasma Base", tier: "Entry", hashrate: 25, power: 100, priceHCASH: 750, priceAVAX: 99999, maxSupply: 35, description: "GPU miner." },
  { id: 13, name: "Plasma XL", tier: "Entry", hashrate: 45, power: 200, priceHCASH: 1000, priceAVAX: 99999, maxSupply: 30, description: "Enhanced GPU." },
  { id: 14, name: "HashTech 'The Beast' ASIC", tier: "Pro", hashrate: 200, power: 1000, priceHCASH: 3500, priceAVAX: 99999, maxSupply: 45, description: "High performance ASIC." },
  { id: 15, name: "WindHash Red", tier: "Pro", hashrate: 125, power: 600, priceHCASH: 3500, priceAVAX: 40, maxSupply: 10, description: "Wind powered." },
  { id: 16, name: "WindHash Blue", tier: "Elite", hashrate: 250, power: 1200, priceHCASH: 6000, priceAVAX: 60, maxSupply: 5, description: "Maximum wind power." },
  { id: 17, name: "HashTech 'Mini Beast' ASIC", tier: "Pro", hashrate: 150, power: 500, priceHCASH: 5000, priceAVAX: 99999, maxSupply: 25, description: "Compact ASIC." },
  { id: 18, name: "Plasma XXL", tier: "Pro", hashrate: 60, power: 200, priceHCASH: 5000, priceAVAX: 99999, maxSupply: 25, description: "Ultra GPU." },
  { id: 19, name: "CPU Miner v2.0", tier: "Entry", hashrate: 30, power: 100, priceHCASH: 100, priceAVAX: 99999, maxSupply: 2000, description: "Improved CPU miner." },
  { id: 20, name: "Lightning G3", tier: "Mid", hashrate: 50, power: 100, priceHCASH: 1500, priceAVAX: 99999, maxSupply: 80, description: "Next-gen GPU." },
  { id: 21, name: "Galactic Hash C", tier: "Elite", hashrate: 300, power: 600, priceHCASH: 10000, priceAVAX: 99999, maxSupply: 10, description: "Specialized performance." },
  { id: 22, name: "RedDragon TiX", tier: "Mid", hashrate: 45, power: 100, priceHCASH: 1000, priceAVAX: 99999, maxSupply: 250, description: "Elite GPU." },
  { id: 23, name: "HashTech Beast2 ASIC", tier: "Pro", hashrate: 350, power: 1000, priceHCASH: 3500, priceAVAX: 99999, maxSupply: 20, description: "ASIC power." },
  { id: 24, name: "Ennea Socket CPU Miner", tier: "Pro", hashrate: 90, power: 200, priceHCASH: 99999, priceAVAX: 99999, maxSupply: 175, description: "Custom CPU Rig." },
  { id: 25, name: "Jiga Jlant", tier: "Elite", hashrate: 150, power: 1, priceHCASH: 99999, priceAVAX: 99999, maxSupply: 25, description: "Specialized Jabba miner." },
  { id: 26, name: "Jiga Jread", tier: "Elite", hashrate: 150, power: 1, priceHCASH: 99999, priceAVAX: 99999, maxSupply: 25, description: "Specialized Jabba miner." },
  { id: 27, name: "Plasma Absolute", tier: "Elite", hashrate: 400, power: 800, priceHCASH: 10000, priceAVAX: 99999, maxSupply: 25, description: "The ultimate GPU." },
  { id: 28, name: "Jvidia JX420", tier: "Pro", hashrate: 280, power: 500, priceHCASH: 3500, priceAVAX: 99999, maxSupply: 250, description: "Pro GPU." },
  { id: 29, name: "Jvidia JX450", tier: "Pro", hashrate: 400, power: 800, priceHCASH: 5000, priceAVAX: 99999, maxSupply: 50, description: "High-end GPU." },
  { id: 30, name: "Jvidia JX500", tier: "Elite", hashrate: 500, power: 1200, priceHCASH: 7000, priceAVAX: 99999, maxSupply: 20, description: "Elite GPU." },
  { id: 31, name: "Stormcore Superconductor", tier: "Elite", hashrate: 1000, power: 1, priceHCASH: 25000, priceAVAX: 99999, maxSupply: 10, description: "Storm-powered superconductivity." },
  { id: 32, name: "Jvidia - JX 420-RC-12", tier: "Elite", hashrate: 3960, power: 2600, priceHCASH: 99999, priceAVAX: 99999, maxSupply: 20, description: "Rackmount Chassis. Maximum Density." },
];

export type Miner = typeof RAW_MINERS[0] & {
  efficiency: number;
  paybackDays: number;
  hashPerHCASH: number;
};

// Base assumption: Network hashrate is 241,850 MH/s (241.85 GH/s)
const DEFAULT_NETWORK_HASHRATE = 241850;
const BLOCKS_PER_DAY = 43200;
const REWARD_PER_BLOCK = 1.25; // Halved from 2.5 base

export const MINERS: Miner[] = RAW_MINERS.map((m) => {
  const dailyEarnings = REWARD_PER_BLOCK * (m.hashrate / DEFAULT_NETWORK_HASHRATE) * BLOCKS_PER_DAY;
  
  return {
    ...m,
    efficiency: m.hashrate / (m.power || 1),
    paybackDays: m.priceHCASH / (dailyEarnings || 1),
    hashPerHCASH: m.hashrate / (m.priceHCASH || 1),
  };
});

