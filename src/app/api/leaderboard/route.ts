import { NextResponse } from "next/server";

// In a production environment, this data would be fetched from a database
// (e.g., Vercel Postgres, Supabase) populated by an on-chain indexer.
// For now, we simulate the database response.

export async function GET() {
  // Simulate network latency for realism
  await new Promise((resolve) => setTimeout(resolve, 800));

  const leaderboardData = [
    { id: 1, rank: 1, address: "0x7a...4b9c", score: 98, change: "up", tier: "ELITE" },
    { id: 2, rank: 2, address: "0x3f...1e8a", score: 95, change: "same", tier: "ELITE" },
    { id: 3, rank: 3, address: "0x9c...d21f", score: 92, change: "up", tier: "ADVANCED" },
    { id: 4, rank: 4, address: "0x2e...a53b", score: 88, change: "down", tier: "ADVANCED" },
    { id: 5, rank: 5, address: "0x5d...f84e", score: 85, change: "up", tier: "STANDARD" },
  ];

  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    data: leaderboardData,
  });
}
