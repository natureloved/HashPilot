"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "bg-hp-surface-elevated animate-pulse rounded-sm",
      className
    )} />
  );
}

