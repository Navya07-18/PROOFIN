"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { ReservationData } from "@/types";
import { getExplorerTxUrl, shortenAddress, shortenTxHash } from "@/lib/monad";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  QrCode as QrIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface DigitalTicketProps {
  reservation: ReservationData;
  onCheckInClick?: (reservation: ReservationData) => void;
}

export function DigitalTicket({ reservation, onCheckInClick }: DigitalTicketProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    // Generate QR payload containing ticket ID and attendee wallet
    const payload = JSON.stringify({
      ticketId: reservation.id,
      eventId: reservation.eventId,
      spotNumber: reservation.spotNumber,
      attendee: reservation.attendee,
      timestamp: reservation.reservedAt,
    });

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 1,
      color: {
        dark: "#121316",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [reservation]);

  const getStatusBadge = () => {
    switch (reservation.status) {
      case "CHECKED_IN":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            🔵 CHECKED IN
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            🔴 NO SHOW
          </span>
        );
      case "RESERVED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            🟡 RESERVED
          </span>
        );
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto group">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-[32px] blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

      {/* Main Ticket Surface */}
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-[28px] border border-white shadow-ticket overflow-hidden transition-all duration-300">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-indigo-950 text-white p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-indigo-300" />
              </div>
              <span className="font-bold text-xs tracking-wider uppercase text-white/90">
                PROOFIN PASS
              </span>
            </div>
            <span className="font-mono text-[10px] text-indigo-200 font-semibold bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {reservation.id}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black tracking-tight text-white line-clamp-1">
              {reservation.eventTitle}
            </h2>
            <p className="text-xs text-indigo-200/80 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
              <span className="truncate">{reservation.location}</span>
            </p>
          </div>

          {/* Spot Number Pill */}
          <div className="absolute top-4 right-4 text-right">
            <div className="px-3 py-1 bg-white text-charcoal-900 rounded-xl font-bold text-xs shadow-md">
              SPOT #{reservation.spotNumber}
            </div>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative h-6 bg-transparent flex items-center justify-between px-[-12px]">
          <div className="w-5 h-6 bg-background rounded-r-full -ml-2 border-r border-t border-b border-charcoal-200/40" />
          <div className="w-full border-t-2 border-dashed border-charcoal-200 mx-2" />
          <div className="w-5 h-6 bg-background rounded-l-full -mr-2 border-l border-t border-b border-charcoal-200/40" />
        </div>

        {/* Ticket Body */}
        <div className="p-6 pt-2 space-y-5">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-charcoal-50/70 p-4 rounded-2xl border border-charcoal-100 text-xs">
            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Date & Time
              </span>
              <span className="font-bold text-charcoal-900 block mt-0.5">
                {reservation.eventDate} · {reservation.eventTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Commitment
              </span>
              <span className="font-bold text-indigo-600 block mt-0.5">
                {reservation.depositAmount} MON (Locked)
              </span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Attendee
              </span>
              <span className="font-mono text-charcoal-700 block mt-0.5 truncate">
                {shortenAddress(reservation.attendee)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Check-in Window
              </span>
              <span className="font-semibold text-charcoal-800 block mt-0.5">
                Before {reservation.checkInDeadline}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-charcoal-200/60 shadow-inner">
            {qrCodeUrl ? (
              <div className="relative group/qr p-2 bg-white rounded-xl shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="Ticket QR Code"
                  className="w-48 h-48 rounded-lg object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-charcoal-50 rounded-xl">
                <QrIcon className="w-12 h-12 text-charcoal-300 animate-pulse" />
              </div>
            )}

            <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
              {getStatusBadge()}
              <p className="text-[11px] text-charcoal-500 max-w-[240px]">
                {reservation.status === "CHECKED_IN"
                  ? "✓ Attendance verified. Deposit released to your wallet."
                  : `Present this QR at check-in or submit on-chain before ${reservation.checkInDeadline}`}
              </p>
            </div>
          </div>

          {/* Lifecycle State Visual Bar */}
          <div className="bg-charcoal-50/80 p-3 rounded-xl border border-charcoal-200/40 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal-600 mb-1.5">
              <span>On-Chain Commitment State</span>
              <span className="text-indigo-600">
                {reservation.status === "CHECKED_IN"
                  ? "Settled (Released)"
                  : "Locked in Contract"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" title="Spot Reserved" />
              <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" title="Deposit Locked" />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  reservation.status === "CHECKED_IN" ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
                }`}
                title="Check-In"
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  reservation.status === "CHECKED_IN" ? "bg-emerald-500" : "bg-charcoal-200"
                }`}
                title="Deposit Released"
              />
            </div>
          </div>

          {/* Explorer Links & Actions */}
          <div className="space-y-2 pt-1">
            {reservation.status === "RESERVED" && (
              <Link
                href={`/checkin?ticket=${reservation.id}`}
                className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-charcoal-900/10 transition-all active:scale-[0.99]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Check In Now (Release {reservation.depositAmount} MON)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            )}

            {reservation.txHash && (
              <a
                href={getExplorerTxUrl(reservation.txHash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-charcoal-500 hover:text-indigo-600 transition-colors py-1.5 font-medium"
              >
                <span>View Reservation on Monad Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {reservation.checkInTxHash && (
              <a
                href={getExplorerTxUrl(reservation.checkInTxHash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 hover:underline py-1 font-semibold"
              >
                <span>View Settlement Transaction on Monadscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
