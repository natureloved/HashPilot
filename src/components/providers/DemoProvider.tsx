"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  demoAddress: string;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  isInitializing: boolean;
}

const DEMO_WALLET = "0x8f9a59b6574f9bf10398863673c6c06a6c0735d9";
const DEMO_STORAGE_KEY = "hashpilot_demo_mode";

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedDemoMode = localStorage.getItem(DEMO_STORAGE_KEY);
    if (storedDemoMode === "true") {
      setIsDemoMode(true);
    }
    setIsInitializing(false);
  }, []);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem(DEMO_STORAGE_KEY, "true");
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem(DEMO_STORAGE_KEY);
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        demoAddress: DEMO_WALLET,
        enableDemoMode,
        disableDemoMode,
        isInitializing,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoProvider");
  }
  return context;
}
