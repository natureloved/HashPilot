import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PriceProvider } from "@/components/providers/PriceProvider";
import ClientLayout from "@/components/layout/ClientLayout";

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
          <ClientLayout>
            {children}
          </ClientLayout>
        </PriceProvider>
      </body>
    </html>
  );
}
