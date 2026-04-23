"use client";

import { useEffect, useState } from "react";

export default function AppBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-hp-background">
      {/* 1. Base Layer (Cinematic Grid) */}
      <div className="absolute inset-0 bg-cinematic-grid opacity-100" />

      {/* 2. Amber Glow (Radial with Drift Animation) */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[100vh] pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 w-[80vw] h-[80vw] rounded-full bg-hp-accent-amber/10 blur-[120px] animate-glow-drift" 
          style={{ 
            opacity: "var(--bg-glow-amber-opacity)",
            background: "radial-gradient(circle, var(--hp-accent-amber) 0%, transparent 70%)"
          }} 
        />
      </div>

      {/* 3. Noise Overlay */}
      <div className="absolute inset-0 noise-overlay" />

      {/* 4. Vignette Darkening */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,11,24,0.4)_70%,rgba(5,11,24,1)_100%)]" />

      {/* 5. Subtle Scanlines (re-integrated) */}
      <div className="scanlines opacity-[0.02]" />
    </div>
  );
}

