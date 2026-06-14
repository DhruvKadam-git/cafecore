"use client";

import { useMemo, useState } from "react";
import { POSTablesShell } from "./POSTablesShell";
import { TableViewHeader } from "./TableViewHeader";
import { FloorTabs } from "./FloorTabs";
import { TableGrid } from "./TableGrid";
import { useAsyncData } from "@/hooks/use-async-data";
import { countOccupancy } from "@/lib/pos-table-utils";
import { floorsApi, mapFloorsToPOSTables } from "@/lib/api";

export function POSTablesPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const apiFloors = await floorsApi.getFloorsWithTables();
    return mapFloorsToPOSTables(apiFloors);
  }, [], { toastOnError: true });

  const floors = data ?? [];

  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);

  const resolvedFloorId = activeFloorId ?? floors[0]?.id ?? "";

  const activeFloor = useMemo(
    () => floors.find((f) => f.id === resolvedFloorId) ?? floors[0],
    [floors, resolvedFloorId]
  );

  const { occupied, available } = useMemo(
    () => countOccupancy(activeFloor?.tables ?? []),
    [activeFloor?.tables]
  );

  return (
    <POSTablesShell>
      <div className="flex flex-col min-h-full">
        <TableViewHeader occupied={occupied} available={available} />
        {error && (
          <div className="mx-6 md:mx-8 mb-4 flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
            <span>{error}</span>
            <button type="button" onClick={reload} className="underline">
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="text-center py-16 text-text-muted">Loading tables...</div>
        ) : floors.length === 0 ? (
          <div className="text-center py-16 text-text-muted">No floors configured</div>
        ) : (
          <>
            <FloorTabs
              floors={floors}
              activeFloorId={resolvedFloorId}
              onFloorChange={setActiveFloorId}
            />
            <TableGrid tables={activeFloor?.tables ?? []} />
          </>
        )}
      </div>
    </POSTablesShell>
  );
}
