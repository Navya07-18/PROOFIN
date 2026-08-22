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
  ExternalLink,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { shortenAddress } from "@/lib/monad";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { events, reservations } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const eventId = Number(params?.id);
  const event = events.find((e) => e.id === eventId) || events[0];

  const userReservation = reservations.find((r) => r.eventId === event?.id);
  const isSoldOut = event.reservedCount >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.reservedCount);
  const percentFilled = Math.min(
    100,
    Math.round((event.reservedCount / event.capacity) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
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
            {event.isFeatured && (
              <span className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md">
                Featured Event
              </span>
            )}
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

      {/* Main Grid: Details + Reservation Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Event Details & Policies */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-charcoal-900">About this Event</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              {event.description}
            </p>
          </GlassCard>

          {/* Location & Time Info */}
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-base font-bold text-charcoal-900">Schedule & Venue</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 bg-charcoal-50/70 p-3.5 rounded-xl border border-charcoal-100">
                <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Date</span>
                  <span className="font-bold text-charcoal-800">{event.eventDate}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-charcoal-50/70 p-3.5 rounded-xl border border-charcoal-100">
                <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Event Time</span>
                  <span className="font-bold text-charcoal-800">{event.eventTime}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-charcoal-50/70 p-3.5 rounded-xl border border-charcoal-100 sm:col-span-2">
                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Location</span>
                  <span className="font-bold text-charcoal-800">{event.location}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Commitment & No-Show Policy Card */}
          <GlassCard className="p-6 space-y-4 border-indigo-100 bg-indigo-50/40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-charcoal-900">
                Smart Contract Commitment Policy
              </h3>
            </div>

            <div className="space-y-3 text-xs text-charcoal-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>100% Refundable Deposit:</strong> Your commitment deposit of{" "}
                  <strong>{event.depositAmount} MON</strong> is held securely by the smart
                  contract and released back to your wallet immediately when you check in.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Check-in Deadline:</strong> Attendees must check in before{" "}
                  <strong>{event.checkInDeadline}</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>No-Show Rule:</strong> Unverified reservations past deadline are
                  forfeited to the organizer/event pool to protect capacity.
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Reservation Checkout Card */}
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

              {/* Spots Progress Bar */}
              <div className="space-y-2 bg-charcoal-50 p-4 rounded-2xl border border-charcoal-100">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-charcoal-700">Available Spots</span>
                  <span className={spotsLeft <= 5 ? "text-rose-600 font-bold" : "text-indigo-600"}>
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

              {/* Organizer Meta */}
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
              {userReservation ? (
                <div className="space-y-3">
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>You already reserved <strong>Spot #{userReservation.spotNumber}</strong>!</span>
                  </div>
                  <Link
                    href={`/ticket/${userReservation.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all"
                  >
                    <span>View Digital Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : isSoldOut ? (
                <button
                  disabled
                  className="w-full bg-charcoal-100 text-charcoal-400 font-bold py-3.5 px-4 rounded-xl text-xs cursor-not-allowed"
                >
                  Event Full (Sold Out)
                </button>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-xl shadow-charcoal-900/15 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <span>RESERVE MY SPOT ({event.depositAmount} MON)</span>
                  <ArrowRight className="w-4 h-4 text-indigo-300" />
                </button>
              )}

              <p className="text-[11px] text-charcoal-400 text-center">
                Instant confirmation on Monad Testnet with &lt; 800ms finality.
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
