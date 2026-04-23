"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Zap, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/Skeleton";

export default function DailyDigest() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [dateStr] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));

  const fetchDigest = async (force = false) => {
    setLoading(true);
    const cached = localStorage.getItem("hp_daily_digest");
    const cachedDate = localStorage.getItem("hp_daily_digest_date");
    const cachedFallback = localStorage.getItem("hp_daily_digest_fallback");
    const today = new Date().toDateString();

    if (!force && cached && cachedDate === today) {
      setContent(cached);
      setIsFallback(cachedFallback === "true");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/digest", {
        method: "POST",
        body: JSON.stringify({ date: today }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!res.ok) throw new Error("Network Protocol Error");
      
      const data = await res.json();
      
      if (data.content) {
        setContent(data.content);
        setIsFallback(data.isFallback || false);
        localStorage.setItem("hp_daily_digest", data.content);
        localStorage.setItem("hp_daily_digest_date", today);
        localStorage.setItem("hp_daily_digest_fallback", (data.isFallback || false).toString());
      } else {
        throw new Error("Data Integrity Failure");
      }
    } catch (err) {
      console.error("Intel fetch failed:", err);
      // Fallback is handled by the API now, but if the FETCH itself fails:
      const fallback = "HEADLINE: Emergency Intel Override Active\nNETWORK INTEL: Direct link to AI oracle severed. Local telemetry shows stable hashrate distribution.\nSTRATEGY MOVE: Maintain current mining parameters. Avoid high-risk infrastructure changes until link restored.\nCLAIM SIGNAL: CAUTION ⚠️ — Market data syncing via backup nodes.\nOUTLOOK: NEUTRAL but cautious";
      setContent(fallback);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[rgba(13,20,36,0.8)] border border-hp-border rounded-sm relative overflow-hidden"
    >
      <div className="bg-hp-surface border-b border-hp-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isFallback ? (
            <ShieldAlert size={14} className="text-hp-accent-amber animate-glow-pulse" />
          ) : (
            <Zap size={14} className="text-hp-accent-amber" />
          )}
          <h3 className="font-sans font-bold tracking-[0.2em] text-[10px] text-hp-text-primary uppercase">
            {isFallback ? "OFFLINE INTEL FEED" : "DAILY INTEL BRIEF"}
          </h3>
          <span className="font-mono text-[9px] text-hp-text-muted ml-2 opacity-70">{dateStr}</span>
        </div>
        <button 
          onClick={() => fetchDigest(true)}
          disabled={loading}
          className="text-hp-text-muted hover:text-hp-accent-amber transition-colors disabled:opacity-30"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="p-4 md:p-6 font-mono text-sm leading-relaxed min-h-[140px] flex flex-col justify-center bg-[rgba(5,8,16,0.3)]">
        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-hp-accent-amber animate-pulse rounded-full" />
              <p className="text-hp-text-muted animate-pulse uppercase text-[9px] tracking-widest font-bold">SYNCHRONIZING INTEL CHANNEL...</p>
            </div>
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[78%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        ) : (
          <div className="space-y-2 whitespace-pre-wrap">
            {content.split('\n').map((line, i) => {
              if (!line.trim()) return <div key={i} className="h-2" />;
              const [label, ...rest] = line.split(':');
              if (rest.length > 0) {
                return (
                  <div key={i} className="flex gap-2">
                    <span className="text-hp-accent-amber font-bold shrink-0">{label}:</span>
                    <span className="text-hp-text-primary">{rest.join(':')}</span>
                  </div>
                );
              }
              return <div key={i} className="text-hp-text-primary">{line}</div>;
            })}
            <span className="inline-block w-2.5 h-4 bg-hp-accent-green animate-pulse ml-1" />
          </div>
        )}
      </div>

      <div className="bg-[#050810] px-4 py-1.5 border-t border-hp-border/40 flex justify-between items-center">
        <span className="text-[9px] font-mono text-hp-text-muted lowercase tracking-tighter">
          {isFallback ? "Emergency backup content initialized" : "Generated by HashPilot AI • Refreshes daily"}
        </span>
        <div className="flex gap-4">
          <div className={cn("w-1 h-3 transition-colors", isFallback ? "bg-hp-accent-amber/20" : "bg-hp-accent-blue/20")} />
          <div className={cn("w-1 h-3 transition-colors", isFallback ? "bg-hp-accent-amber/40" : "bg-hp-accent-blue/40")} />
          <div className={cn("w-1 h-3 transition-colors", isFallback ? "bg-hp-accent-amber/60" : "bg-hp-accent-blue/60")} />
        </div>
      </div>
    </motion.div>
  );
}

