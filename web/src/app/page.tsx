"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { EventCard } from "@/components/EventCard";
import { ReservationModal } from "@/components/ReservationModal";
import { GlassCard } from "@/components/GlassCard";
import { EventData, CategoryType } from "@/types";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  MapPin,
  Lock,
  QrCode,
  Coins,
  Search,
  PlusCircle,
  Utensils,
  Scissors,
  Ticket,
  Clock,
} from "lucide-react";

export default function HomePage() {
  const { events } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalEvent, setModalEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const featuredEvent = events.find((e) => e.isFeatured) || events[0];

  const categories = ["All", "Events", "Restaurants", "Salons", "Workshops"];

  const filteredEvents = events.filter((event) => {
    let matchesCategory = true;
    if (selectedCategory === "Events") {
      matchesCategory = event.categoryType === "EVENT";
    } else if (selectedCategory === "Restaurants") {
      matchesCategory = event.categoryType === "RESTAURANT";
    } else if (selectedCategory === "Salons") {
      matchesCategory = event.categoryType === "SALON";
    } else if (selectedCategory === "Workshops") {
      matchesCategory = event.categoryType === "WORKSHOP";
    }

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleReserveClick = (event: EventData) => {
    setModalEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Events • Restaurants • Salons Commitment Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-charcoal-900 tracking-tight leading-[1.08]">
              Reserve with <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                confidence.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-charcoal-600 font-medium max-w-xl leading-relaxed">
              Put down a small commitment. Show up. Get it back.
            </p>

            <p className="text-xs sm:text-sm text-charcoal-500 max-w-lg leading-relaxed">
              Whether reserving a limited workshop spot, a gourmet dining table, or a VIP salon appointment—PROOFIN locks your MON deposit into an on-chain smart contract and <strong>automatically refunds 100%</strong> when you check in on time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#discovery"
                className="flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold px-6 py-3.5 rounded-2xl text-sm shadow-xl shadow-charcoal-900/15 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Explore Listings</span>
                <ArrowRight className="w-4 h-4 text-indigo-300" />
              </a>

              <Link
                href="/organizer"
                className="flex items-center gap-2 bg-white/90 hover:bg-white text-charcoal-900 font-semibold px-5 py-3.5 rounded-2xl text-sm border border-charcoal-200/80 shadow-sm transition-all duration-200 hover:border-indigo-300"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Create Listing</span>
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="pt-6 border-t border-charcoal-200/50 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <span className="block text-xl font-bold text-charcoal-900">10,000</span>
                <span className="text-[11px] text-charcoal-500 font-medium">TPS Monad Speed</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-emerald-600">100%</span>
                <span className="text-[11px] text-charcoal-500 font-medium">Refunded on Arrival</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-indigo-600">&lt; 800ms</span>
                <span className="text-[11px] text-charcoal-500 font-medium">Finality</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Event Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-xl text-[11px] font-bold shadow-lg z-20 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>FEATURED WORKSHOP</span>
              </div>

              {featuredEvent && (
                <GlassCard variant="elevated" className="overflow-hidden border-indigo-200/60 p-6 space-y-5">
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden">
                    <img
                      src={featuredEvent.imageURI}
                      alt={featuredEvent.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider">
                        {featuredEvent.category}
                      </span>
                      <h3 className="text-base font-bold mt-1 text-white">
                        {featuredEvent.title}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-charcoal-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-charcoal-800">
                          {featuredEvent.eventDate} ({featuredEvent.eventTimeRange})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-indigo-700 font-semibold bg-indigo-50/80 p-2 rounded-lg border border-indigo-100">
                      <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Check-in Window: {featuredEvent.checkInTimeWindow}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="truncate">{featuredEvent.location}</span>
                    </div>
                  </div>

                  {/* Availability Gauge */}
                  <div className="bg-charcoal-50 p-3 rounded-xl border border-charcoal-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-charcoal-700">
                        {featuredEvent.reservedCount} / {featuredEvent.capacity} spots reserved
                      </span>
                      <span className="text-indigo-600">
                        {featuredEvent.capacity - featuredEvent.reservedCount} remaining
                      </span>
                    </div>
                    <div className="w-full bg-charcoal-200/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{
                          width: `${(featuredEvent.reservedCount / featuredEvent.capacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Guarantee & Action */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>🟢 100% Refundable upon check-in</span>
                    </div>

                    <button
                      onClick={() => handleReserveClick(featuredEvent)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all"
                    >
                      <span>Reserve Spot ({featuredEvent.depositAmount} MON)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY HIGHLIGHT CARDS (Events, Restaurants, Salons) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workshops & Events */}
          <GlassCard className="p-6 space-y-3 border-charcoal-200/60">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900">Workshops & Events</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Reserve limited seat tech workshops and hackathons. Lock 0.01 MON, check in between <strong>9:30 AM - 11:00 AM</strong>, and get your deposit refunded automatically.
            </p>
          </GlassCard>

          {/* Restaurants */}
          <GlassCard className="p-6 space-y-3 border-charcoal-200/60">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900">Fine Dining Tables</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Eliminate restaurant table no-shows. Reserve 5-course chef tasting tables with a 0.02 MON deposit. Arrive at dinner time to claim your table and unlock your MON.
            </p>
          </GlassCard>

          {/* Salons */}
          <GlassCard className="p-6 space-y-3 border-charcoal-200/60">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900">Salon & Spa Appointments</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Book hair styling, spa treatments, and beauty consultations. Lock 0.015 MON, check in at salon reception during your slot, and receive 100% of your deposit back.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 3. DISCOVERY GRID */}
      <section id="discovery" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-charcoal-200/50 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Explore Available Reservations
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-charcoal-900 mt-1">
              Events, Dining & Salons
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search listings, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 border border-charcoal-200/70 rounded-xl text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-charcoal-900 text-white shadow-sm"
                  : "bg-white/80 hover:bg-white text-charcoal-600 border border-charcoal-200/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onReserveClick={handleReserveClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-charcoal-200/40 p-8">
            <p className="text-sm font-semibold text-charcoal-700">No listings found</p>
            <p className="text-xs text-charcoal-400 mt-1">
              Try adjusting your search query or category filter.
            </p>
          </div>
        )}
      </section>

      {/* Reservation Confirmation Modal */}
      <ReservationModal
        event={modalEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
