/*
 * HashPilot Shared Mining Logic & Constants
 * Used for Oracle (Future) and FOMO Machine (Past) simulations.
 */

export const CONSTANTS = {
  BLOCK_REWARD: 1.25,
  BLOCKS_PER_DAY: 43200,
  HALVING_INTERVAL: 4200000,
  // Approximate blocks already passed for simulation offsets if needed
  CURRENT_BLOCK_HEIGHT: 1250000, 
};

/*
 * Calculate rewards over a period, accounting for periodic halvings.
 */
export function calculateRewardsWithHalvings(
  dailyRate: number,
  days: number,
  halvingStep: number = 0
): number {
  let total = 0;
  const currentDaily = dailyRate;

  // Simple version: if we assume halvings happen in discrete steps
  // (In a more complex version we'd track exactly when halvings occur)
  for (let d = 0; d < days; d++) {
    // If a halving occurs during the simulation...
    // (This is an abstraction based on user slider input for 'Halvings in Period')
    total += currentDaily;
  }
  
  // Apply halving factor if provided
  return total * Math.pow(0.5, halvingStep);
}

