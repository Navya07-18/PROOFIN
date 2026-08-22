"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { GlassCard } from "@/components/GlassCard";
import { getExplorerTxUrl, shortenAddress, shortenTxHash } from "@/lib/monad";
import {
  Ticket,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  QrCode,
} from "lucide-react";

export default function MyReservationsPage() {
  const { account, reservations, connectWallet } = useWallet();
  const [filter, setFilter] = useState<string>("ALL");

  const filteredReservations = reservations.filter((r) => {
    if (filter === "ACTIVE") return r.status === "RESERVED";
    if (filter === "CHECKED_IN") return r.status === "CHECKED_IN";
    if (filter === "NO_SHOW") return r.status === "NO_SHOW";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/80 rounded-full text-xs font-bold text-indigo-700">
            <Ticket className="w-3.5 h-3.5 text-indigo-600" />
            <span>My Commitments</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal-900 tracking-tight mt-1">
            Reservation Passes
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Track your on-chain commitments, digital passes, and deposit settlement history.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-charcoal-100/70 p-1 rounded-xl border border-charcoal-200/50 text-xs">
          {["ALL", "ACTIVE", "CHECKED_IN"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filter === tab
                  ? "bg-white text-charcoal-900 shadow-sm"
                  : "text-charcoal-500 hover:text-charcoal-900"
              }`}
            >
              {tab === "ALL"
                ? `All (${reservations.length})`
                : tab === "ACTIVE"
                ? `Active (${reservations.filter((r) => r.status === "RESERVED").length})`
                : `Settled (${reservations.filter((r) => r.status === "CHECKED_IN").length})`}
            </button>
          ))}
        </div>
      </div>

      {!account ? (
        <GlassCard className="p-12 text-center space-y-4">
          <Ticket className="w-12 h-12 text-charcoal-300 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-charcoal-900">Connect Wallet to View Passes</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Connect your MetaMask wallet to view your active commitments and digital passes on Monad.
          </p>
          <button
            onClick={connectWallet}
            className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all"
          >
            Connect MetaMask
          </button>
        </GlassCard>
      ) : filteredReservations.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-indigo-300 mx-auto" />
          <h3 className="text-base font-bold text-charcoal-900">No Reservations Yet</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            You don&apos;t have any reservations in this tab. Explore upcoming events on Monad and lock
            your spot.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md"
          >
            Explore Events
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => {
            const isCheckedIn = res.status === "CHECKED_IN";
            return (
              <GlassCard
                key={res.id}
                className="p-6 border-charcoal-200/60 hover:border-indigo-300/80 transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {res.id}
                      </span>
                      <span className="text-xs font-bold text-charcoal-900 bg-charcoal-100 px-2 py-0.5 rounded-md">
                        SPOT #{res.spotNumber}
                      </span>
                      {isCheckedIn ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-full border border-emerald-200">
                          🟢 Deposit Released
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 font-bold text-[11px] rounded-full border border-amber-200">
                          🟡 Reserved (Deposit Locked)
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-charcoal-900">{res.eventTitle}</h3>
                    <p className="text-xs text-charcoal-500 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>{res.location}</span>
                    </p>
                  </div>

                  {/* Quick CTAs */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <Link
                      href={`/ticket/${res.id}`}
                      className="flex items-center gap-1.5 bg-white hover:bg-charcoal-50 text-charcoal-800 font-semibold px-3.5 py-2 rounded-xl text-xs border border-charcoal-200 shadow-sm transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Pass</span>
                    </Link>

                    {!isCheckedIn && (
                      <Link
                        href={`/checkin?ticket=${res.id}`}
                        className="flex items-center gap-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-charcoal-900/10 transition-all"
                      >
                        <span>Check In</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-300" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* State Machine Lifecycle Progress Bar */}
                <div className="bg-charcoal-50/80 p-4 rounded-2xl border border-charcoal-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-600">
                    <span>Smart Contract Settlement Lifecycle</span>
                    <span className="text-indigo-600 font-bold">
                      {isCheckedIn ? "100% Settled" : "Awaiting Event Check-In"}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-medium">
                    <div className="space-y-1">
                      <div className="h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-charcoal-700 block">✓ Spot Reserved</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-charcoal-700 block">✓ {res.depositAmount} MON Locked</span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          isCheckedIn ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
                        }`}
                      />
                      <span className={isCheckedIn ? "text-charcoal-700" : "text-amber-700 font-bold"}>
                        {isCheckedIn ? "✓ Checked In" : "● Check In Before Deadline"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          isCheckedIn ? "bg-emerald-500" : "bg-charcoal-200"
                        }`}
                      />
                      <span className={isCheckedIn ? "text-emerald-700 font-bold" : "text-charcoal-400"}>
                        {isCheckedIn ? "✓ Deposit Released" : "○ Deposit Release"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Explorer Link */}
                {res.txHash && (
                  <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1">
                    <span>Recorded on Monad Testnet</span>
                    <a
                      href={getExplorerTxUrl(res.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-indigo-600 hover:underline font-mono"
                    >
                      <span>Tx: {shortenTxHash(res.txHash)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
