"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EventData } from "@/types";
import { useWallet } from "@/context/WalletContext";
import { GlassCard } from "./GlassCard";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface EventCardProps {
  event: EventData;
  onReserveClick?: (event: EventData) => void;
}

export function EventCard({ event, onReserveClick }: EventCardProps) {
  const { reservations } = useWallet();

  const userReservation = reservations.find((r) => r.eventId === event.id);
  const isFullyBooked = event.reservedCount >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.reservedCount);
  const percentageReserved = Math.min(
    100,
    Math.round((event.reservedCount / event.capacity) * 100)
  );

  return (
    <GlassCard
      variant="interactive"
      className="group overflow-hidden flex flex-col justify-between border-charcoal-200/40 hover:border-indigo-300/60"
    >
      <div>
        {/* Cover Image & Category Badge */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-charcoal-100">
          <img
            src={event.imageURI}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/90 text-charcoal-900 backdrop-blur-md shadow-sm">
              {event.category}
            </span>
            {event.isFeatured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-600 text-white backdrop-blur-md shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* Commitment Deposit Pill */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-white/80 flex items-center gap-1.5">
            <span className="text-[11px] text-charcoal-500 font-medium">Commitment:</span>
            <span className="text-xs font-bold text-indigo-700">
              {event.depositAmount} MON
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-bold text-base text-charcoal-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {event.title}
          </h3>

          {/* Meta Info: Date, Time, Location */}
          <div className="mt-3 space-y-1.5 text-xs text-charcoal-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>
                <strong>{event.eventDate}</strong> · {event.eventTime}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Spots Progress Bar */}
          <div className="mt-4 pt-3 border-t border-charcoal-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-medium text-charcoal-700">
                <Users className="w-3.5 h-3.5 text-charcoal-400" />
                <span>
                  {event.reservedCount} / {event.capacity} spots reserved
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  spotsLeft <= 5 ? "text-rose-600 font-bold" : "text-charcoal-500"
                }`}
              >
                {spotsLeft === 0 ? "Sold Out" : `${spotsLeft} spots left`}
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-charcoal-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentageReserved > 90
                    ? "bg-rose-500"
                    : percentageReserved > 70
                    ? "bg-amber-500"
                    : "bg-indigo-600"
                }`}
                style={{ width: `${percentageReserved}%` }}
              />
            </div>
          </div>

          {/* Policy badge */}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium truncate">
              🟢 100% Refundable upon check-in
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 pb-5 pt-1 flex items-center gap-2">
        {userReservation ? (
          <Link
            href={`/ticket/${userReservation.id}`}
            className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors border border-indigo-200/70 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>View My Ticket (#{userReservation.spotNumber})</span>
            <ArrowRight className="w-3 h-3 ml-auto" />
          </Link>
        ) : isFullyBooked ? (
          <button
            disabled
            className="w-full bg-charcoal-100 text-charcoal-400 font-semibold px-4 py-2.5 rounded-xl text-xs cursor-not-allowed"
          >
            Capacity Reached
          </button>
        ) : (
          <button
            onClick={() => onReserveClick && onReserveClick(event)}
            className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 active:scale-[0.99] text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-charcoal-900/10 transition-all duration-150 group/btn"
          >
            <span>Reserve Spot ({event.depositAmount} MON)</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </GlassCard>
  );
}
