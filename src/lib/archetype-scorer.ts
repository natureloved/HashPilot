/**
 * Archetype Scorer Logic
 * Maps quiz answers to specific archetype weights.
 */

type ArchetypeId = "compounder" | "efficiency_hawk" | "accumulator" | "halving_sniper" | "liquidity_player" | "field_recruit";

const WEIGHTS: Record<number, Record<string, Partial<Record<ArchetypeId, number>>>> = {
  0: { // Q1: Claim Pattern
    "A": { "efficiency_hawk": 2, "liquidity_player": 1 },
    "B": { "accumulator": 2, "efficiency_hawk": 1 },
    "C": { "compounder": 2, "accumulator": 1 },
    "D": { "field_recruit": 2 }
  },
  1: { // Q2: hCASH Usage
    "A": { "compounder": 3, "halving_sniper": 1 },
    "B": { "accumulator": 3, "liquidity_player": 1 },
    "C": { "efficiency_hawk": 2, "liquidity_player": 1 },
    "D": { "field_recruit": 2 }
  },
  2: { // Q3: Miner Choice
    "A": { "compounder": 2, "halving_sniper": 2 },
    "B": { "efficiency_hawk": 3 },
    "C": { "liquidity_player": 3 },
    "D": { "field_recruit": 2 }
  },
  3: { // Q4: Halvings
    "A": { "halving_sniper": 4 },
    "B": { "field_recruit": 2 },
    "C": { "accumulator": 2, "compounder": 1 },
    "D": { "field_recruit": 3 }
  },
  4: { // Q5: Primary Goal
    "A": { "compounder": 3, "accumulator": 1 },
    "B": { "efficiency_hawk": 3 },
    "C": { "liquidity_player": 3, "halving_sniper": 1 },
    "D": { "field_recruit": 3 }
  },
  5: { // Q6: Network Jump
    "A": { "compounder": 2, "halving_sniper": 1 },
    "B": { "efficiency_hawk": 2 },
    "C": { "liquidity_player": 2, "accumulator": 1 },
    "D": { "field_recruit": 2 }
  }
};

const OPTIONS = ["A", "B", "C", "D"];

export function calculateArchetype(answers: number[]): ArchetypeId {
  const scores: Record<ArchetypeId, number> = {
    compounder: 0,
    efficiency_hawk: 0,
    accumulator: 0,
    halving_sniper: 0,
    liquidity_player: 0,
    field_recruit: 0
  };

  answers.forEach((ansIndex, qIndex) => {
    const char = OPTIONS[ansIndex];
    if (WEIGHTS[qIndex] && WEIGHTS[qIndex][char]) {
      const weight = WEIGHTS[qIndex][char];
      Object.entries(weight).forEach(([id, val]) => {
        scores[id as ArchetypeId] += val;
      });
    }
  });

  // Return the one with highest score
  return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as ArchetypeId;
}
