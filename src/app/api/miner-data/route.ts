import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { avalanche } from 'viem/chains';

const HCASH_CONTRACT = '0xBa5444409257967E5E50b113C395A766B0678C03' as const;
const DEMO_ADDRESS = '0x8f9a59b6574f9bf10398863673c6c06a6c0735d9';

const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  // Demo wallet returns fixed realistic data
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
    const client = createPublicClient({
      chain: avalanche,
      transport: http('https://api.avax.network/ext/bc/C/rpc'),
    });

    const [rawBalance, decimals] = await Promise.all([
      client.readContract({
        address: HCASH_CONTRACT,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      }),
      client.readContract({
        address: HCASH_CONTRACT,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
    ]);

    const balance = parseFloat(formatUnits(rawBalance as bigint, decimals as number));

    if (balance < 0.01) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      pendingRewards: parseFloat(balance.toFixed(4)),
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
