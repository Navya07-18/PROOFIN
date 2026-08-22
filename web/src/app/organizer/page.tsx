"use client";

import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { GlassCard } from "@/components/GlassCard";
import { EventData, AttendeeRecord, NoShowPolicy } from "@/types";
import { getExplorerTxUrl, shortenAddress, shortenTxHash } from "@/lib/monad";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  CheckCircle2,
  AlertTriangle,
  Coins,
  TrendingUp,
  ExternalLink,
  Calendar,
  MapPin,
  X,
  Lock,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

// Mock sample attendees for the organizer view
const INITIAL_ATTENDEES: AttendeeRecord[] = [
  {
    wallet: "0x7a39Fd6e51aad88F6F4ce6aB8827279cffFb9226",
    spot: 1,
    reservedAt: "Today, 10:14 AM",
    status: "CHECKED_IN",
    deposit: "0.01 MON",
    txHash: "0xa81f4c39810a95bc8129841804bcdefa10481029481928410294810294810294",
  },
  {
    wallet: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    spot: 2,
    reservedAt: "Today, 10:22 AM",
    status: "CHECKED_IN",
    deposit: "0.01 MON",
    txHash: "0x9184810294810294810294810294810294810294810294810294810294810294",
  },
  {
    wallet: "0x3A52c8b09d94C9B71261d763E48fA11953E26Fa3",
    spot: 3,
    reservedAt: "Today, 11:05 AM",
    status: "RESERVED",
    deposit: "0.01 MON",
    txHash: "0x3841029481029481029481029481029481029481029481029481029481029481",
  },
  {
    wallet: "0x4e59b44847b379578588920ca78fbf26c0b4956c",
    spot: 4,
    reservedAt: "Today, 11:40 AM",
    status: "CHECKED_IN",
    deposit: "0.01 MON",
    txHash: "0x7281029481029481029481029481029481029481029481029481029481029481",
  },
  {
    wallet: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
    spot: 5,
    reservedAt: "Today, 12:15 PM",
    status: "NO_SHOW",
    deposit: "0.01 MON",
    txHash: "0x4481029481029481029481029481029481029481029481029481029481029481",
  },
  {
    wallet: "0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed",
    spot: 6,
    reservedAt: "Today, 01:00 PM",
    status: "RESERVED",
    deposit: "0.01 MON",
    txHash: "0x5581029481029481029481029481029481029481029481029481029481029481",
  },
];

