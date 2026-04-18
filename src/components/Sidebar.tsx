"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plane,
  Zap,
  Target,
  Bot,
  TrendingDown,
  Swords,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Plane },
  { name: "ROI Calculator", href: "/roi-calculator", icon: Zap },
  { name: "Claim Advisor", href: "/claim-advisor", icon: Target },
  { name: "HashPilot AI", href: "/ai-chat", icon: Bot },
  { name: "Halving Tracker", href: "/halving-tracker", icon: TrendingDown },
  { name: "Miner Optimizer", href: "/miner-compare", icon: Swords },
  { name: "Efficiency Score", href: "/scorecard", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 bg-hp-surface border-r border-hp-border flex-col h-full z-20">
      <div className="p-6 pb-2">
        <Link href="/">
          <h1 className="font-display text-2xl font-bold text-hp-accent-amber tracking-wider relative inline-block group cursor-pointer">
            HASHPILOT
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-hp-accent-amber animate-glow-pulse"></span>
          </h1>
        </Link>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-hp-text-muted font-mono">
          Mining Intelligence Terminal v1.0
        </p>
      </div>

      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
          return (
            <Link
              key={item.name}
              href={item.href}
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
        })}
      </nav>

      <div className="p-4 border-t border-hp-border flex flex-col gap-1 items-center font-mono">
        <div className="text-xs">
          SYSTEM: <span className="text-hp-accent-green animate-glow-pulse">ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
