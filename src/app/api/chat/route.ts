import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Static game rules — separated so they can be prompt-cached
const STATIC_RULES = `You are HashPilot AI — the embedded strategy intelligence
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

- A clear verdict (CLAIM / HOLD / BUY / WAIT)
- A specific next action the player should take

CRITICAL FORMATTING RULE:
DO NOT use any markdown formatting characters in your response.
- NEVER use double asterisks (**) for bolding. Use ALL CAPS for emphasis.
- NEVER use hashes (## or ###) for headers. Use ALL CAPS lines instead.
- NEVER use triple backticks (\`\`\`) for code blocks. Use plain text and indentation.
- NEVER use horizontal rules (---). Use empty lines or simple separators like ==== if needed.
- NEVER use markdown tables. Use plain text lists or simple text-based alignment.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'API configuration missing. Please set ANTHROPIC_API_KEY.' }, { status: 500 });
    }

    // ── Fetch live network context (supply/burn + market data) ──────────────
    let networkContext = 'LIVE NETWORK STATUS: (API unavailable)\n- Gas: 30 Gwei\n- hCASH: $14.20\n- AVAX: $34.50';
    let supply = '4,584,463';
    let burned = '5,399,250';
    try {
      const networkDataUrl = new URL('/api/network-data', request.url);
      const network = await fetch(networkDataUrl.toString(), { cache: 'no-store' }).then(r => r.json());
      if (network) {
        networkContext = `LIVE NETWORK STATUS:\n- Gas Price: ${network.gasGwei} Gwei\n- hCASH Price: $${network.hcashUsd?.toFixed(4)}\n- AVAX Price: $${network.avaxUsd?.toFixed(2)}`;
        if (network.hcashStats) {
          supply = network.hcashStats.totalSupply.toLocaleString();
          burned = network.hcashStats.burned.toLocaleString();
        }
      }
    } catch (e) {
      console.warn('Could not fetch live context for chat prompt:', e);
    }

    // ── Build cacheable system block (static rules + semi-static token stats) ─
    const cacheableSystem = `${STATIC_RULES}

TOKEN ECONOMICS (live):
- Total hCASH Supply: ${supply} hCASH. Pure gameplay distribution.
- Total hCASH Burned: ${burned} hCASH (deflationary mechanics active)`;

    const client = new Anthropic({ apiKey });

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: [
        { type: 'text', text: cacheableSystem, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: networkContext },
      ],
      messages,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (e) {
          console.error('Stream error:', e);
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
    console.error('AI Interface failure:', error);
    const err = error as Error;
    const status = (error as { status?: number })?.status || 500;
    return NextResponse.json({
      error: err.message || 'Failed to initialize communication with HashPilot backend.',
      details: (error as { body?: unknown })?.body || undefined,
    }, { status });
  }
}
