import { POSFloor } from "./pos-table-types";

export const MOCK_POS_FLOORS: POSFloor[] = [
  {
    id: "floor-1",
    name: "Floor 1",
    tables: [
      { id: "t1", label: "T1", floorId: "floor-1", seats: 2, status: "available" },
      {
        id: "t2",
        label: "T2",
        floorId: "floor-1",
        seats: 4,
        status: "occupied",
        revenue: 28,
        customer: "Lena M.",
        orderNumber: "#0844",
        elapsedMinutes: 22,
      },
      { id: "t3", label: "T3", floorId: "floor-1", seats: 4, status: "available" },
      {
        id: "t4",
        label: "T4",
        floorId: "floor-1",
        seats: 2,
        status: "occupied",
        revenue: 42,
        customer: "Raj P.",
        orderNumber: "#0843",
        elapsedMinutes: 31,
      },
      { id: "t5", label: "T5", floorId: "floor-1", seats: 6, status: "available" },
      {
        id: "t6",
        label: "T6",
        floorId: "floor-1",
        seats: 4,
        status: "occupied",
        revenue: 19,
        customer: "James W.",
        orderNumber: "#0841",
        elapsedMinutes: 14,
      },
      { id: "t7", label: "T7", floorId: "floor-1", seats: 2, status: "available" },
      { id: "t8", label: "T8", floorId: "floor-1", seats: 4, status: "available" },
    ],
  },
  {
    id: "floor-2",
    name: "Floor 2",
    tables: [
      { id: "t9", label: "T9", floorId: "floor-2", seats: 4, status: "available" },
      {
        id: "t10",
        label: "T10",
        floorId: "floor-2",
        seats: 2,
        status: "occupied",
        revenue: 31,
        customer: "Sofia C.",
        orderNumber: "#0839",
        elapsedMinutes: 45,
      },
      { id: "t11", label: "T11", floorId: "floor-2", seats: 6, status: "available" },
      {
        id: "t12",
        label: "T12",
        floorId: "floor-2",
        seats: 4,
        status: "occupied",
        revenue: 38.5,
        customer: "Elena R.",
        orderNumber: "#0837",
        elapsedMinutes: 18,
      },
      { id: "t13", label: "T13", floorId: "floor-2", seats: 2, status: "available" },
      { id: "t14", label: "T14", floorId: "floor-2", seats: 4, status: "available" },
    ],
  },
];

export function getFloorById(floorId: string): POSFloor | undefined {
  return MOCK_POS_FLOORS.find((f) => f.id === floorId);
}

export function countOccupancy(tables: POSFloor["tables"]) {
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const available = tables.filter((t) => t.status === "available").length;
  return { occupied, available };
}
