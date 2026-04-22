"use client";

import { Activity, Zap, Menu, ChevronDown } from "lucide-react";
import { usePrices } from "@/components/providers/PriceProvider";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { avax, hcash, isLoading } = usePrices();

  return (
    <header className="h-20 bg-hp-surface/80 backdrop-blur-md border-b border-hp-border flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-hp-text-muted hover:text-hp-accent-amber transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Removed duplicate mobile logo as requested - Sidebar handles navigation */}
      </div>

      <div className="flex items-center gap-4">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button 
                        onClick={openConnectModal} 
                        type="button"
                        className="bg-hp-accent-amber hover:bg-amber-400 text-hp-background px-4 py-2 rounded-sm font-display font-bold text-xs tracking-widest transition-all shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                      >
                        CONNECT WALLET
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button 
                        onClick={openChainModal} 
                        type="button"
                        className="bg-hp-accent-red text-white px-4 py-2 rounded-sm font-display font-bold text-xs tracking-widest transition-all"
                      >
                        WRONG NETWORK
                      </button>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button 
                        onClick={openAccountModal} 
                        type="button"
                        className="bg-hp-accent-amber/10 border-2 border-hp-accent-amber px-4 py-2 rounded-sm text-hp-accent-amber font-mono text-sm font-bold flex items-center gap-2 hover:bg-hp-accent-amber/20 transition-all shadow-[0_0_20px_rgba(245,166,35,0.15)] group"
                      >
                        {account.displayName}
                        <ChevronDown className="w-4 h-4 text-hp-accent-amber group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>

        {/* Current AVAX Price Display */}
        <div className="hidden lg:flex items-center gap-3 bg-[rgba(5,8,16,0.3)] border border-hp-border/50 px-3 py-1.5 rounded-sm font-mono">
          <Zap className="w-3.5 h-3.5 text-hp-accent-blue" />
          <div className="flex flex-col">
            <span className="text-[8px] text-hp-text-muted tracking-widest">AVAX</span>
            <span className="text-hp-text-secondary text-xs font-bold">
              ${isLoading ? "---" : avax.price.toFixed(2)} 
              <span className={avax.change24h >= 0 ? "text-hp-accent-green text-[9px] ml-1" : "text-hp-accent-red text-[9px] ml-1"}>
                {avax.change24h >= 0 ? "+" : ""}{avax.change24h.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>

        {/* Current hCASH Price Display */}
        <div className="flex items-center gap-2 md:gap-3 bg-[rgba(5,8,16,0.5)] border border-hp-border px-2 md:px-4 py-1.5 md:py-2 rounded-sm font-mono">
          <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-hp-accent-amber" />
          <div className="flex flex-col">
            <span className="hidden md:block text-[10px] text-hp-text-muted tracking-widest uppercase">hCASH PRICE</span>
            <span className="md:hidden text-[8px] text-hp-text-muted tracking-widest uppercase">hCASH</span>
            <span className="text-hp-text-primary text-xs md:text-sm font-bold leading-tight">
              ${isLoading ? "---" : hcash.price < 1 ? hcash.price.toFixed(4) : hcash.price.toFixed(2)} 
              <span className={hcash.change24h >= 0 ? "text-hp-accent-green text-[10px] md:text-xs ml-1" : "text-hp-accent-red text-[10px] md:text-xs ml-1"}>
                {hcash.change24h.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
