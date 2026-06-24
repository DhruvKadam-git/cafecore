import { POSTable } from "./pos-table-types";

export function countOccupancy(tables: POSTable[]) {
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const available = tables.filter((t) => t.status === "available").length;
  return { occupied, available };
}
