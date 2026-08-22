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
  Utensils,
  Scissors,
  Ticket,
  Camera,
} from "lucide-react";

interface DigitalTicketProps {
  reservation: ReservationData;
  onCheckInClick?: (reservation: ReservationData) => void;
}

export function DigitalTicket({ reservation, onCheckInClick }: DigitalTicketProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
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
            🔵 CHECKED IN (DEPOSIT RELEASED)
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            🔴 NO SHOW (DEPOSIT FORFEITED)
          </span>
        );
      case "RESERVED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            🟡 RESERVED (DEPOSIT LOCKED)
          </span>
        );
    }
  };

  const getCategoryBadge = () => {
    switch (reservation.categoryType) {
      case "RESTAURANT":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-200 border border-amber-400/30">
            <Utensils className="w-3 h-3" /> Dining Table
          </span>
        );
      case "SALON":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-200 border border-purple-400/30">
            <Scissors className="w-3 h-3" /> Salon Appointment
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
            <Ticket className="w-3 h-3" /> Event Pass
          </span>
        );
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto group">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-[32px] blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

      <div className="relative bg-white/90 backdrop-blur-2xl rounded-[28px] border border-white shadow-ticket overflow-hidden transition-all duration-300">
        {/* Header */}
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
            {getCategoryBadge()}
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

          {/* Spot Number */}
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
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 bg-charcoal-50/70 p-4 rounded-2xl border border-charcoal-100 text-xs">
            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Event Hours (IST)
              </span>
              <span className="font-bold text-charcoal-900 block mt-0.5">
                {reservation.eventDate} ({reservation.eventTimeRange})
              </span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Registration / Check-in Cutoff
              </span>
              <span className="font-bold text-indigo-700 block mt-0.5">
                {reservation.checkInTimeWindow.split("-")[1] || reservation.checkInTimeWindow}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Locked MON
              </span>
              <span className="font-bold text-indigo-600 block mt-0.5">
                {reservation.depositAmount} MON
              </span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-400 font-medium uppercase tracking-wider block">
                Attendee Wallet
              </span>
              <span className="font-mono text-charcoal-700 block mt-0.5 truncate">
                {shortenAddress(reservation.attendee)}
              </span>
            </div>
          </div>

          {/* QR Code */}
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
              <p className="text-[11px] text-charcoal-500 max-w-[260px] leading-relaxed">
                {reservation.status === "CHECKED_IN"
                  ? "✓ Verified by Organizer! 100% of your deposit has been returned to your wallet."
                  : `Show this QR code to the Event Organizer or Receptionist at venue to scan & refund your ${reservation.depositAmount} MON.`}
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="space-y-2 pt-1">
            {reservation.status === "RESERVED" && (
              <Link
                href={`/checkin?ticket=${reservation.id}&mode=organizer`}
                className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-charcoal-900/10 transition-all active:scale-[0.99]"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>Open Organizer Scanner to Scan QR</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            )}

            {reservation.txHash && (
              <a
                href={getExplorerTxUrl(reservation.txHash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-charcoal-500 hover:text-indigo-600 transition-colors py-1 font-medium"
              >
                <span>View Deposit Tx on Monadscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
