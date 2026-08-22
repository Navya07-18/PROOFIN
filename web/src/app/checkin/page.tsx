"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useWallet } from "@/context/WalletContext";
import { GlassCard } from "@/components/GlassCard";
import { checkInOnChain } from "@/lib/contract";
import { getExplorerTxUrl, shortenAddress, shortenTxHash } from "@/lib/monad";
import { ReservationData } from "@/types";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Ticket,
} from "lucide-react";

function CheckInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    account,
    isMonad,
    connectWallet,
    switchNetwork,
    getSigner,
    reservations,
    updateReservationStatus,
  } = useWallet();

  const ticketParam = searchParams.get("ticket");

  const [selectedTicketId, setSelectedTicketId] = useState<string>(ticketParam || "");
  const [manualTicketInput, setManualTicketInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCheckedInSuccess, setIsCheckedInSuccess] = useState<boolean>(false);
  const [checkInTxHash, setCheckInTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [checkedInReservation, setCheckedInReservation] = useState<ReservationData | null>(null);

  // Available user reservations for quick selection
  const activeReservations = reservations.filter((r) => r.status === "RESERVED");

  useEffect(() => {
    if (ticketParam) {
      setSelectedTicketId(ticketParam);
    } else if (activeReservations.length > 0 && !selectedTicketId) {
      setSelectedTicketId(activeReservations[0].id);
    }
  }, [ticketParam, activeReservations, selectedTicketId]);

  const activeTicket =
    reservations.find((r) => r.id === selectedTicketId) ||
    reservations.find((r) => r.id === manualTicketInput) ||
    activeReservations[0];

  const handleExecuteCheckIn = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    if (!isMonad) {
      await switchNetwork();
      return;
    }

    const ticketToUse = activeTicket;
    if (!ticketToUse) {
      setErrorMessage("Please select or enter a valid active reservation ticket.");
      return;
    }

    // Authorization verification: Check wallet matches reservation
    if (ticketToUse.attendee && account.toLowerCase() !== ticketToUse.attendee.toLowerCase()) {
      setErrorMessage(
        `Ownership mismatch: This ticket belongs to ${shortenAddress(
          ticketToUse.attendee
        )}, but you are connected with ${shortenAddress(account)}.`
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Unable to obtain MetaMask signer.");
      }

      const result = await checkInOnChain(ticketToUse.eventId, signer);
      setCheckInTxHash(result.txHash);
      setCheckedInReservation(ticketToUse);
      setIsCheckedInSuccess(true);

      // Update global context & local storage
      updateReservationStatus(ticketToUse.eventId, "CHECKED_IN", result.txHash);

      // Trigger Confetti Celebration 🎉
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6366F1", "#8B5CF6", "#10B981", "#38BDF8", "#F59E0B"],
        });
      } catch (e) {}
    } catch (err: any) {
      console.error("Check-in failed:", err);
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setErrorMessage("Transaction was cancelled in MetaMask.");
      } else {
        setErrorMessage(
          err.reason || err.message || "Failed to process check-in on Monad Testnet."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/80 rounded-full text-xs font-bold text-indigo-700">
          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
          <span>Live Check-In Portal</span>
        </div>
        <h1 className="text-3xl font-black text-charcoal-900 tracking-tight">
          Verify Attendance & Release Deposit
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm mx-auto">
          Submit your on-chain attendance verification to automatically unlock and release your
          MON commitment deposit.
        </p>
      </div>

      {isCheckedInSuccess && checkedInReservation ? (
        /* SUCCESS CELEBRATION STATE (# YOU'RE IN 🎉) */
        <GlassCard
          variant="elevated"
          className="p-8 text-center space-y-6 border-emerald-200 bg-white/95 animate-scale-up shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-black tracking-wide uppercase">
              Attendance Verified
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900">
              YOU&apos;RE IN 🎉
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm mx-auto">
              Your commitment deposit of
            </p>
            <div className="text-3xl font-black text-emerald-600">
              {checkedInReservation.depositAmount} MON
            </div>
            <p className="text-xs text-charcoal-500 font-medium">
              has been released automatically back to your wallet.
            </p>
          </div>

          {/* Transaction Card */}
          {checkInTxHash && (
            <div className="bg-charcoal-50 rounded-2xl p-4 border border-charcoal-200/60 text-left space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-charcoal-500 font-medium">Settlement Hash</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Confirmed on Monad
                </span>
              </div>
              <a
                href={getExplorerTxUrl(checkInTxHash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-1 font-mono text-xs font-semibold text-indigo-600 hover:underline pt-1"
              >
                <span>{shortenTxHash(checkInTxHash)}</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              </a>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => router.push(`/ticket/${checkedInReservation.id}`)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all"
            >
              View Updated Pass
            </button>
            <button
              onClick={() => router.push("/my-reservations")}
              className="w-full bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-900 font-semibold py-3.5 px-4 rounded-xl text-xs transition-colors"
            >
              My Commitments
            </button>
          </div>
        </GlassCard>
      ) : (
        /* CHECK-IN FORM */
        <GlassCard className="p-6 sm:p-8 space-y-6">
          {/* Active Ticket Selector */}
          {activeReservations.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal-800">
                Select Your Reserved Ticket
              </label>
              <select
                value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="w-full p-3 bg-white border border-charcoal-200 rounded-xl text-xs font-semibold text-charcoal-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
              >
                {activeReservations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.eventTitle} — Spot #{r.spotNumber} ({r.id})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal-800">
                Enter Reservation / Ticket ID
              </label>
              <input
                type="text"
                placeholder="e.g. PRF-10143-001-49"
                value={manualTicketInput}
                onChange={(e) => setManualTicketInput(e.target.value)}
                className="w-full p-3 bg-white border border-charcoal-200 rounded-xl text-xs font-mono text-charcoal-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
              />
            </div>
          )}

          {/* Active Ticket Summary Preview */}
          {activeTicket && (
            <div className="bg-charcoal-50/90 rounded-2xl p-4 border border-charcoal-200/50 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase">
                    {activeTicket.id}
                  </span>
                  <h4 className="font-bold text-sm text-charcoal-900">
                    {activeTicket.eventTitle}
                  </h4>
                  <p className="text-xs text-charcoal-500">{activeTicket.location}</p>
                </div>
                <div className="px-2.5 py-1 bg-white border border-charcoal-200 rounded-lg text-xs font-bold text-charcoal-800 shadow-sm">
                  Spot #{activeTicket.spotNumber}
                </div>
              </div>

              <div className="pt-2 border-t border-charcoal-200/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Release Amount</span>
                  <span className="font-bold text-emerald-600">
                    +{activeTicket.depositAmount} MON
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Attendee Wallet</span>
                  <span className="font-mono text-charcoal-700">
                    {shortenAddress(activeTicket.attendee || account)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trust Guarantee */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold">Cryptographic Attendance Verification</p>
              <p className="mt-0.5 text-emerald-800/90 leading-relaxed">
                The smart contract verifies that your connected wallet owns this spot and
                safely transfers the locked deposit back in the same atomic transaction.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Execute Check-In Button */}
          <button
            onClick={handleExecuteCheckIn}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 active:scale-[0.99] disabled:opacity-60 text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-xl shadow-charcoal-900/15 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
                <span>Broadcasting Check-In on Monad...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {!account
                    ? "Connect MetaMask to Check In"
                    : !isMonad
                    ? "Switch to Monad Testnet"
                    : `Check In & Release ${activeTicket?.depositAmount || "0.01"} MON`}
                </span>
                <ArrowRight className="w-4 h-4 text-indigo-300 ml-auto" />
              </>
            )}
          </button>
        </GlassCard>
      )}
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-charcoal-500">Loading Check-In Station...</div>}>
      <CheckInContent />
    </Suspense>
  );
}
