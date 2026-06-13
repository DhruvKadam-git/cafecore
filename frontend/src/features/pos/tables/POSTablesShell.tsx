import { POSGlobalHeader } from "@/features/pos/orders/POSGlobalHeader";

export function POSTablesShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden theme-transition">
      <POSGlobalHeader />
      <main className="flex-1 overflow-y-auto no-scrollbar">{children}</main>
    </div>
  );
}
