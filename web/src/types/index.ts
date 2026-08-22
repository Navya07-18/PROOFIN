export type NoShowPolicy = "ORGANIZER" | "COMMUNITY_POOL";

export type ReservationStatus = "NONE" | "RESERVED" | "CHECKED_IN" | "NO_SHOW";

export type CategoryType = "EVENT" | "RESTAURANT" | "SALON" | "WORKSHOP";

export interface EventData {
  id: number;
  title: string;
  category: string; // e.g. "TECH WORKSHOP", "GOURMET DINING", "HAIR & SPA"
  categoryType: CategoryType; // "EVENT", "RESTAURANT", "SALON", "WORKSHOP"
  description: string;
  location: string;
  organizer: string;
  organizerName: string;
  imageURI: string;
  eventDate: string;        // e.g. "23 August 2026 IST"
  eventTimeRange: string;   // e.g. "9:00 AM IST - 4:00 PM IST"
  checkInTimeWindow: string;// e.g. "9:30 AM IST - 11:00 AM IST"
  depositAmount: string;    // in MON, e.g. "0.01"
  depositAmountWei: string;
  capacity: number;
  reservedCount: number;
  checkedInCount: number;
  noShowCount: number;
  active: boolean;
  policy: NoShowPolicy;
  isFeatured?: boolean;
  isExpired?: boolean;
}

export interface ReservationData {
  id: string; // Unique ticket ID, e.g. "PRF-10143-001-42"
  eventId: number;
  eventTitle: string;
  categoryType: CategoryType;
  eventDate: string;
  eventTimeRange: string;
  checkInTimeWindow: string;
  location: string;
  spotNumber: number;
  attendee: string;
  depositAmount: string;
  reservedAt: number;
  status: ReservationStatus;
  txHash?: string;
  checkInTxHash?: string;
}

export interface AttendeeRecord {
  wallet: string;
  spot: number;
  reservedAt: string;
  status: ReservationStatus;
  deposit: string;
  txHash: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
