import { TableStatus } from "@/lib/pos-table-types";

const statusStyles: Record<TableStatus, string> = {
  available: "bg-success/10 text-success",
  occupied: "bg-gold/10 text-gold",
};

const statusLabels: Record<TableStatus, string> = {
  available: "Available",
  occupied: "Occupied",
};

interface TableStatusBadgeProps {
  status: TableStatus;
}

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center h-7 px-3.5 rounded-full text-[13px] font-semibold select-none theme-transition ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
