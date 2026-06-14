import { POSSessionSummary } from "@/lib/pos-session-types";

interface SessionSummaryHeaderProps {
  session: POSSessionSummary;
}

export function SessionSummaryHeader({ session }: SessionSummaryHeaderProps) {
  return (
    <div className="bg-[#160E0A] rounded-t-[24px] px-6 py-5">
      <p className="text-[12px] font-medium text-white/45 mb-1">Last session</p>
      <h2 className="text-[20px] font-bold text-white leading-tight">{session.date}</h2>
      <p className="text-[13px] font-medium text-white/40 mt-1.5">
        Closed by {session.closedBy} &bull; {session.hours}
      </p>
    </div>
  );
}
