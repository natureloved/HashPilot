"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plane,
  Zap,
  Bot,
  TrendingDown,
  Swords,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dash", href: "/dashboard", icon: Plane },
  { name: "Oracle", href: "/oracle", icon: Zap },
  { name: "Identity", href: "/archetype", icon: Trophy },
  { name: "FOMO", href: "/fomo", icon: TrendingDown },
  { name: "AI", href: "/ai-chat", icon: Bot },
  { name: "Track", href: "/halving-tracker", icon: TrendingDown },
  { name: "Miner", href: "/miner-compare", icon: Swords },
  { name: "Score", href: "/scorecard", icon: Trophy },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[rgba(13,20,36,0.95)] backdrop-blur-md border-t border-hp-border z-50 px-2 py-2 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
        return (


          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-1 rounded-sm transition-all group",
              isActive ? "text-hp-accent-amber" : "text-hp-text-muted hover:text-hp-text-primary"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive ? "text-hp-accent-amber drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]" : "")} />
            <span className="text-[8px] font-mono uppercase tracking-tighter">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
