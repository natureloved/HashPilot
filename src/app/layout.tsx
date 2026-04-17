import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { PriceProvider } from "@/components/providers/PriceProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "HashPilot | Ultimate Mining Dashboard",
  description: "Monitor, calculate, and optimize your HashCash mining operations with real-time data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-hp-background font-sans text-hp-text-primary antialiased selection:bg-hp-accent-amber/30 selection:text-hp-accent-amber",
          inter.variable,
          spaceGrotesk.variable
        )}
      >
        <PriceProvider>
          <div className="flex h-screen overflow-hidden relative">
            <Sidebar />
            
            <div className="flex-1 flex flex-col relative z-10 w-full">
              <Header />
              <main className="flex-1 overflow-y-auto bg-dot-grid p-4 md:p-8 pb-32 relative flex flex-col">
                <div className="flex-1 mb-20">
                  {children}
                </div>
                <Footer />
              </main>
            </div>
          </div>
        </PriceProvider>
      </body>
    </html>
  );
}
