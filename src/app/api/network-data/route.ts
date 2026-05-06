import { NextResponse } from 'next/server';

/**
 * GET /api/network-data
 * 
 * Fetches live market/network data needed for the Claim Oracle:
 * 1. AVAX gas price (Gwei) — from Avalanche public JSON-RPC
 * 2. hCASH price (USD) — from DEX Screener
 * 3. AVAX price (USD) — from CoinGecko
 * 
 * This route runs server-side so external API keys are never exposed to the client.
 */
export async function GET() {
  const results = await Promise.allSettled([
    fetchAvaxGasPrice(),
    fetchHcashPrice(),
    fetchAvaxPrice(),
  ]);

  const gasGwei   = results[0].status === 'fulfilled' ? results[0].value : null;
  const hcashUsd  = results[1].status === 'fulfilled' ? results[1].value : null;
  const avaxUsd   = results[2].status === 'fulfilled' ? results[2].value : null;

  // Log any failures for server-side debugging
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`network-data fetch [${i}] failed:`, r.reason);
    }
  });

  return NextResponse.json({
    gasGwei,
    hcashUsd,
    avaxUsd,
    fetchedAt: new Date().toISOString(),
    // Indicate data quality to the client
    isLive: results.every(r => r.status === 'fulfilled'),
  }, {
    headers: {
      // Cache for 30 seconds at CDN edge — fresh enough, not hammering APIs
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    }
  });
}

// --- Fetchers ---

async function fetchAvaxGasPrice(): Promise<number> {
  // Use the public Avalanche C-Chain JSON-RPC endpoint
  const response = await fetch('https://api.avax.network/ext/bc/C/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_gasPrice',
      params: [],
    }),
    next: { revalidate: 30 },
  });

  if (!response.ok) throw new Error(`RPC error: ${response.status}`);
  
  const data = await response.json();
  // result is hex in wei → convert to Gwei
  const weiHex: string = data.result;
  const wei = parseInt(weiHex, 16);
  const gwei = wei / 1e9;
  return parseFloat(gwei.toFixed(2));
}

async function fetchHcashPrice(): Promise<number> {
  const CONTRACT = '0xBa5444409257967E5E50b113C395A766B0678C03';
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${CONTRACT}`,
    { next: { revalidate: 30 } }
  );
  if (!response.ok) throw new Error(`DEX Screener error: ${response.status}`);

  const data = await response.json();
  if (!data.pairs || data.pairs.length === 0) throw new Error('No DEX pairs found for hCASH');
  
  // Use the pair with highest liquidity (first pair is usually the primary)
  const price = parseFloat(data.pairs[0].priceUsd);
  if (isNaN(price)) throw new Error('Invalid hCASH price from DEX Screener');
  return price;
}

async function fetchAvaxPrice(): Promise<number> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd',
    { next: { revalidate: 60 } }
  );
  if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);

  const data = await response.json();
  const price = data['avalanche-2']?.usd;
  if (!price) throw new Error('No AVAX price in CoinGecko response');
  return price;
}
