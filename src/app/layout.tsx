import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono, DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import { PriceProvider } from "@/components/providers/PriceProvider";

const fontOrbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const fontJetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const fontDmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "HashPilot — Mining Intelligence for Club HashCash",
  description: "AI-powered strategy and analytics for hCASH miners. Optimize your setup, track halvings, and maximize earnings.",
  openGraph: {
    title: "HashPilot — Mining Intelligence for Club HashCash",
    description: "The retro-futuristic mission control for elite miners.",
    images: ["/og-image.png"], 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground selection:bg-amber-500/30",
          fontOrbitron.variable,
          fontJetbrainsMono.variable,
          fontDmSans.variable
        )}
      >
        <PriceProvider>
          <div className="flex h-screen overflow-hidden relative">
            <Sidebar />
            
            <div className="flex-1 flex flex-col relative z-10 w-full">
              <Header />
              <main className="flex-1 overflow-y-auto bg-dot-grid p-4 md:p-8 pb-20 lg:pb-8 relative flex flex-col">
                <div className="flex-1">
                  {children}
                </div>
                <Footer />
              </main>
            </div>

            <MobileNav />
            
            {/* Global UI Overlays */}
            <div className="scanlines pointer-events-none" />
          </div>
        </PriceProvider>
      </body>
    </html>
  );
}
