"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { POSUserMenuPanel } from "./POSUserMenuPanel";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function POSUserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const handleLogout = () => {
    logout();
    close();
    router.push("/login");
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  const displayName = user?.name ?? "Staff";
  const displayInitials = initials(displayName);

  return (
    <div ref={containerRef} className="relative flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-[13px] font-bold shrink-0">
        {displayInitials}
      </div>
      <span className="text-[14px] font-semibold text-white hidden sm:inline">{displayName}</span>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-10 h-10 flex items-center justify-center rounded-[10px] text-white/90 hover:bg-white/10 transition-colors"
      >
        <Menu size={24} strokeWidth={2} />
      </button>
      {isOpen && <POSUserMenuPanel onClose={close} onLogout={handleLogout} userName={displayName} />}
    </div>
  );
}
