import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();

    const SYSTEM_PROMPT = `You are the HashPilot Daily Intel system. Generate a short, sharp 
    daily briefing for Club HashCash players. Format it EXACTLY as:

    HEADLINE: [One punchy line about the key thing players should know today]
    NETWORK INTEL: [1-2 sentences about general network/hashrate trends]
    STRATEGY MOVE: [The single most important thing a player should do today]
    CLAIM SIGNAL: [CLAIM ✅ / HOLD ⛔ / CAUTION ⚠️] — [one sentence reason]
    OUTLOOK: [BULLISH / NEUTRAL / BEARISH] on hCASH accumulation today

    Keep it tight. Terminal-style. No fluff. Players read this in 10 seconds.`;

    const USER_MESSAGE = `Generate today's mining intelligence briefing. 
    Today is ${date}. Make it feel grounded in real mining strategy.`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_MESSAGE }],
    });

    const content = 'text' in response.content[0] ? response.content[0].text : '';

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error("Digest interface failure:", error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to generate daily intel." }, { status: 500 });
  }
}
