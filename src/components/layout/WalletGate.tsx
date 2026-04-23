"use client";

import React from "react";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ShieldAlert, Lock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletGateProps {
  children: React.ReactNode;
}

export default function WalletGate({ children }: WalletGateProps) {
  const { isConnected, status } = useAccount();
  const pathname = usePathname();

  // Public routes that don't require wallet connection
  const isPublicRoute = pathname === "/";

  // While checking connection status to avoid hydration flicker
  const isChecking = status === "connecting" || status === "reconnecting";

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      {isChecking ? (
        <motion.div 
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center min-h-[60vh] font-mono"
        >
          <div className="w-12 h-12 border-2 border-hp-accent-amber/20 border-t-hp-accent-amber rounded-full animate-spin mb-4" />
          <p className="text-[10px] text-hp-accent-amber uppercase tracking-[0.4em] animate-pulse">
            Authenticating Session...
          </p>
        </motion.div>
      ) : !isConnected ? (
        <motion.div 
          key="restricted"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 text-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-hp-accent-amber/20 blur-3xl rounded-full" />
            <div className="relative bg-hp-surface border border-hp-accent-amber/30 p-4 md:p-6 rounded-sm shadow-[0_0_50px_rgba(245,166,35,0.15)]">
              <ShieldAlert className="w-8 h-8 md:w-12 h-12 text-hp-accent-amber animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 bg-hp-background border border-hp-accent-amber p-1 rounded-full">
              <Lock className="w-3 h-3 text-hp-accent-amber" />
            </div>
          </div>

          <h2 className="font-display text-xl md:text-3xl font-bold text-white mb-4 tracking-tighter uppercase">
            Terminal Access <span className="text-hp-accent-amber">Restricted</span>
          </h2>
          
          <div className="max-w-xs md:max-w-md bg-hp-accent-amber/5 border border-hp-accent-amber/20 p-3 md:p-4 rounded-sm mb-6 md:mb-8 font-mono text-xs md:text-sm leading-relaxed">
            <p className="text-sm text-hp-text-secondary leading-relaxed">
              Mining analytics, strategy signals, and AI intelligence are locked to authorized wallet sessions only. 
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-hp-accent-amber/70 uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              Protocol: HashPilot // Level 2 Auth
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
             <ConnectButton />
             <p className="text-[10px] text-hp-text-muted font-mono uppercase tracking-widest">
               Connect Avalanche Wallet to Unlock
             </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

