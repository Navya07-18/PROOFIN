"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { MONAD_TESTNET, switchToMonadTestnet } from "@/lib/monad";
import { ReservationData, EventData } from "@/types";
import { INITIAL_EVENTS } from "@/lib/mockEvents";

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isMonad: boolean;
  balance: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  events: EventData[];
  reservations: ReservationData[];
  addReservation: (res: ReservationData) => void;
  updateReservationStatus: (eventId: number, status: "RESERVED" | "CHECKED_IN" | "NO_SHOW", txHash?: string) => void;
  addEvent: (event: EventData) => void;
  getSigner: () => Promise<ethers.Signer | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_RES = "proofin_reservations_v1";
const LOCAL_STORAGE_KEY_EVENTS = "proofin_events_v1";
const LOCAL_STORAGE_KEY_DISCONNECTED = "proofin_wallet_disconnected";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>("0.000");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [events, setEvents] = useState<EventData[]>(INITIAL_EVENTS);
  const [reservations, setReservations] = useState<ReservationData[]>([]);

  // Load saved state from localStorage on client mount
  useEffect(() => {
    try {
      const savedRes = localStorage.getItem(LOCAL_STORAGE_KEY_RES);
      if (savedRes) {
        setReservations(JSON.parse(savedRes));
      }
      const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (e) {
      console.warn("Error reading localStorage:", e);
    }
  }, []);

  const isMonad = chainId === MONAD_TESTNET.chainId;

  const updateBalance = useCallback(async (address: string) => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balWei = await provider.getBalance(address);
        const balEth = ethers.formatEther(balWei);
        setBalance(parseFloat(balEth).toFixed(4));
      } catch (err) {
        console.warn("Error fetching balance:", err);
      }
    }
  }, []);

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      const isDisconnected = localStorage.getItem(LOCAL_STORAGE_KEY_DISCONNECTED) === "true";
      if (isDisconnected || accounts.length === 0) {
        setAccount(null);
        setBalance("0.000");
      } else {
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
      }
    },
    [updateBalance]
  );

  const handleChainChanged = useCallback(
    (chainIdHex: string) => {
      const decChainId = parseInt(chainIdHex, 16);
      setChainId(decChainId);
      if (account) {
        updateBalance(account);
      }
    },
    [account, updateBalance]
  );

  // Initial wallet check on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const isDisconnected = localStorage.getItem(LOCAL_STORAGE_KEY_DISCONNECTED) === "true";

      if (!isDisconnected) {
        window.ethereum
          .request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              updateBalance(accounts[0]);
            }
          })
          .catch(console.error);
      }

      window.ethereum
        .request({ method: "eth_chainId" })
        .then((hexId: string) => {
          setChainId(parseInt(hexId, 16));
        })
        .catch(console.error);

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged, updateBalance]);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask to use PROOFIN.");
      return;
    }

    setIsConnecting(true);
    try {
      // Clear manual disconnect flag
      localStorage.removeItem(LOCAL_STORAGE_KEY_DISCONNECTED);

      let accounts: string[] = [];

      // Force MetaMask popup window on the right side of the screen via wallet_requestPermissions
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (permErr: any) {
        console.log("Permission request handled or fallback to eth_requestAccounts:", permErr);
      }

      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        await updateBalance(accounts[0]);
      }

      const hexChain = await window.ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(hexChain, 16);
      setChainId(currentChainId);

      if (currentChainId !== MONAD_TESTNET.chainId) {
        try {
          await switchToMonadTestnet();
          const updatedHex = await window.ethereum.request({ method: "eth_chainId" });
          setChainId(parseInt(updatedHex, 16));
        } catch (e) {
          console.warn("User declined network switch");
        }
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DISCONNECTED, "true");
    } catch (e) {}

    // Revoke permissions if supported by MetaMask to ensure next connect pops up window
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (e) {
        // Ignored if method not supported in older MetaMask versions
      }
    }

    setAccount(null);
    setBalance("0.000");
  };

  const switchNetwork = async () => {
    await switchToMonadTestnet();
    if (typeof window !== "undefined" && window.ethereum) {
      const hexChain = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(hexChain, 16));
    }
  };

  const getSigner = async (): Promise<ethers.Signer | null> => {
    if (typeof window === "undefined" || !window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner();
  };

  const addReservation = (res: ReservationData) => {
    setReservations((prev) => {
      const existing = prev.filter((r) => r.eventId !== res.eventId);
      const updated = [res, ...existing];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_RES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setEvents((prev) => {
      const updated = prev.map((ev) => {
        if (ev.id === res.eventId) {
          return {
            ...ev,
            reservedCount: Math.min(ev.capacity, ev.reservedCount + 1),
          };
        }
        return ev;
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateReservationStatus = (
    eventId: number,
    status: "RESERVED" | "CHECKED_IN" | "NO_SHOW",
    txHash?: string
  ) => {
    setReservations((prev) => {
      const updated = prev.map((r) => {
        if (r.eventId === eventId) {
          return {
            ...r,
            status,
            checkInTxHash: txHash || r.checkInTxHash,
          };
        }
        return r;
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_RES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (status === "CHECKED_IN") {
      setEvents((prev) => {
        const updated = prev.map((ev) => {
          if (ev.id === eventId) {
            return {
              ...ev,
              checkedInCount: ev.checkedInCount + 1,
            };
          }
          return ev;
        });
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  const addEvent = (event: EventData) => {
    setEvents((prev) => {
      const updated = [event, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        isMonad,
        balance,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        events,
        reservations,
        addReservation,
        updateReservationStatus,
        addEvent,
        getSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
