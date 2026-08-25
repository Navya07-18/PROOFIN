# PROOFIN

> **Reserve it. Show up. Get your deposit back.**

PROOFIN is a Web3 reservation and commitment platform on **Monad Testnet** where users reserve limited spots by locking a small MON deposit, get checked in on-chain, and automatically receive their commitment deposit back when they show up.

[![Built with Monskills](https://img.shields.io/badge/Built%20with-Monskills-7C3AED?style=for-the-badge)](https://github.com/therealharpaljadeja/monskills)
[![Monad Testnet](https://img.shields.io/badge/Network-Monad%20Testnet%20(10143)-6366F1?style=for-the-badge)](https://testnet.monadscan.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

---

## 1. The Problem

Businesses, colleges, workshops, meetups, restaurants, salons, and limited-capacity services lose millions of dollars and countless opportunities every year because people reserve slots and simply do not show up.

Traditional reservation platforms record passive database rows:
```
"User reserved slot."
```
There is **zero programmable commitment** and **zero accountability**.

## 2. The Solution: Programmable Commitments

PROOFIN turns every reservation into an on-chain smart contract commitment with automated escrow and instant settlement:

```
    [ RESERVE SPOT ]
           │
           ▼
    Lock MON Deposit (e.g. 0.01 MON)
           │
     ┌─────┴────────────────────────┐
     │                              │
     ▼ (Shows up)                   ▼ (No-show past deadline)
[ VERIFIED CHECK-IN ]       [ NO-SHOW POLICY APPLIED ]
     │                              │
     ▼                              ▼
Deposit Released (100% Refund)   Forfeited to Organizer / Community Pool
```

**A reservation is no longer just a database entry. It becomes a programmable commitment with automatic settlement.**

---

## 3. Why Monad

PROOFIN requires high throughput, sub-second finality, and predictable micro-transaction pricing:

1. **Supersonic Speed (10,000 TPS & < 800ms Finality):** Event check-in lines at doors cannot tolerate 15-second block times. Monad enables instant on-chain check-in and deposit refund before attendees even walk past the front desk.
2. **Micro-Commitments & Low Fees:** Monad's gas pricing makes locking small deposits (0.01 MON) financially practical without gas fees exceeding the deposit value.
3. **Asynchronous Execution & Gas Limit Model:** Explicit gas limits (`MONAD_GAS_LIMITS`) ensure predictable transaction costs for users and organizers.

---

## 4. Core User Experience

1. **Discover:** Explore upcoming events, workshops, hackathons, and dining reservations.
2. **Reserve:** Lock a small commitment deposit (e.g. `0.01 MON`) via MetaMask on Monad Testnet (`Chain ID: 10143`).
3. **Digital Pass:** Receive an Apple Wallet-inspired digital pass with an interactive on-chain QR code and spot number.
4. **Show Up & Check In:** Present QR pass at the venue or trigger 1-click on-chain check-in. The smart contract validates reservation ownership.
5. **Deposit Released:** The smart contract automatically releases 100% of your deposit back to your wallet with a celebration screen: **"# YOU'RE IN 🎉"**.
6. **Organizer Dashboard:** Real-time Linear-style telemetry tracking capacity, attendance rates, locked deposits, and refunded volume.

---

## 5. System Architecture

```
d:/monad V3/
├── .monskills                     # Monskills provenance configuration
├── contracts/
│   ├── contracts/
│   │   └── Proofin.sol            # Core smart contract (Escrow, Check-In, Settlement)
│   ├── scripts/
│   │   └── deploy.js              # Monad Testnet deployment & demo seeding script
│   ├── test/
│   │   └── Proofin.test.js        # Hardhat unit tests (100% passing)
│   ├── hardhat.config.js          # Monad Testnet network config & viaIR optimizer
│   └── package.json
└── web/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx         # Web3 provider & ambient glass theme
    │   │   ├── page.tsx           # Hero, How it works, Featured Demo Event, Discovery
    │   │   ├── event/[id]/page.tsx# Detailed event page & reservation flow
    │   │   ├── ticket/[id]/page.tsx# Digital Reservation Pass (Apple Wallet style)
    │   │   ├── checkin/page.tsx   # Live Check-In Station & "# YOU'RE IN 🎉" screen
    │   │   ├── my-reservations/page.tsx # Commitment history & visual lifecycle
    │   │   └── organizer/page.tsx # Linear-style metrics, escrow status, attendee table
    │   ├── components/
    │   │   ├── Navbar.tsx         # MetaMask connect, network badge & switcher
    │   │   ├── EventCard.tsx      # Frosted glass card with spot availability gauge
    │   │   ├── ReservationModal.tsx# Step-by-step commitment confirmation
    │   │   ├── DigitalTicket.tsx  # Dynamic SVG QR code pass & explorer links
    │   │   └── GlassCard.tsx      # Reusable glassmorphic UI container
    │   ├── context/
    │   │   └── WalletContext.tsx  # Global Web3 state & localStorage persistence
    │   └── lib/
    │       ├── monad.ts           # Authoritative Monad Testnet config & gas helpers
    │       ├── contract.ts        # Ethers.js smart contract bindings
    │       └── mockEvents.ts      # Demo event dataset (Monad Blitz Workshop)
    ├── tailwind.config.ts         # Custom palette & glassmorphism utilities
    └── tsconfig.json              # ES2020 target for BigInt compatibility
```

---

## 6. Monad Testnet Configuration

| Parameter | Value |
|---|---|
| **Network Name** | Monad Testnet |
| **Chain ID** | `10143` (`0x279f`) |
| **Currency Symbol** | `MON` (18 Decimals) |
| **RPC Endpoint** | `https://testnet-rpc.monad.xyz` |
| **Block Explorer** | [https://testnet.monadscan.com](https://testnet.monadscan.com) |
| **Default Contract Address** | `0x51E28e18C3B140B47a747cf9487c67428e219C08` |

---

## 7. Smart Contract Security & Engineering

The `Proofin.sol` contract incorporates industry standard security practices:
- **Checks-Effects-Interactions (CEI):** All internal state modifications (status updates, counter increments) occur before external value transfers.
- **Reentrancy Guard:** Inherits OpenZeppelin `ReentrancyGuard` across `reserveSpot`, `checkIn`, and `processNoShow`.
- **Custom Errors:** Gas-efficient custom error definitions (`AlreadyReserved`, `EventFull`, `IncorrectDeposit`, `CheckInDeadlinePassed`, `Unauthorized`, `TransferFailed`).
- **Strict Authorization:** Only the wallet that reserved the spot can check in and receive the released deposit.
- **Configurable No-Show Policy:** Forfeited deposits go directly to event organizers or a community pool.

---
## 8. Live Monad Testnet Demo
1. **Open PROOFIN:** View the featured **MONAD BLITZ WORKSHOP** (48/50 spots).
2. **Connect MetaMask:** Network indicator displays green *Monad Testnet (10143)* badge.
3. **Reserve Spot:** Click *Reserve Spot (0.01 MON)*. Review commitment modal and confirm transaction in MetaMask.
4. **View Pass:** Digital ticket pass appears with dynamic QR code, Spot #49, and `🟡 RESERVED` status.
5. **Check In:** Navigate to Check-In portal, click *Check In & Release 0.01 MON*.
6. **Instant Settlement:** Confetti triggers, displaying **"# YOU'RE IN 🎉 — 0.01 MON Released"** with Monadscan transaction link.
7. **Organizer View:** Check Organizer Dashboard to see live 98% attendance rate and updated escrow balances.


## 9. Getting Started Locally

### Prerequisites
- Node.js v18+ (tested on Node v22)
- MetaMask browser extension configured with Monad Testnet

### 1. Clone & Setup
```bash
git clone https://github.com/Navya07-18/PROOFIN.git
cd PROOFIN
```

### 2. Run Smart Contract Tests
```bash
cd contracts
npm install
npx hardhat test
```
*Expected output: 5 passing unit tests.*

### 3. Run Web Application
```bash
cd ../web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 10. License

MIT License. Built for the Monad Blitz Hackathon.
