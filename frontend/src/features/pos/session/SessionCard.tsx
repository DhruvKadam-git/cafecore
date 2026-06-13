import { POSSessionSummary, SessionStats, SessionTable } from "@/lib/pos-session-types";
import { SessionSummaryHeader } from "./SessionSummaryHeader";
import { SessionCardBody } from "./SessionCardBody";
import { OpenSessionButton } from "./OpenSessionButton";

interface SessionCardProps {
  session: POSSessionSummary;
  stats: SessionStats;
  tables: SessionTable[];
}

export function SessionCard({ session, stats, tables }: SessionCardProps) {
  return (
    <div className="w-full max-w-[540px] bg-white rounded-[24px] border border-[#DDD2C8] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
      <SessionSummaryHeader session={session} />
      <SessionCardBody stats={stats} tables={tables} footer={<OpenSessionButton />} />
    </div>
  );
}
