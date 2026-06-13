import { POSSessionShell } from "./POSSessionShell";
import { lastSession, sessionStats, sessionTables } from "@/lib/mock-pos-session";
import { SessionBrandHeader } from "./SessionBrandHeader";
import { SessionCard } from "./SessionCard";

export function POSSessionPage() {
  return (
    <POSSessionShell>
      <div className="flex flex-col items-center justify-center min-h-full px-4 py-10">
        <SessionBrandHeader />
        <SessionCard
          session={lastSession}
          stats={sessionStats}
          tables={sessionTables}
        />
      </div>
    </POSSessionShell>
  );
}