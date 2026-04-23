"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface PriceData {
  price: number;
  change24h: number;
}

interface PriceContextType {
  avax: PriceData;
  hcash: PriceData;
  isLoading: boolean;
  error: string | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

const DEFAULT_AVAX = { price: 34.50, change24h: 2.4 };
const DEFAULT_HCASH = { price: 14.20, change24h: 5.2 };

export function PriceProvider({ children }: { children: ReactNode }) {
  const [avax, setAvax] = useState<PriceData>(DEFAULT_AVAX);
  const [hcash, setHcash] = useState<PriceData>(DEFAULT_HCASH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      // 1. Fetch AVAX price from CoinGecko
      const avaxRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd&include_24hr_change=true"
      );
      const avaxData = await avaxRes.json();
      
      if (avaxData["avalanche-2"]) {
        setAvax({
          price: avaxData["avalanche-2"].usd,
          change24h: avaxData["avalanche-2"].usd_24h_change || 0,
        });
      }

      // 2. Fetch hCASH price from DEX Screener
      // Correct Contract: 0xBa5444409257967E5E50b113C395A766B0678C03
      const hcashRes = await fetch(
        "https://api.dexscreener.com/latest/dex/tokens/0xBa5444409257967E5E50b113C395A766B0678C03"
      );
      const hcashData = await hcashRes.json();
      
      if (hcashData.pairs && hcashData.pairs.length > 0) {
        const primaryPair = hcashData.pairs[0];
        setHcash({
          price: parseFloat(primaryPair.priceUsd),
          change24h: parseFloat(primaryPair.priceChange?.h24 || "0"),
        });
      }

      setError(null);
    } catch (err) {
      console.error("Price fetch failed:", err);
      // Fallback to defaults already set in state
      setError("Failed to sync with live markets. Using baseline estimates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Poll every 5 minutes
    const interval = setInterval(fetchPrices, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PriceContext.Provider value={{ avax, hcash, isLoading, error }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePrices must be used within a PriceProvider");
  }
  return context;
}

