import { POSSessionSummary, SessionStats, SessionTable } from "./pos-session-types";

export const lastSession: POSSessionSummary = {
  date: "Thursday, June 12, 2026",
  closedBy: "Jamie S.",
  hours: "8:00 AM - 10:30 PM",
};

export const sessionStats: SessionStats = {
  closingAmount: 42850,
  totalOrders: 134,
};

const activeTableIds = new Set([2, 4, 7, 10]);

export const sessionTables: SessionTable[] = Array.from({ length: 12 }, (_, i) => {
  const id = i + 1;
  return {
    id,
    number: String(id),
    hasActiveOrder: activeTableIds.has(id),
  };
});
