import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sliderValues, matrix } = await request.json();
    
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are the HashPilot Oracle. You receive a mining scenario matrix and give a sharp, decisive strategic reading. 

CURRENT SLIDER VALUES:
- Network Growth: ${sliderValues.networkGrowth}%
- Price Move: ${sliderValues.priceMove}%
- New Players: ${sliderValues.newPlayers}
- Halvings: ${sliderValues.halvings}

SCENARIO MATRIX (Sample data):
- Bear 30d: ${matrix[0][0].hCash} hCASH ($${matrix[0][0].usd})
- Base 90d: ${matrix[1][1].hCash} hCASH ($${matrix[1][1].usd})
- Bull 180d: ${matrix[2][2].hCash} hCASH ($${matrix[2][2].usd})

Format your response EXACTLY as:

VERDICT: [One sentence: BULLISH / BEARISH / UNCERTAIN + why]
CRITICAL FACTOR: [The single variable with most impact on outcomes]
BEST MOVE: [One specific action the player should take given these scenarios]
RISK ALERT: [The scenario the player should prepare for most]
ORACLE CONFIDENCE: [HIGH / MEDIUM / LOW] — [one sentence explanation]

Be direct. Be specific. No fluff. Speak like a trader, not a teacher.`;

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ reading: text });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Oracle unavailable";
    console.error("Oracle API failure:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
