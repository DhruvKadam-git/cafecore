export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  date: string;
  time: string;
  customerName: string;
  partySize: number;
  table: string;
  status: BookingStatus;
  notes?: string;
}

export type BookingFormData = Omit<Booking, "id"> & { id?: string };

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_STYLES: Record<
  BookingStatus,
  { bg: string; text: string }
> = {
  confirmed: { bg: "#E7F1DF", text: "#789658" },
  pending: { bg: "#FFF0D8", text: "#D8A043" },
  cancelled: { bg: "#FDE5E0", text: "#D95C4D" },
};

export const TABLE_OPTIONS = Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`);

export function formatBookingDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBookingTime(time24: string): string {
  const [hoursStr, minutesStr] = time24.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ?? "00";
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}

export function formatPartySize(n: number): string {
  return `${n} pax`;
}
