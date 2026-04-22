export const ARCHETYPES = [
  {
    id: "compounder",
    name: "THE COMPOUNDER",
    symbol: "⚡",
    color: "#39FF14",
    tagline: "Reinvest everything. Dominate over time.",
    description: "You play the long game. Every hCASH earned goes back into hashrate. You don't care about today's price — you're building a mining empire block by block.",
    strengths: ["Network dilution resistance", "Compound growth advantage", "Halving-resistant strategy"],
    weakness: "Illiquid if price drops suddenly. No exit buffer.",
    naturalEnemy: "liquidity_player",
    strategy: [
      "Reinvest 90%+ of hCASH earnings into new miners",
      "Upgrade facility tier before next halving",
      "Target miners with best hashrate per hCASH cost"
    ],
    triggerConditions: {
      claimFrequency: "low",
      reinvestRate: "high",
      facilityTier: ["advanced", "elite"],
      minerCount: "high"
    }
  },
  {
    id: "efficiency_hawk",
    name: "THE EFFICIENCY HAWK",
    symbol: "🎯",
    color: "#00D4FF",
    tagline: "Every watt counts. Precision over power.",
    description: "You obsess over hashrate-per-watt ratios. You'd rather run 6 perfectly optimized USB Nanos than 2 power-hungry Titans. Your facility never exceeds 90% power capacity.",
    strengths: ["Low operational cost", "Surge-resistant (low claim fees)", "Highly predictable earnings"],
    weakness: "Slower absolute hashrate growth. Can't compete in hash wars.",
    naturalEnemy: "compounder",
    strategy: [
      "Never fill facility power capacity above 85%",
      "Always choose efficiency rating over raw hashrate",
      "Claim more frequently to avoid large fee exposure"
    ],
    triggerConditions: {
      powerUtilization: "low",
      minerType: "entry_mid",
      claimFrequency: "high"
    }
  },
  {
    id: "accumulator",
    name: "THE ACCUMULATOR", 
    symbol: "🏦",
    color: "#F5A623",
    tagline: "Stack hCASH. Wait for the moment.",
    description: "You're not in this for daily income. You're building a position. hCASH stays in your wallet until the price is right. You think in cycles, not blocks.",
    strengths: ["Positioned for price appreciation", "Patient strategy", "Low fee exposure (infrequent claims)"],
    weakness: "Vulnerable to emission drops post-halving.",
    naturalEnemy: "halving_sniper",
    strategy: [
      "Claim only during Normal rate windows",
      "Hold hCASH rather than reinvesting immediately",
      "Monitor hCASH/AVAX LP for exit opportunities"
    ],
    triggerConditions: {
      claimFrequency: "very_low",
      reinvestRate: "low",
      holdBalance: "high"
    }
  },
  {
    id: "halving_sniper",
    name: "THE HALVING SNIPER",
    symbol: "⏳",
    color: "#FF6B35",
    tagline: "Time the halvings. Extract maximum value.",
    description: "Your entire strategy is built around the halving schedule. You bulk-buy before halvings, claim aggressively after, and reposition when the dust settles. The calendar is your weapon.",
    strengths: ["Pre-halving accumulation advantage", "Emission timing mastery", "Maximum extraction windows"],
    weakness: "High variance. Wrong timing = significant losses.",
    naturalEnemy: "efficiency_hawk",
    strategy: [
      "Bulk buy miners 2-3 weeks before each halving",
      "Claim all rewards within 48h post-halving",
      "Sell miners at peak post-halving hashrate"
    ],
    triggerConditions: {
      activityPattern: "halving_aligned",
      minerTurnover: "high"
    }
  },
  {
    id: "liquidity_player",
    name: "THE LIQUIDITY PLAYER",
    symbol: "🌊",
    color: "#9B59B6",
    tagline: "Miners are assets. Buy low, mine, flip high.",
    description: "You treat miner NFTs like a trading portfolio. You're on the secondary market constantly — buying undervalued miners when others panic, selling into strength, always maintaining optionality.",
    strengths: ["Can profit in any market condition", "Not dependent on emissions", "Secondary market expertise"],
    weakness: "Complex strategy. High cognitive load. Easy to overtrade.",
    naturalEnemy: "compounder",
    strategy: [
      "Track miner floor prices on secondary market daily",
      "Buy miners at <80% of expected earnings payback",
      "Sell when miner price exceeds 120% payback period"
    ],
    triggerConditions: {
      minerTurnover: "very_high",
      marketActivity: "high"
    }
  },
  {
    id: "field_recruit",
    name: "THE FIELD RECRUIT",
    symbol: "🔰",
    color: "#7B8FA6",
    tagline: "Learning the ropes. Building the foundation.",
    description: "You're newer to the game and still mapping the terrain. But you're here, you're building, and every block teaches you something. Every expert was once a recruit.",
    strengths: ["No bad habits yet", "Low sunk cost", "Full optionality"],
    weakness: "Susceptible to suboptimal setups. Still learning claim timing.",
    naturalEnemy: "none — yet",
    strategy: [
      "Start with USB/entry miners to learn mechanics",
      "Never claim during Surge rate",
      "Track your earnings daily for 2 weeks before upgrading"
    ],
    triggerConditions: {
      facilityTier: "starter",
      minerCount: "low",
      totalHashrate: "low"
    }
  }
];
