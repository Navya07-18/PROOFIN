"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { GlassCard } from "@/components/GlassCard";
import { ReservationModal } from "@/components/ReservationModal";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  Scissors,
  Ticket,
  XCircle,
  ExternalLink,
  Coins,
} from "lucide-react";
import { shortenAddress, getExplorerTxUrl, shortenTxHash } from "@/lib/monad";

const DEMO_EXPIRED_ATTENDEES = [
  { wallet: "0x7a39Fd6e51aad88F6F4ce6aB8827279cffFb9226", spot: 1, status: "CHECKED_IN", amount: "0.01 MON", tx: "0xa81f4c39810a95bc8129841804bcdefa10481029481928410294810294810294" },
  { wallet: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7", spot: 2, status: "CHECKED_IN", amount: "0.01 MON", tx: "0x9184810294810294810294810294810294810294810294810294810294810294" },
  { wallet: "0x3A52c8b09d94C9B71261d763E48fA11953E26Fa3", spot: 3, status: "NO_SHOW", amount: "0.01 MON", tx: "0x3841029481029481029481029481029481029481029481029481029481029481" },
  { wallet: "0x4e59b44847b379578588920ca78fbf26c0b4956c", spot: 4, status: "CHECKED_IN", amount: "0.01 MON", tx: "0x7281029481029481029481029481029481029481029481029481029481029481" },
  { wallet: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938", spot: 5, status: "NO_SHOW", amount: "0.01 MON", tx: "0x4481029481029481029481029481029481029481029481029481029481029481" },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { events, reservations } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const eventId = Number(params?.id);
  const event = events.find((e) => e.id === eventId) || events[0];

  const userReservation = reservations.find((r) => r.eventId === event?.id);
  const isSoldOut = event.reservedCount >= event.capacity;
  const isExpired = event.isExpired || !event.active;
  const spotsLeft = Math.max(0, event.capacity - event.reservedCount);
  const percentFilled = Math.min(
    100,
    Math.round((event.reservedCount / event.capacity) * 100)
  );

  const getCategoryIcon = () => {
    switch (event.categoryType) {
      case "RESTAURANT":
        return <Utensils className="w-5 h-5 text-indigo-600 flex-shrink-0" />;
      case "SALON":
        return <Scissors className="w-5 h-5 text-purple-600 flex-shrink-0" />;
      default:
        return <Ticket className="w-5 h-5 text-indigo-600 flex-shrink-0" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-glass-elevated border border-white/80 bg-charcoal-950 text-white">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={event.imageURI}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white">
              {event.category}
            </span>
            {isExpired ? (
              <span className="px-3 py-1 bg-rose-600 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md">
                🔴 Event Expired / Completed
              </span>
            ) : event.isFeatured ? (
              <span className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md">
                Featured
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {event.title}
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>{event.location}</span>
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Info Column */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-charcoal-900">About this Event</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              {event.description}
            </p>
          </GlassCard>

          {/* Schedule Card */}
          <GlassCard className="p-6 space-y-4 border-indigo-100">
            <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              {getCategoryIcon()}
              <span>Schedule & Check-In Window (IST)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 bg-charcoal-50/70 p-3.5 rounded-xl border border-charcoal-100">
                <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                    Event Date (IST)
                  </span>
                  <span className="font-bold text-charcoal-800">{event.eventDate}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-charcoal-50/70 p-3.5 rounded-xl border border-charcoal-100">
                <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">
                    Event Hours
                  </span>
                  <span className="font-bold text-charcoal-800">{event.eventTimeRange}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-100 sm:col-span-2">
                <Clock className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-indigo-600 block text-[10px] uppercase font-bold">
                    Registration / Check-In Closes
                  </span>
                  <span className="font-bold text-indigo-900 text-sm">
                    {event.checkInTimeWindow.split("-")[1] || event.checkInTimeWindow}
                  </span>
                  <p className="text-[11px] text-indigo-700/90 mt-0.5">
                    Registrations and check-ins must be completed by {event.checkInTimeWindow.split("-")[1] || event.checkInTimeWindow}. Those who attend receive 100% of their deposit back; missed attendees forfeit their MON to the organizer.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* EXPIRED / MISSED PEOPLE STATUS SECTION */}
          {isExpired && (
            <GlassCard className="p-6 space-y-5 border-rose-200 bg-rose-50/20">
              <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Event Settlement & Attendance Breakdown</span>
                </div>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[11px] font-bold">
                  Final Status
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 block text-[10px] font-bold uppercase">
                    Attended People
                  </span>
                  <span className="text-xl font-black text-emerald-800">
                    {event.checkedInCount || 42} / {event.capacity}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    100% MON Refunded
                  </span>
                </div>

                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="text-rose-700 block text-[10px] font-bold uppercase">
                    Missed People (No-Shows)
                  </span>
                  <span className="text-xl font-black text-rose-800">
                    {event.noShowCount || 8}
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                    Deposits Forfeited to Organizer
                  </span>
                </div>

                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 col-span-2 sm:col-span-1">
                  <span className="text-indigo-700 block text-[10px] font-bold uppercase">
                    Total Forfeited Escrow
                  </span>
                  <span className="text-xl font-black text-indigo-900">
                    {((event.noShowCount || 8) * parseFloat(event.depositAmount)).toFixed(2)} MON
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                    Sent to Organizer Address
                  </span>
                </div>
              </div>

              {/* Sample Attendee Table */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-charcoal-800">Attendee Record & Status Logs</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {DEMO_EXPIRED_ATTENDEES.map((att) => (
                    <div
                      key={att.spot}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-charcoal-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal-800">Spot #{att.spot}</span>
                        <span className="font-mono text-charcoal-600">{shortenAddress(att.wallet)}</span>
                      </div>

                      {att.status === "CHECKED_IN" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Attended ({att.amount} Refunded)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Missed ({att.amount} Forfeited)</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Guarantee Card */}
          {!isExpired && (
            <GlassCard className="p-6 space-y-4 bg-emerald-50/40 border-emerald-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-charcoal-900">
                  Smart Contract Commitment Rules
                </h3>
              </div>

              <div className="space-y-3 text-xs text-charcoal-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Refundable Deposit:</strong> Your deposit of{" "}
                    <strong>{event.depositAmount} MON</strong> is locked safely in the smart contract and returned to your wallet upon check-in.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No-Show Rule:</strong> If you do not check in before{" "}
                    <strong>{event.checkInTimeWindow.split("-")[1] || event.checkInTimeWindow}</strong>, the deposit is forfeited to the business/organizer to protect unused capacity.
                  </span>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Checkout Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <GlassCard variant="elevated" className="p-6 space-y-6 border-indigo-200/70">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-charcoal-400 uppercase font-semibold tracking-wider">
                    Commitment Deposit
                  </span>
                  <div className="text-3xl font-black text-charcoal-900 mt-0.5">
                    {event.depositAmount} <span className="text-indigo-600">MON</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                  🟢 Refundable
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2 bg-charcoal-50 p-4 rounded-2xl border border-charcoal-100">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-charcoal-700">Spots / Tables Reserved</span>
                  <span className={spotsLeft <= 3 ? "text-rose-600 font-bold" : "text-indigo-600"}>
                    {event.reservedCount} / {event.capacity} reserved ({spotsLeft} left)
                  </span>
                </div>
                <div className="w-full bg-charcoal-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
              </div>

              {/* Host info */}
              <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Hosted by</span>
                  <span className="font-bold text-charcoal-900">{event.organizerName}</span>
                </div>
                <span className="font-mono text-charcoal-500 text-[11px]">
                  {shortenAddress(event.organizer)}
                </span>
              </div>

              {/* Action Button */}
              {isExpired ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-center space-y-1">
                  <span className="font-bold text-xs block">Event Time Expired</span>
                  <span className="text-[11px] text-rose-700 block">
                    Registrations and check-ins are closed for this event.
                  </span>
                </div>
              ) : userReservation ? (
                <div className="space-y-3">
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>You reserved <strong>Spot #{userReservation.spotNumber}</strong>!</span>
                  </div>
                  <Link
                    href={`/ticket/${userReservation.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all"
                  >
                    <span>View Digital Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : isSoldOut ? (
                <button
                  disabled
                  className="w-full bg-charcoal-100 text-charcoal-400 font-bold py-3.5 px-4 rounded-xl text-xs cursor-not-allowed"
                >
                  Fully Booked
                </button>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-xl shadow-charcoal-900/15 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <span>RESERVE SPOT ({event.depositAmount} MON)</span>
                  <ArrowRight className="w-4 h-4 text-indigo-300" />
                </button>
              )}

              <p className="text-[11px] text-charcoal-400 text-center">
                Requires manual transaction approval in your MetaMask extension.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>

      <ReservationModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
