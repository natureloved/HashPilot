import { NextRequest, NextResponse } from 'next/server';

const HCASH_CONTRACT = '0xBa5444409257967E5E50b113C395A766B0678C03';
const AVAX_RPC = 'https://api.avax.network/ext/bc/C/rpc';
const DEMO_ADDRESS = '0x8f9a59b6574f9bf10398863673c6c06a6c0735d9';

function ethCall(id: number, data: string) {
  return fetch(AVAX_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id, method: 'eth_call',
      params: [{ to: HCASH_CONTRACT, data }, 'latest'],
    }),
  }).then(r => r.json());
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  if (address.toLowerCase() === DEMO_ADDRESS.toLowerCase()) {
    return NextResponse.json({
      found: true,
      pendingRewards: 450.25,
      claimFee: 15.40,
      mode: 'Aggressive',
      lastClaim: '3 days ago',
      isDemo: true,
    });
  }

  try {
    // ABI-encode address padded to 32 bytes (24 zero chars + 40-char address)
    const addrParam = address.slice(2).toLowerCase().padStart(64, '0');

    const [balanceData, decimalsData] = await Promise.all([
      ethCall(1, `0x70a08231${addrParam}`), // balanceOf(address)
      ethCall(2, '0x313ce567'),              // decimals()
    ]);

    if (!balanceData.result || balanceData.result === '0x') {
      return NextResponse.json({ found: false });
    }

    const dec = parseInt(decimalsData.result ?? '0x12', 16);
    const divisor = BigInt(10) ** BigInt(dec);
    const balance = Number((BigInt(balanceData.result) * 100n) / divisor) / 100;

    if (balance < 0.01) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      pendingRewards: balance,
      claimFee: 0,
      mode: 'Standard',
      lastClaim: 'Unknown',
      isDemo: false,
    });
  } catch (err) {
    console.error('miner-data contract read error:', err);
    return NextResponse.json({ error: 'Failed to read on-chain data' }, { status: 500 });
  }
}
