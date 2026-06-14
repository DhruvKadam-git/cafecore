import { POSTable } from "@/lib/pos-table-types";
import { TableCard } from "./TableCard";

interface TableGridProps {
  tables: POSTable[];
}

export function TableGrid({ tables }: TableGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 px-6 md:px-8 py-6">
      {tables.map((table) => (
        <TableCard key={table.id} table={table} />
      ))}
    </div>
  );
}
