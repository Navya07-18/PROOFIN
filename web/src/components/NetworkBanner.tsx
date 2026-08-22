"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { MONAD_TESTNET } from "@/lib/monad";

export function NetworkBanner() {
  const { account, chainId, isMonad, switchNetwork } = useWallet();

  if (!account || isMonad) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-2.5 text-xs text-amber-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are connected to an unsupported network (Chain ID: {chainId}). Please switch to{" "}
            <strong>{MONAD_TESTNET.chainName} ({MONAD_TESTNET.chainId})</strong> to reserve spots and verify check-ins.
          </span>
        </div>
        <button
          onClick={switchNetwork}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          Switch to Monad Testnet
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
