"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EventData, ReservationData } from "@/types";
import { useWallet } from "@/context/WalletContext";
import { reserveSpotOnChain } from "@/lib/contract";
import { getExplorerTxUrl, shortenTxHash } from "@/lib/monad";
import {
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Lock,
} from "lucide-react";

interface ReservationModalProps {
  event: EventData | null;
  isOpen: boolean;
  onClose: () => void;
}

type TxStage = "IDLE" | "PROMPTING_WALLET" | "PENDING" | "CONFIRMED" | "ERROR";

export function ReservationModal({ event, isOpen, onClose }: ReservationModalProps) {
  const router = useRouter();
  const { account, isMonad, connectWallet, switchNetwork, getSigner, addReservation } =
    useWallet();

  const [stage, setStage] = useState<TxStage>("IDLE");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [newTicketId, setNewTicketId] = useState<string>("");

  if (!isOpen || !event) return null;

  const nextSpotNumber = event.reservedCount + 1;

  const handleConfirmReservation = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    if (!isMonad) {
      await switchNetwork();
      return;
    }

    setStage("PROMPTING_WALLET");
    setErrorMessage("");

    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Unable to obtain signer from MetaMask.");
      }

      setStage("PENDING");
      const result = await reserveSpotOnChain(event.id, event.depositAmount, signer);

      setTxHash(result.txHash);
      setStage("CONFIRMED");

      const ticketId = `PRF-10143-${event.id.toString().padStart(3, "0")}-${result.spotNumber.toString().padStart(3, "0")}`;
      setNewTicketId(ticketId);

      const reservation: ReservationData = {
        id: ticketId,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        location: event.location,
        spotNumber: result.spotNumber,
        attendee: account,
        depositAmount: event.depositAmount,
        reservedAt: Date.now(),
        checkInDeadline: event.checkInDeadline,
        status: "RESERVED",
        txHash: result.txHash,
      };

      addReservation(reservation);
    } catch (err: any) {
      console.error("Reservation transaction failed:", err);
      setStage("ERROR");
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setErrorMessage("Transaction was cancelled in MetaMask.");
      } else {
        setErrorMessage(
          err.reason || err.message || "Transaction failed to confirm on Monad Testnet."
        );
      }
    }
  };

  const handleViewTicket = () => {
    onClose();
    if (newTicketId) {
      router.push(`/ticket/${newTicketId}`);
    } else {
      router.push("/my-reservations");
    }
  };

  const resetAndClose = () => {
    setStage("IDLE");
    setTxHash("");
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-charcoal-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Confirm Spot Reservation
              </h2>
              <p className="text-xs text-charcoal-500">Lock Commitment Deposit on Monad</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {stage === "CONFIRMED" ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-2">
                  🟡 SPOT #{nextSpotNumber} SECURED
                </span>
                <h3 className="text-xl font-bold text-charcoal-900">
                  Reservation Confirmed!
                </h3>
                <p className="text-xs text-charcoal-600 max-w-sm mx-auto mt-1">
                  Your commitment deposit of <strong>{event.depositAmount} MON</strong> is
                  now safely locked on-chain. It will be released when you check in at the event.
                </p>
              </div>

              {/* Transaction Hash */}
              {txHash && (
                <div className="bg-charcoal-50 border border-charcoal-200/60 rounded-xl p-3 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-500 font-medium">Monad Transaction</span>
                    <a
                      href={getExplorerTxUrl(txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-mono text-indigo-600 hover:underline font-semibold"
                    >
                      <span>{shortenTxHash(txHash)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <button
                onClick={handleViewTicket}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-lg shadow-indigo-600/25 transition-all"
              >
                <span>View Digital Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : stage === "PENDING" || stage === "PROMPTING_WALLET" ? (
            /* In-flight State */
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  {stage === "PROMPTING_WALLET"
                    ? "Confirm in MetaMask..."
                    : "Securing your spot on Monad..."}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 max-w-xs mx-auto">
                  {stage === "PROMPTING_WALLET"
                    ? "Please approve the commitment deposit transaction in your wallet extension."
                    : "Recording your programmable reservation commitment on Monad Testnet."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs font-mono text-charcoal-600">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Monad Testnet • 10,000 TPS</span>
              </div>
            </div>
          ) : (
            /* Review & Confirm State */
            <>
              {/* Event Summary Card */}
              <div className="bg-charcoal-50/80 rounded-2xl p-4 border border-charcoal-200/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {event.category}
                    </span>
                    <h4 className="font-bold text-sm text-charcoal-900">{event.title}</h4>
                    <p className="text-xs text-charcoal-500 mt-0.5">{event.location}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-charcoal-200 rounded-lg text-xs font-bold text-charcoal-800 shadow-sm">
                    Spot #{nextSpotNumber}
                  </span>
                </div>

                <div className="pt-2 border-t border-charcoal-200/40 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-charcoal-400 block text-[10px]">Date & Time</span>
                    <span className="font-medium text-charcoal-800">
                      {event.eventDate} · {event.eventTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px]">
                      Check-in Deadline
                    </span>
                    <span className="font-medium text-charcoal-800">
                      {event.checkInDeadline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commitment & Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 text-charcoal-600">
                  <span>Commitment Deposit:</span>
                  <span className="font-bold text-sm text-charcoal-900">
                    {event.depositAmount} MON
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-charcoal-600">
                  <span>Network:</span>
                  <span className="font-medium text-charcoal-800">Monad Testnet (10143)</span>
                </div>

                <div className="flex items-center justify-between py-1 text-charcoal-600">
                  <span>Estimated Network Fee:</span>
                  <span className="font-mono text-emerald-600">&lt; 0.0001 MON</span>
                </div>
              </div>

              {/* Guarantee Banner */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">100% Refundable Deposit</p>
                  <p className="mt-0.5 text-emerald-800/90 leading-relaxed">
                    This is a refundable commitment deposit. When you show up and check in
                    at the event, the smart contract automatically returns your{" "}
                    <strong>{event.depositAmount} MON</strong>.
                  </p>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Actions */}
              <button
                onClick={handleConfirmReservation}
                className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-xl shadow-charcoal-900/15 transition-all"
              >
                <span>
                  {!account
                    ? "Connect MetaMask to Reserve"
                    : !isMonad
                    ? "Switch to Monad Testnet"
                    : `Confirm Reservation (${event.depositAmount} MON)`}
                </span>
                <ArrowRight className="w-4 h-4 text-indigo-300" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
