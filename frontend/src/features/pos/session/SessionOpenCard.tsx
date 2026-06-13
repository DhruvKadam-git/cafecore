"use client";

import { useState } from "react";
import { POSSessionSummary, SessionStats, SessionTable } from "@/lib/pos-session-types";
import { SessionSummaryHeader } from "./SessionSummaryHeader";
import { SessionCardBody } from "./SessionCardBody";
import { OpeningCashInput } from "./OpeningCashInput";
import { SessionOpenActions } from "./SessionOpenActions";

interface SessionOpenCardProps {
  session: POSSessionSummary;
  stats: SessionStats;
  tables: SessionTable[];
}

export function SessionOpenCard({ session, stats, tables }: SessionOpenCardProps) {
  const [openingCash, setOpeningCash] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="w-full max-w-[540px] bg-white rounded-[24px] border border-[#DDD2C8] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
      <SessionSummaryHeader session={session} />
      <SessionCardBody
        stats={stats}
        tables={tables}
        middle={
          <OpeningCashInput
            value={openingCash}
            onChange={(v) => {
              setOpeningCash(v);
              if (error) setError("");
            }}
            error={error}
          />
        }
        footer={
          <SessionOpenActions
            openingCash={openingCash}
            onError={setError}
          />
        }
      />
    </div>
  );
}
