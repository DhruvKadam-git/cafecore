"use client";

import { SessionOpenShell } from "./SessionOpenShell";
import { SessionBrandHeader } from "./SessionBrandHeader";
import { SessionOpenCard } from "./SessionOpenCard";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  floorsApi,
  mapDashboardInfoToSessionUI,
  mapFloorsToSessionTables,
  sessionsApi,
} from "@/lib/api";

export function POSSessionOpenPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [dashboard, floors] = await Promise.all([
      sessionsApi.getDashboardInfo(),
      floorsApi.getFloorsWithTables(),
    ]);
    const { summary, stats } = mapDashboardInfoToSessionUI(dashboard);
    return {
      summary,
      stats,
      tables: mapFloorsToSessionTables(floors),
    };
  }, []);

  if (loading) {
    return (
      <SessionOpenShell>
        <div className="flex items-center justify-center min-h-full text-text-muted">Loading...</div>
      </SessionOpenShell>
    );
  }

  if (error) {
    return (
      <SessionOpenShell>
        <div className="flex flex-col items-center justify-center min-h-full gap-3">
          <p className="text-danger font-semibold">{error}</p>
          <button type="button" onClick={reload} className="text-primary font-bold">
            Retry
          </button>
        </div>
      </SessionOpenShell>
    );
  }

  if (!data) return null;

  return (
    <SessionOpenShell>
      <div className="flex flex-col items-center w-full">
        <SessionBrandHeader />
        <SessionOpenCard session={data.summary} stats={data.stats} tables={data.tables} />
      </div>
    </SessionOpenShell>
  );
}
