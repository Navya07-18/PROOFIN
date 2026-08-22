"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { shortenAddress } from "@/lib/monad";
import {
  Ticket,
  LayoutDashboard,
  QrCode,
  Compass,
  Wallet,
  ChevronDown,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const {
    account,
    balance,
    isMonad,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    reservations,
  } = useWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeReservationsCount = reservations.filter(
    (r) => r.status === "RESERVED"
  ).length;

  const navLinks = [
    { name: "Explore", href: "/", icon: Compass },
    {
      name: "My Tickets",
      href: "/my-reservations",
      icon: Ticket,
      badge: activeReservationsCount > 0 ? activeReservationsCount : null,
    },
    { name: "Check-In", href: "/checkin", icon: QrCode },
    { name: "Organizer", href: "/organizer", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-charcoal-900">
                PROOFIN
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                Monad
              </span>
            </div>
            <p className="text-[10px] text-charcoal-400 font-medium -mt-1 hidden sm:block">
              Reserve • Commit • Settle
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-charcoal-50/80 p-1 rounded-xl border border-charcoal-200/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-charcoal-900 shadow-sm"
                    : "text-charcoal-500 hover:text-charcoal-800 hover:bg-white/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : ""}`} />
                <span>{link.name}</span>
                {link.badge !== null && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Wallet & Network Controls */}
        <div className="flex items-center gap-2.5">
          {account ? (
            <div className="flex items-center gap-2">
              {/* Network Status Badge */}
              <button
                onClick={switchNetwork}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isMonad
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/60"
                    : "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/60 animate-pulse"
                }`}
                title={isMonad ? "Connected to Monad Testnet" : "Click to switch to Monad Testnet"}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMonad ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>{isMonad ? "Monad Testnet" : "Switch to Monad"}</span>
              </button>

              {/* Balance Pill */}
              <div className="hidden lg:flex items-center gap-1 bg-charcoal-100/70 border border-charcoal-200/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-charcoal-800">
                <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                <span>{balance} MON</span>
              </div>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-all duration-150"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
                  <span className="font-mono">{shortenAddress(account)}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-charcoal-100 p-2 z-50 animate-scale-up">
                    <div className="px-3 py-2 border-b border-charcoal-100">
                      <p className="text-[11px] text-charcoal-400">Connected Wallet</p>
                      <p className="text-xs font-mono font-medium text-charcoal-900 truncate">
                        {account}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-charcoal-600">
                        <span>Balance:</span>
                        <span className="font-semibold text-indigo-600">{balance} MON</span>
                      </div>
                    </div>

                    <div className="p-1">
                      <a
                        href={`https://testnet.monadscan.com/address/${account}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between w-full px-2.5 py-2 text-xs text-charcoal-700 hover:bg-charcoal-50 rounded-lg transition-colors"
                      >
                        <span>View on Monadscan</span>
                        <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
                      </a>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          disconnectWallet();
                        }}
                        className="flex items-center gap-2 w-full px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-0.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-800 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-charcoal-900/10 transition-all duration-200"
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-300" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
