"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 md:px-8 bg-hp-surface border-t border-hp-border mt-12 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-hp-text-muted text-xs uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-hp-accent-amber animate-pulse" />
          Built for Hashathon 2026
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] lowercase italic opacity-60">not affiliated with Club HashCash</span>
          <span className="hidden md:inline">© 2026 HashPilot Terminal</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
