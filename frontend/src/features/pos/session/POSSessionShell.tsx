import { POSSessionHeader } from "./POSSessionHeader";

export function POSSessionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAF7F3] pos-session-dot-grid overflow-hidden flex-col">
      <POSSessionHeader />
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </main>
    </div>
  );
}
