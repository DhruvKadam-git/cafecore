export default function KDSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-kds
      className="h-screen flex flex-col overflow-hidden bg-kds-bg text-kds-text font-sans theme-transition"
    >
      {children}
    </div>
  );
}
