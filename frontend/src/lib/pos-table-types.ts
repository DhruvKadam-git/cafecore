export type TableStatus = "available" | "occupied";

export interface POSTable {
  id: string;
  label: string;
  floorId: string;
  seats: number;
  status: TableStatus;
  revenue?: number;
  customer?: string;
  orderNumber?: string;
  elapsedMinutes?: number;
}

export interface POSFloor {
  id: string;
  name: string;
  tables: POSTable[];
}
