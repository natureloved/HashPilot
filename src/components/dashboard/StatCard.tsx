"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  type?: "primary" | "positive" | "warning";
  trend?: "up" | "down" | "none";
  trendValue?: string;
  subValue?: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  suffix = "",
  type = "primary",
  trend = "none",
  trendValue,
  subValue,
  delay = 0,
}: StatCardProps) {
  const isNumber = typeof value === "number";
  
  // Animation setup for numbers
  const motionVal = useMotionValue(0);
  const springValue = useSpring(motionVal, {
    damping: 30,
    stiffness: 100,
  });
  
  const displayValue = useTransform(springValue, (current) => {
    return isNumber
      ? current.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : value;
  });

  useEffect(() => {
    if (isNumber) {
      setTimeout(() => {
        motionVal.set(value);
      }, delay * 1000 + 500); // add global delay
    }
  }, [value, motionVal, isNumber, delay]);

  const borderColors = {
    primary: "border-hp-border-glow shadow-[0_0_8px_rgba(245,166,35,0.2)]",
    positive: "border-hp-accent-green shadow-[0_0_8px_rgba(57,255,20,0.2)]",
    warning: "border-hp-accent-red shadow-[0_0_8px_rgba(255,59,59,0.2)]",
  };

  const textColors = {
    primary: "text-hp-accent-amber",
    positive: "text-hp-accent-green animate-glow-pulse",
    warning: "text-hp-accent-red animate-flicker",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={cn(
        "bg-[rgba(13,20,36,0.6)] backdrop-blur-md border rounded-sm p-5 relative overflow-hidden group",
        borderColors[type]
      )}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-sans uppercase tracking-widest text-hp-text-muted text-xs font-semibold">
          {title}
        </h3>
        
        {trend !== "none" && (
          <div className={cn(
            "text-xs font-mono font-bold flex items-center gap-1",
            trend === "up" ? "text-hp-accent-green" : "text-hp-accent-red"
          )}>
            {trend === "up" ? "▲" : "▼"} {trendValue}
          </div>
        )}
      </div>

      <div className="mt-4">
        {isNumber ? (
          <div className="flex items-baseline gap-2">
            <motion.span className={cn("font-display text-4xl lg:text-3xl xl:text-4xl font-bold tracking-tight", textColors[type])}>
              {displayValue}
            </motion.span>
            <span className="font-mono text-sm text-hp-text-secondary">{suffix}</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className={cn("font-display text-4xl lg:text-3xl xl:text-4xl font-bold tracking-tight", textColors[type])}>
              {value}
            </span>
            <span className="font-mono text-sm text-hp-text-secondary">{suffix}</span>
          </div>
        )}
        
        {subValue && (
          <div className="mt-2 text-xs font-mono text-hp-text-muted">
            {subValue}
          </div>
        )}
      </div>
    </motion.div>
  );
}
