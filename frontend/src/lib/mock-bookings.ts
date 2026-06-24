import { Booking } from "./booking-types";

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "1",
    date: "2026-06-13",
    time: "12:00",
    customerName: "Olivia Martinez",
    partySize: 4,
    table: "Table 7",
    status: "confirmed",
  },
  {
    id: "2",
    date: "2026-06-13",
    time: "13:30",
    customerName: "James & Priya Nair",
    partySize: 2,
    table: "Table 3",
    status: "pending",
  },
  {
    id: "3",
    date: "2026-06-13",
    time: "19:00",
    customerName: "Corporate Lunch - Acme",
    partySize: 8,
    table: "Table 12",
    status: "confirmed",
  },
  {
    id: "4",
    date: "2026-06-13",
    time: "20:30",
    customerName: "Walk-in Hold",
    partySize: 3,
    table: "Table 5",
    status: "cancelled",
  },
];
