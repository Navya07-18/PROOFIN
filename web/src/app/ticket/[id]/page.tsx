"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { DigitalTicket } from "@/components/DigitalTicket";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { reservations } = useWallet();

  const ticketId = params?.id as string;
  const reservation = reservations.find((r) => r.id === ticketId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/my-reservations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Tickets</span>
        </Link>
        <span className="text-[11px] font-mono font-medium text-charcoal-400 bg-charcoal-100/80 px-2.5 py-1 rounded-lg">
          Monad Pass #{ticketId}
        </span>
      </div>

      {reservation ? (
        <div className="space-y-6">
          <DigitalTicket
            reservation={reservation}
            onCheckInClick={() => router.push(`/checkin?ticket=${reservation.id}`)}
          />
        </div>
      ) : (
        <div className="text-center py-20 bg-white/70 rounded-3xl border border-charcoal-200/50 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-charcoal-900">Ticket Not Found</h2>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            This reservation ticket was not found in your current session. Please check your
            active reservations or reserve a spot in an upcoming event.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-charcoal-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md"
          >
            Explore Events
          </Link>
        </div>
      )}
    </div>
  );
}