export default function OrganizerDashboardPage() {
  const { account, events, addEvent } = useWallet();
  const [selectedEventId, setSelectedEventId] = useState<number>(events[0]?.id || 1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newImageURI, setNewImageURI] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDeposit, setNewDeposit] = useState("0.01");
  const [newCapacity, setNewCapacity] = useState("50");
  const [newPolicy, setNewPolicy] = useState<NoShowPolicy>("ORGANIZER");

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Calculated Metrics
  const totalSeats = selectedEvent?.capacity || 50;
  const reservedCount = selectedEvent?.reservedCount || 42;
  const checkedInCount = selectedEvent?.checkedInCount || 38;
  const noShowCount = selectedEvent?.noShowCount || 2;
  const attendanceRate =
    reservedCount > 0 ? ((checkedInCount / reservedCount) * 100).toFixed(1) : "0.0";

  const depositPerSpot = parseFloat(selectedEvent?.depositAmount || "0.01");
  const depositsLocked = (
    Math.max(0, reservedCount - checkedInCount - noShowCount) * depositPerSpot
  ).toFixed(4);
  const depositsReleased = (checkedInCount * depositPerSpot).toFixed(4);
  const noShowDeposits = (noShowCount * depositPerSpot).toFixed(4);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation) {
      alert("Please enter title and location.");
      return;
    }

    const created: EventData = {
      id: Date.now(),
      title: newTitle,
      category: "COMMUNITY EVENT",
      description: newDescription || "Community reservation event on Monad Testnet.",
      location: newLocation,
      organizer: account || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      organizerName: "Event Organizer",
      imageURI:
        newImageURI ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      eventDate: newEventDate || "Tomorrow",
      eventTime: newEventTime || "5:00 PM IST",
      checkInDeadline: newDeadline || "4:45 PM IST",
      depositAmount: newDeposit || "0.01",
      depositAmountWei: (parseFloat(newDeposit || "0.01") * 1e18).toString(),
      capacity: parseInt(newCapacity || "50"),
      reservedCount: 0,
      checkedInCount: 0,
      noShowCount: 0,
      active: true,
      policy: newPolicy,
    };

    addEvent(created);
    setSelectedEventId(created.id);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setNewLocation("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-charcoal-900 text-white rounded-full text-xs font-semibold">
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Organizer Console</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal-900 tracking-tight mt-1.5">
            Event Management & Settlement
          </h1>
          <p className="text-xs text-charcoal-500">
            Real-time capacity tracking, attendance verification, and smart contract escrow analytics.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Event Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {events.map((ev) => (
          <button
            key={ev.id}
            onClick={() => setSelectedEventId(ev.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedEventId === ev.id
                ? "bg-charcoal-900 text-white border-charcoal-900 shadow-sm"
                : "bg-white text-charcoal-700 border-charcoal-200 hover:bg-charcoal-50"
            }`}
          >
            {ev.title}
          </button>
        ))}
      </div>

      {/* METRICS ROW (Linear Solid Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Seats */}
        <div className="bg-white border border-charcoal-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
            Total Seats
          </span>
          <div className="text-3xl font-black text-charcoal-900">{totalSeats}</div>
          <p className="text-[11px] text-charcoal-500">Event capacity</p>
        </div>

        {/* Reserved */}
        <div className="bg-white border border-charcoal-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
            Reserved
          </span>
          <div className="text-3xl font-black text-indigo-700">{reservedCount}</div>
          <p className="text-[11px] text-indigo-600 font-medium">Spots committed on-chain</p>
        </div>

        {/* Checked In */}
        <div className="bg-white border border-charcoal-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Checked In
          </span>
          <div className="text-3xl font-black text-emerald-600">{checkedInCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium">Verified attendance</p>
        </div>

        {/* No-Shows */}
        <div className="bg-white border border-charcoal-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            No-Shows
          </span>
          <div className="text-3xl font-black text-rose-600">{noShowCount}</div>
          <p className="text-[11px] text-rose-700 font-medium">Forfeited spots</p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white border border-charcoal-200/80 rounded-2xl p-5 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
            Attendance Rate
          </span>
          <div className="text-3xl font-black text-charcoal-900">{attendanceRate}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">vs 60% industry avg</p>
        </div>
      </div>

      {/* FINANCIAL STATUS OVERVIEW */}
      <div className="bg-white border border-charcoal-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
          <Coins className="w-4 h-4 text-indigo-600" />
          <span>On-Chain Escrow & Settlement Balances</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-charcoal-50 p-4 rounded-xl border border-charcoal-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Deposits Locked (Escrow)
            </span>
            <div className="text-2xl font-black text-charcoal-900 mt-1">
              {depositsLocked} <span className="text-xs font-bold text-indigo-600">MON</span>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Held in contract until attendees check in
            </p>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Deposits Released (Refunded)
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {depositsReleased} <span className="text-xs font-bold text-emerald-600">MON</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-0.5">
              Returned to attendees after check-in
            </p>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              No-Show Forfeited Deposits
            </span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {noShowDeposits} <span className="text-xs font-bold text-rose-600">MON</span>
            </div>
            <p className="text-[11px] text-rose-800/80 mt-0.5">
              Policy: {selectedEvent?.policy === "ORGANIZER" ? "Organizer Received" : "Community Pool"}
            </p>
          </div>
        </div>
      </div>

      {/* RESERVATION TABLE */}
      <div className="bg-white border border-charcoal-200/80 rounded-2xl overflow-hidden shadow-sm space-y-0">
        <div className="p-5 border-b border-charcoal-200/70 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-charcoal-900">Attendee Commitments</h3>
            <p className="text-xs text-charcoal-500">Live attendees on Monad Testnet</p>
          </div>
          <span className="text-xs font-bold text-charcoal-500">
            Showing {INITIAL_ATTENDEES.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-50 border-b border-charcoal-200/60 text-charcoal-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Spot #</th>
                <th className="py-3 px-4">Wallet Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Reserved At</th>
                <th className="py-3 px-4 text-right">Monadscan Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 text-charcoal-700">
              {INITIAL_ATTENDEES.map((att) => (
                <tr key={att.spot} className="hover:bg-charcoal-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-charcoal-900">
                    #{att.spot.toString().padStart(2, "0")}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-charcoal-800">
                    {shortenAddress(att.wallet)}
                  </td>
                  <td className="py-3.5 px-4">
                    {att.status === "CHECKED_IN" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Checked In
                      </span>
                    ) : att.status === "NO_SHOW" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        No Show
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Reserved
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-charcoal-900">
                    {att.deposit}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-500">{att.reservedAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={getExplorerTxUrl(att.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-indigo-600 hover:underline font-semibold"
                    >
                      <span>{shortenTxHash(att.txHash)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-white overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-charcoal-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-charcoal-900">
                Create New Monad Reservation Event
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monad Developer Workshop"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of the event..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 5:00 PM IST"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monad Hub, Hyderabad"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">Deposit (MON)</label>
                  <input
                    type="text"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">Check-in Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. 4:45 PM"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-800 mb-1">No-Show Policy</label>
                <select
                  value={newPolicy}
                  onChange={(e) => setNewPolicy(e.target.value as NoShowPolicy)}
                  className="w-full p-2.5 bg-white border border-charcoal-200 rounded-xl font-semibold"
                >
                  <option value="ORGANIZER">Forfeited deposits sent to Organizer</option>
                  <option value="COMMUNITY_POOL">Forfeited deposits sent to Community Pool</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg transition-all"
                >
                  Publish Event to Monad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
