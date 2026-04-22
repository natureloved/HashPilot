import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const FALLBACK_INTEL = [
  "HEADLINE: Network Stability Confirmed at 241 GH/s\nNETWORK INTEL: Global hashrate remains stable despite minor shifts in regional power costs. Protocol state 3.1 confirmed at block #11,402,120.\nSTRATEGY MOVE: Optimize cooling parameters for high-density GH/s mining arrays. Avoid claiming during current gas surges.\nCLAIM SIGNAL: HOLD ⛔ — Peak congestion detected on the Avalanche C-Chain.\nOUTLOOK: NEUTRAL on hCASH accumulation today",
  "HEADLINE: Efficiency Bonus Active for Elite Tiers\nNETWORK INTEL: Difficulty adjustment successful at 241.85 GH/s floor. Block discovery rate normalized at 2.5s. Market liquidity for hCASH remains high.\nSTRATEGY MOVE: Upgrade PSU firmware for increased reliability. Consider reinvesting yields into higher-tier rig components.\nCLAIM SIGNAL: CLAIM ✅ — Gas rates have stabilized below the 25 Gwei floor.\nOUTLOOK: BULLISH on hCASH accumulation today",
  "HEADLINE: Strategy Alert: Gas Volatility Increasing\nNETWORK INTEL: Minor consolidation detected across top GH/s pools. Average block times remain within target parameters.\nSTRATEGY MOVE: Diversify rig distribution across multiple sub-nets to minimize latency impact.\nCLAIM SIGNAL: CAUTION ⚠️ — Highly volatile rates detected. Monitor the terminal closely before any large transactions.\nOUTLOOK: NEUTRAL on hCASH accumulation today"
];

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

    // Add a race condition to handle timeouts
    const aiPromise = client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_MESSAGE }],
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI Request Timeout')), 8000)
    );

    let content = "";
    try {
      const response = await Promise.race([aiPromise, timeoutPromise]) as Anthropic.Messages.Message;
      content = 'text' in response.content[0] ? response.content[0].text : '';
    } catch (aiError) {
      console.warn("AI generation failed or timed out, using strategic fallback:", aiError);
      // Deterministically pick a fallback based on the date string to keep it consistent for the day
      const dateHash = date.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      content = FALLBACK_INTEL[dateHash % FALLBACK_INTEL.length];
    }

    if (!content) {
      content = FALLBACK_INTEL[0]; // Final safety fallback
    }

    return NextResponse.json({ content, isFallback: !content.startsWith('HEADLINE') });
  } catch (error: unknown) {
    console.error("Digest interface failure:", error);
    // Even on low-level failure, return a valid fallback instead of an error JSON
    return NextResponse.json({ 
      content: FALLBACK_INTEL[0],
      isFallback: true,
      error: "Protocol failure, using emergency intel feed."
    });
  }
}
