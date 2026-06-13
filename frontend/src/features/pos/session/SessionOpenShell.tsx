export function SessionOpenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF7F3] pos-session-dot-grid flex items-center justify-center px-4 py-10">
      {children}
    </div>
  );
}
