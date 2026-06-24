import { Users } from "lucide-react";
import { POSTable } from "@/lib/pos-table-types";
import { TableStatusBadge } from "./TableStatusBadge";

interface TableCardProps {
  table: POSTable;
}

export function TableCard({ table }: TableCardProps) {
  const isOccupied = table.status === "occupied";

  return (
    <div
      className={`relative flex flex-col min-h-[208px] rounded-[20px] border p-5 transition-all duration-200 theme-transition ${
        isOccupied
          ? "border-primary bg-primary/5"
          : "border-border-custom bg-surface"
      }`}
    >
      {isOccupied && table.revenue != null && (
        <span className="absolute top-4 right-4 h-7 px-3.5 flex items-center rounded-full bg-primary text-white text-[13px] font-bold">
          ${table.revenue % 1 === 0 ? table.revenue : table.revenue.toFixed(2)}
        </span>
      )}

      <p
        className={`text-[22px] font-bold leading-tight ${
          isOccupied ? "text-primary" : "text-text-heading"
        }`}
      >
        {table.label}
      </p>

      <div className="flex items-center gap-1.5 mt-2 text-[14px] font-medium text-text-muted">
        <Users size={16} strokeWidth={2} />
        <span>{table.seats} seats</span>
      </div>

      <div className="mt-3">
        <TableStatusBadge status={table.status} />
      </div>

      {isOccupied && (
        <div className="mt-auto pt-4 flex flex-col gap-1">
          {table.customer && (
            <p className="text-[15px] font-medium text-text-heading">{table.customer}</p>
          )}
          {table.orderNumber && (
            <p className="text-[15px] font-semibold text-primary">{table.orderNumber}</p>
          )}
          {table.elapsedMinutes != null && (
            <p className="text-[14px] text-text-muted">{table.elapsedMinutes}m elapsed</p>
          )}
        </div>
      )}
    </div>
  );
}
