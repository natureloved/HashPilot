"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plane,
  Zap,
  Target,
  Bot,
  TrendingDown,
  Swords,
  Trophy,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Plane },
  { name: "Claim Advisor", href: "/claim-advisor", icon: Target },
  { name: "HashPilot AI", href: "/ai-chat", icon: Bot },
];

const secondaryNavItems = [
  { name: "ROI Calculator", href: "/roi-calculator", icon: Zap },
  { name: "Halving Tracker", href: "/halving-tracker", icon: TrendingDown },
  { name: "Miner Optimizer", href: "/miner-compare", icon: Swords },
  { name: "Efficiency Score", href: "/scorecard", icon: Trophy },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-sm transition-all relative font-mono text-sm uppercase tracking-wider group",
          isActive
            ? "bg-hp-surface-elevated text-hp-accent-amber drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]"
            : "text-hp-text-secondary hover:bg-hp-border/30 hover:text-hp-text-primary"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-hp-accent-amber rounded-r-md animate-glow-pulse" />
        )}
        <item.icon className={cn("w-4 h-4", isActive ? "text-hp-accent-amber" : "text-hp-text-muted group-hover:text-hp-text-primary")} />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-hp-surface/90 backdrop-blur-md border-r border-hp-border flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 pb-2 flex items-center justify-between">
          <Link href="/" onClick={onClose}>
            <div className="font-display text-2xl font-bold text-hp-accent-amber tracking-wider relative inline-block group cursor-pointer">
              HASHPILOT
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-hp-accent-amber animate-glow-pulse"></span>
            </div>
          </Link>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-hp-text-muted hover:text-hp-accent-amber transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <p className="px-6 mt-2 text-[10px] uppercase tracking-widest text-hp-text-muted font-mono">
          Mining Terminal
        </p>

        <nav className="flex-1 py-10 px-4 flex flex-col gap-2">
          {mainNavItems.map(renderNavItem)}
          
          {/* "More" Section */}
          <div className="mt-4">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-mono text-hp-text-muted uppercase tracking-[0.2em] hover:text-hp-text-primary transition-colors group"
            >
              <span>More Tools</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isMoreOpen ? "rotate-180" : "")} />
            </button>
            
            <div className={cn(
              "flex flex-col gap-1 mt-2 overflow-hidden transition-all duration-300",
              isMoreOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
            )}>
              {secondaryNavItems.map(renderNavItem)}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-hp-border flex flex-col gap-1 items-center font-mono">
          <div className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-hp-accent-green animate-glow-pulse" />
            SYSTEM: <span className="text-hp-accent-green">ONLINE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
