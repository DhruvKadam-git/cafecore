"use client";

import React from "react";
import { UserStatus } from "./types";

const styles: Record<UserStatus, string> = {
  Active:   "bg-success/10 text-success",
  Archived: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`inline-flex items-center justify-center h-[24px] px-3 rounded-full text-[12px] font-bold select-none border border-black/5 theme-transition ${styles[status]}`}>
      {status}
    </span>
  );
}
