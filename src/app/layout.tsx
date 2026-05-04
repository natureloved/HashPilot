import type { Metadata } from "next";
import { Inter, Space_Grotesk, Orbitron } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PriceProvider } from "@/components/providers/PriceProvider";
import { DemoProvider } from "@/components/providers/DemoProvider";
import ClientLayout from "@/components/layout/ClientLayout";
import AppBackground from "@/components/layout/AppBackground";
import { Web3Provider } from "@/components/providers/Web3Provider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "HashPilot — Mining Intelligence Terminal",
  description: "Know exactly when to claim. Know exactly how your mine compares.",
  openGraph: {
    title: "HashPilot — Mining Intelligence Terminal",
    description: "Know exactly when to claim. Know exactly how your mine compares.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HashPilot Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HashPilot — Mining Intelligence Terminal",
    description: "Know exactly when to claim. Know exactly how your mine compares.",
    images: ["/og-image.png"],
  },
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
          orbitron.variable,
          spaceGrotesk.variable
        )}
      >
        <PriceProvider>
          <DemoProvider>
            <Web3Provider>
              <AppBackground />
              <ClientLayout>
                {children}
              </ClientLayout>
            </Web3Provider>
          </DemoProvider>
        </PriceProvider>
      </body>
    </html>
  );
}

