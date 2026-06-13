"use client";

import { useMemo, useState } from "react";
import { MOCK_POS_FLOORS, countOccupancy } from "@/lib/mock-pos-tables";
import { POSTablesShell } from "./POSTablesShell";
import { TableViewHeader } from "./TableViewHeader";
import { FloorTabs } from "./FloorTabs";
import { TableGrid } from "./TableGrid";

export function POSTablesPage() {
  const [activeFloorId, setActiveFloorId] = useState(MOCK_POS_FLOORS[0].id);

  const activeFloor = useMemo(
    () => MOCK_POS_FLOORS.find((f) => f.id === activeFloorId) ?? MOCK_POS_FLOORS[0],
    [activeFloorId]
  );

  const { occupied, available } = useMemo(
    () => countOccupancy(activeFloor.tables),
    [activeFloor.tables]
  );

  return (
    <POSTablesShell>
      <div className="flex flex-col min-h-full">
        <TableViewHeader occupied={occupied} available={available} />
        <FloorTabs
          floors={MOCK_POS_FLOORS}
          activeFloorId={activeFloorId}
          onFloorChange={setActiveFloorId}
        />
        <TableGrid tables={activeFloor.tables} />
      </div>
    </POSTablesShell>
  );
}
