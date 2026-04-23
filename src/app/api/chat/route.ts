import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are HashPilot AI — the embedded strategy intelligence 
system for Club HashCash, an on-chain mining simulation built on Avalanche.

GAME MECHANICS YOU KNOW:
- Players buy virtual mining facilities (tiered: Starter/Standard/Advanced/Elite)
- They populate facilities with miner NFTs — each with hashrate (TH/s) 
  and power consumption values
- Players earn $hCASH tokens proportional to their share of the TOTAL 
  network hashrate
- Formula: Player earnings = 1.25 hCASH/block × (player hashrate ÷ network hashrate)
- Avalanche blocks: ~2 seconds each = ~43,200 blocks/day
- Base emissions: 1.25 hCASH per block
- Halvings: every ~4,200,000 blocks
- Total supply: 4,142,824.10 hCASH. Pure gameplay distribution.
- Total hCASH Burned: 4,722,187.50 hCASH (deflationary mechanics active)
- Electricity rates: Dynamic. Range from Normal (min fees) → Elevated → Surge (max fees)
- Claiming during Surge = significantly higher fees eating into profits
- Facility power ceiling limits how many/which miners you can run
- Strategic tradeoff: fewer high-hashrate miners vs. many efficient low-power miners
- Network dilution: if network hashrate doubles, your share halves
- Reinvesting hCASH into better miners/facilities maintains competitive position
- Secondary marketplace exists for buying/selling miner NFTs in hCASH or AVAX

YOUR ROLE:
Give sharp, math-backed, specific strategy advice. Be direct. 
If someone asks "should I upgrade?", show the actual math.
If rates are at Surge, say so clearly and recommend holding.
If a halving is close, factor that into all projections.

RESPONSE STYLE:
- Concise but complete. No fluff.
- Use actual numbers and calculations when relevant
- Format advice with clear sections when complex
- Speak like a knowledgeable player, not a corporate assistant
- Use occasional gaming/crypto slang naturally
- Never hallucinate features that don't exist in the game
- If you don't know a specific live stat (like current network hashrate), 
  say so and tell them where to find it (hashcash.club)

ALWAYS END responses with one of:
- A specific next action the player should take
- A question to get more context if needed
- A clear verdict (CLAIM / HOLD / BUY / WAIT)`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    
    if (!apiKey) {
      console.error("AI Interface failure: ANTHROPIC_API_KEY is missing or empty.");
      return NextResponse.json({ error: "API configuration missing. Please set ANTHROPIC_API_KEY." }, { status: 500 });
    }

    // Initialize the Anthropic client
    const client = new Anthropic({
      apiKey: apiKey,
    });
    
    // We use stream to return a ReadableStream to the client to simulate terminal outputs
    const stream = await client.messages.create({
      model: 'claude-3-haiku-20240307', 
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    });
    
    // Manually construct the stream to ensure it follows the data: JSON format the frontend expects
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("Stream error:", e);
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error("AI Interface failure:", error);
    const err = error as Error;
    
    // More descriptive error for API failures
    const status = (error as { status?: number })?.status || 500;
    const message = err.message || "Failed to initialize communication with HashPilot backend.";
    
    return NextResponse.json({ 
      error: message,
      details: (error as { body?: unknown })?.body || undefined
    }, { status: status });
  }
}
