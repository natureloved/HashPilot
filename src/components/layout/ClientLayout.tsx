"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletGate from "@/components/layout/WalletGate";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative bg-transparent">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col relative z-10 w-full bg-transparent">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 relative flex flex-col bg-transparent">
          <div className="flex-1 mb-20 max-w-7xl mx-auto w-full">
            <WalletGate>
              {children}
            </WalletGate>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

