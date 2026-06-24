"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { POSSessionShell } from "./POSSessionShell";
import { SessionBrandHeader } from "./SessionBrandHeader";
import { SessionCard } from "./SessionCard";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  floorsApi,
  mapDashboardInfoToSessionUI,
  mapFloorsToSessionTables,
  sessionsApi,
} from "@/lib/api";

export function POSSessionPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [current, dashboard, floors] = await Promise.all([
      sessionsApi.getCurrentSession(),
      sessionsApi.getDashboardInfo(),
      floorsApi.getFloorsWithTables(),
    ]);

    if (current?.status?.toUpperCase() === "OPEN") {
      return { redirect: true as const };
    }

    const { summary, stats } = mapDashboardInfoToSessionUI(dashboard);
    return {
      redirect: false as const,
      summary,
      stats,
      tables: mapFloorsToSessionTables(floors),
    };
  }, []);

  useEffect(() => {
    if (data?.redirect) {
      router.replace("/pos");
    }
  }, [data, router]);

  if (loading) {
    return (
      <POSSessionShell>
        <div className="flex items-center justify-center min-h-full text-text-muted">Loading session...</div>
      </POSSessionShell>
    );
  }

  if (error) {
    return (
      <POSSessionShell>
        <div className="flex flex-col items-center justify-center min-h-full gap-3 px-4">
          <p className="text-danger font-semibold">{error}</p>
          <button type="button" onClick={reload} className="text-primary font-bold">
            Retry
          </button>
        </div>
      </POSSessionShell>
    );
  }

  if (!data || data.redirect) return null;

  return (
    <POSSessionShell>
      <div className="flex flex-col items-center justify-center min-h-full px-4 py-10">
        <SessionBrandHeader />
        <SessionCard session={data.summary} stats={data.stats} tables={data.tables} />
      </div>
    </POSSessionShell>
  );
}
