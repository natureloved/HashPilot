import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Standard claim tx on Avalanche-C costs roughly 21,000–65,000 gas
// HashCash claim functions average ~45,000 gas
const CLAIM_GAS_UNITS = 45_000;

export async function POST(request: NextRequest) {
  try {
    const { pendingRewards, lastClaim, mode } = await request.json();

    // ── 1. Fetch live network data ──────────────────────────────────────────
    const networkDataUrl = new URL('/api/network-data', request.url);
    const networkRes = await fetch(networkDataUrl.toString(), { cache: 'no-store' });
    const network = await networkRes.json();

    const gasGwei: number  = network.gasGwei  ?? 30;   // fallback 30 Gwei
    const hcashUsd: number = network.hcashUsd ?? 14.20; // fallback
    const avaxUsd: number  = network.avaxUsd  ?? 34.50; // fallback
    const isLive: boolean  = network.isLive   ?? false;

    // ── 2. Hard math: calculate gas cost in hCASH ───────────────────────────
    // gas cost in AVAX = gasUnits × gasPrice(wei) / 1e18
    const gasCostAvax  = (CLAIM_GAS_UNITS * gasGwei * 1e9) / 1e18;
    const gasCostUsd   = gasCostAvax * avaxUsd;
    const gasCostHcash = hcashUsd > 0 ? gasCostUsd / hcashUsd : 0;

    const rewardsUsd   = pendingRewards * hcashUsd;
    const netPnlUsd    = rewardsUsd - gasCostUsd;
    const netPnlHcash  = pendingRewards - gasCostHcash;
    const roiRatio     = gasCostHcash > 0 ? pendingRewards / gasCostHcash : Infinity;

    // ── 3. Hard-coded verdict override ──────────────────────────────────────
    // If gas > rewards in USD terms, we FORCE WAIT regardless of what the AI says.
    const forcedWait = netPnlUsd < 0;
    // Also force wait if ROI ratio is below 1.5x (weak efficiency)
    const weakEfficiency = roiRatio < 1.5 && !forcedWait;

    // ── 4. Build the grounded AI prompt ────────────────────────────────────
    const gasRateLabel = gasGwei < 30 ? 'NORMAL' : gasGwei < 60 ? 'ELEVATED' : 'SURGE';

    const systemPrompt = `You are the HashPilot Claim Oracle — an embedded AI advisor for Club HashCash on Avalanche.

You give PRECISE, MATH-BACKED claim timing advice. Your verdict must be mathematically consistent with the data provided.

CRITICAL RULE: If the NET P&L is negative (gas cost exceeds reward value), you MUST output VERDICT: WAIT with no exceptions.
CRITICAL RULE: If ROI ratio is below 1.5x, you SHOULD strongly recommend WAIT.

RESPONSE FORMAT (follow exactly, no markdown):
VERDICT: [CLAIM NOW or WAIT]
NET P&L: [exact USD net value after gas]
GAS ANALYSIS: [one sentence on current gas conditions]
STRATEGY: [one concrete action the player should take right now]
OPTIMAL WINDOW: [when/under what conditions to claim if verdict is WAIT]
RISK FACTOR: [primary risk to monitor]`;

    const userPrompt = `LIVE NETWORK SNAPSHOT (${isLive ? 'LIVE DATA' : 'ESTIMATED — APIs unavailable'}):
- Current Gas Price: ${gasGwei} Gwei (${gasRateLabel} rate)
- AVAX Price: $${avaxUsd.toFixed(2)}
- hCASH Price: $${hcashUsd.toFixed(4)}

MINER POSITION:
- Pending Rewards: ${pendingRewards.toFixed(2)} hCASH (≈ $${rewardsUsd.toFixed(2)} USD)
- Last Claimed: ${lastClaim}
- Mining Mode: ${mode}

CALCULATED ECONOMICS:
- Estimated Gas Cost: ${gasCostHcash.toFixed(2)} hCASH (≈ $${gasCostUsd.toFixed(3)} USD at ${CLAIM_GAS_UNITS.toLocaleString()} gas units)
- Net P&L if claimed now: ${netPnlHcash.toFixed(2)} hCASH (≈ $${netPnlUsd.toFixed(2)} USD)
- ROI Ratio (reward/gas): ${isFinite(roiRatio) ? roiRatio.toFixed(2) : '∞'}x ${roiRatio < 1.5 ? '⚠ BELOW 1.5x THRESHOLD' : roiRatio >= 3 ? '✓ STRONG' : '✓ ACCEPTABLE'}
${forcedWait ? '\n⛔ FORCED VERDICT: Net P&L is NEGATIVE. Gas exceeds reward value. VERDICT MUST BE WAIT.' : ''}
${weakEfficiency ? '\n⚠ WEAK EFFICIENCY: ROI ratio below 1.5x. Recommend WAIT unless timing-sensitive.' : ''}

Analyze these real-time economics and give your oracle reading.`;

    // ── 5. Call Claude ───────────────────────────────────────────────────────
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const aiText = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      aiReading: aiText,
      // Return raw numbers for the UI to display independently
      liveData: {
        gasGwei,
        gasRateLabel,
        gasCostUsd: parseFloat(gasCostUsd.toFixed(4)),
        gasCostHcash: parseFloat(gasCostHcash.toFixed(2)),
        hcashUsd,
        avaxUsd,
        rewardsUsd: parseFloat(rewardsUsd.toFixed(2)),
        netPnlUsd: parseFloat(netPnlUsd.toFixed(2)),
        netPnlHcash: parseFloat(netPnlHcash.toFixed(2)),
        roiRatio: isFinite(roiRatio) ? parseFloat(roiRatio.toFixed(2)) : 999,
        forcedWait,
        isLive,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Claim Oracle unavailable';
    console.error('Claim Advisor API error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
