import { lastSession, sessionStats, sessionTables } from "@/lib/mock-pos-session";
import { SessionOpenShell } from "./SessionOpenShell";
import { SessionBrandHeader } from "./SessionBrandHeader";
import { SessionOpenCard } from "./SessionOpenCard";

export function POSSessionOpenPage() {
  return (
    <SessionOpenShell>
      <div className="flex flex-col items-center w-full">
        <SessionBrandHeader />
        <SessionOpenCard
          session={lastSession}
          stats={sessionStats}
          tables={sessionTables}
        />
      </div>
    </SessionOpenShell>
  );
}
