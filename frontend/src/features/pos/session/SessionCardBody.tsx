import { SessionStats, SessionTable } from "@/lib/pos-session-types";
import { SessionStatCards } from "./SessionStatCards";
import { SessionFloorPlan } from "./SessionFloorPlan";

interface SessionCardBodyProps {
  stats: SessionStats;
  tables: SessionTable[];
  middle?: React.ReactNode;
  footer?: React.ReactNode;
}

export function SessionCardBody({ stats, tables, middle, footer }: SessionCardBodyProps) {
  return (
    <div className="px-5 py-5 flex flex-col gap-5">
      <SessionStatCards stats={stats} />
      {middle}
      <SessionFloorPlan tables={tables} />
      {footer}
    </div>
  );
}
