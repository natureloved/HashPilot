import { NextResponse } from 'next/server';

const HCASH_CONTRACT = '0xBa5444409257967E5E50b113C395A766B0678C03';
const AVAX_RPC = 'https://api.avax.network/ext/bc/C/rpc';

export async function GET() {
  const results = await Promise.allSettled([
    fetchAvaxGasPrice(),
    fetchHcashPrice(),
    fetchAvaxPrice(),
    fetchHcashStats(),
  ]);

  const gasGwei    = results[0].status === 'fulfilled' ? results[0].value : null;
  const hcashUsd   = results[1].status === 'fulfilled' ? results[1].value : null;
  const avaxUsd    = results[2].status === 'fulfilled' ? results[2].value : null;
  const hcashStats = results[3].status === 'fulfilled' ? results[3].value : null;

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`network-data fetch [${i}] failed:`, r.reason);
    }
  });

  return NextResponse.json({
    gasGwei,
    hcashUsd,
    avaxUsd,
    hcashStats,
    // networkHashrateGH: add real fetch here once HashCash protocol API endpoint is known
    networkHashrateGH: null as number | null,
    fetchedAt: new Date().toISOString(),
    isLive: results.every(r => r.status === 'fulfilled'),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    }
  });
}

async function fetchAvaxGasPrice(): Promise<number> {
  const response = await fetch(AVAX_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] }),
    next: { revalidate: 30 },
  });
  if (!response.ok) throw new Error(`RPC error: ${response.status}`);
  const data = await response.json();
  const gwei = parseInt(data.result, 16) / 1e9;
  return parseFloat(gwei.toFixed(2));
}

async function fetchHcashPrice(): Promise<number> {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${HCASH_CONTRACT}`,
    { next: { revalidate: 30 } }
  );
  if (!response.ok) throw new Error(`DEX Screener error: ${response.status}`);
  const data = await response.json();
  if (!data.pairs?.length) throw new Error('No DEX pairs found for hCASH');
  const price = parseFloat(data.pairs[0].priceUsd);
  if (isNaN(price)) throw new Error('Invalid hCASH price');
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

// Reads totalSupply() and balanceOf(deadAddress) from the hCASH ERC-20 contract
// using raw JSON-RPC eth_call to avoid a viem import in this route.
async function fetchHcashStats(): Promise<{ totalSupply: number; burned: number }> {
  // ABI-encoded dead address padded to 32 bytes (60 zeros + "dead")
  const DEAD_PARAM = '000000000000000000000000000000000000000000000000000000000000dead';

  const rpcCall = (id: number, data: string) =>
    fetch(AVAX_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id, method: 'eth_call',
        params: [{ to: HCASH_CONTRACT, data }, 'latest'],
      }),
      next: { revalidate: 300 },
    }).then(r => r.json());

  const [supplyData, burnData, decimalsData] = await Promise.all([
    rpcCall(1, '0x18160ddd'),                    // totalSupply()
    rpcCall(2, `0x70a08231${DEAD_PARAM}`),        // balanceOf(0x000...dead)
    rpcCall(3, '0x313ce567'),                    // decimals()
  ]);

  if (!supplyData.result || supplyData.result === '0x') {
    throw new Error('Invalid totalSupply response from contract');
  }

  const dec = parseInt(decimalsData.result ?? '0x12', 16); // default 18
  const divisor = BigInt(10) ** BigInt(dec);

  // Use integer BigInt math to preserve precision, then convert with 2 dp
  const totalSupply = Number((BigInt(supplyData.result) * 100n) / divisor) / 100;
  const burned =
    burnData.result && burnData.result !== '0x'
      ? Number((BigInt(burnData.result) * 100n) / divisor) / 100
      : 0;

  return { totalSupply, burned };
}
