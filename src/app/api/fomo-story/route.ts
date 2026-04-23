import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { actual, scenarios } = await request.json();
    
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are HashPilot's narrative engine. You receive a player's actual mining stats and counterfactual simulation results.
Write a 3-paragraph "mining story" for this player.

ACTUAL STATS:
- Days Mining: ${actual.daysMining}
- Total Earned: ${actual.totalHCash} hCASH ($${actual.totalUsd})
- Facility Tier: ${actual.tier}

SIMULATION DELTAS:
- Early Bird (Starting 30d earlier): ${scenarios.earlyBird.delta} hCASH ($${scenarios.earlyBird.deltaUsd})
- Upgrade Path (Upgrading sooner): ${scenarios.upgradePath.delta} hCASH ($${scenarios.upgradePath.deltaUsd})
- Claim Master (Avoided Surge fees): ${scenarios.claimMaster.delta} hCASH ($${scenarios.claimMaster.deltaUsd})

Paragraph 1: What their journey has been (factual, warm tone)
Paragraph 2: The decisions that shaped their current position (honest but not harsh — frame as learning)
Paragraph 3: A forward-looking strategy call — what the data says they should do next

Tone: Like a knowledgeable friend reviewing your chess game after the match. Honest. Encouraging. Specific. No fluff. Respond ONLY with the 3 paragraphs.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ story: text });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Story unavailable";
    console.error("FOMO API failure:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
