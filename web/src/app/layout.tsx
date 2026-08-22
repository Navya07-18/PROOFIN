import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { Navbar } from "@/components/Navbar";
import { NetworkBanner } from "@/components/NetworkBanner";

export const metadata: Metadata = {
  title: "PROOFIN — Reserve it. Show up. Get your deposit back.",
  description:
    "Web3 reservation & commitment platform on Monad Testnet. Reserve limited spots by locking a MON commitment deposit, get checked in on-chain, and automatically receive your deposit back.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <WalletProvider>
          {/* Subtle Ambient Mesh Gradients */}
          <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-indigo-200/30 via-purple-100/20 to-transparent blur-3xl" />
            <div className="absolute top-[30%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-blue-200/25 via-indigo-100/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-emerald-100/20 via-sky-100/20 to-transparent blur-3xl" />
          </div>

          <NetworkBanner />
          <Navbar />
          <main className="flex-1">{children}</main>

          {/* Minimal Clean Footer */}
          <footer className="w-full border-t border-charcoal-200/40 bg-white/50 backdrop-blur-md py-8 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
              <div className="flex items-center gap-2">
                <span className="font-bold text-charcoal-900">PROOFIN</span>
                <span>•</span>
                <span>Reserve it. Show up. Get your deposit back.</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold border border-indigo-100">
                  ⚡ Powered by Monad Testnet (10143)
                </span>
                <a
                  href="https://testnet.monadscan.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-charcoal-900 transition-colors font-medium"
                >
                  Monadscan ↗
                </a>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
