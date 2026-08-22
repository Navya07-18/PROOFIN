export type NoShowPolicy = "ORGANIZER" | "COMMUNITY_POOL";

export type ReservationStatus = "NONE" | "RESERVED" | "CHECKED_IN" | "NO_SHOW";

export interface EventData {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  organizer: string;
  organizerName: string;
  imageURI: string;
  eventDate: string;
  eventTime: string;
  checkInDeadline: string;
  depositAmount: string; // in MON, e.g. "0.01"
  depositAmountWei: string;
  capacity: number;
  reservedCount: number;
  checkedInCount: number;
  noShowCount: number;
  active: boolean;
  policy: NoShowPolicy;
  isFeatured?: boolean;
}

export interface ReservationData {
  id: string; // Unique ticket ID, e.g. "PRF-10143-001-42"
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  spotNumber: number;
  attendee: string;
  depositAmount: string;
  reservedAt: number;
  checkInDeadline: string;
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
