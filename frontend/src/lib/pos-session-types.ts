export interface POSSessionSummary {
  date: string;
  closedBy: string;
  hours: string;
}

export interface SessionStats {
  closingAmount: number;
  totalOrders: number;
}

export interface SessionTable {
  id: number;
  number: string;
  hasActiveOrder: boolean;
}

export interface OpeningCashForm {
  amount: number;
}
