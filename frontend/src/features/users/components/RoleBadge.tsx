"use client";

import React from "react";
import { UserRole } from "./types";

const styles: Record<UserRole, string> = {
  Admin:    "bg-primary/10 text-primary",
  Employee: "bg-success/10 text-success",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center justify-center h-[24px] px-3 rounded-full text-[12px] font-bold select-none border border-black/5 theme-transition ${styles[role]}`}>
      {role}
    </span>
  );
}
