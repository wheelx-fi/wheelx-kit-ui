import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WheelX Widget Demo",
  description:
    "One-click integration of Bridge & Swap, with 100% support for custom configuration.",
  keywords: [
    "WheelX",
    "Widget",
    "wheelx api",
    "wheelx sdk",
    "wheelx Widget",
    "bridge",
    "swap",
    "solana",
    "ethereum",
    "bnbchain",
    "base",
    "aggregator",
    "soneium",
    "polygon",
    "polymarket",
    "linea",
    "ink",
    "hyperevm",
    "hyperliquid",
    "predict market",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
