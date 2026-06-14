"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { POSUserMenuPanel } from "./POSUserMenuPanel";

export function POSUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

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

  return (
    <div ref={containerRef} className="relative flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-[13px] font-bold shrink-0">
        JS
      </div>
      <span className="text-[14px] font-semibold text-white hidden sm:inline">Jamie S.</span>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-10 h-10 flex items-center justify-center rounded-[10px] text-white/90 hover:bg-white/10 transition-colors"
      >
        <Menu size={24} strokeWidth={2} />
      </button>
      {isOpen && <POSUserMenuPanel onClose={close} />}
    </div>
  );
}
