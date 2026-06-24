import React from "react";
import { POSSessionHeader } from "./POSSessionHeader";
import { POSSessionSidebar } from "./POSSessionSidebar";

export function POSSessionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAF7F3] pos-session-dot-grid overflow-hidden flex-col">
      <POSSessionSidebar />
      <POSSessionHeader />
      <main className="flex-1 overflow-y-auto no-scrollbar md:pl-16">
        {children}
      </main>
    </div>
  );
}
