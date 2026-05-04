"use client";

import { useAccount } from "wagmi";
import { useDemoMode } from "@/components/providers/DemoProvider";

export function useHashPilotAccount() {
  const { address: connectedAddress, isConnected: isWalletConnected, status } = useAccount();
  const { isDemoMode, demoAddress, isInitializing } = useDemoMode();

  const isConnected = isWalletConnected || isDemoMode;
  const address = isDemoMode ? demoAddress : connectedAddress;

  return {
    address,
    isConnected,
    isDemoMode,
    isWalletConnected,
    status: isDemoMode ? "connected" : (isInitializing ? "connecting" : status),
  };
}
