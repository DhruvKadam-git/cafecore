"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import {
  BookingStatus,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
} from "@/lib/booking-types";

const ALL_STATUSES: BookingStatus[] = ["confirmed", "pending", "cancelled"];

interface BookingStatusSelectProps {
  status: BookingStatus;
  onChange: (status: BookingStatus) => void;
}

export function BookingStatusSelect({
  status,
  onChange,
}: BookingStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const styles = BOOKING_STATUS_STYLES[status];

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="fixed z-[200] min-w-[130px] bg-white border border-border-custom rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1 overflow-hidden"
          >
            {ALL_STATUSES.map((option) => {
              const optionStyles = BOOKING_STATUS_STYLES[option];
              const isSelected = option === status;
              return (
                <li key={option} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                      isSelected ? "bg-surface" : "hover:bg-surface/80"
                    }`}
                  >
                    <span
                      className="inline-flex items-center justify-center h-[22px] px-2.5 rounded-full text-[12px] font-medium"
                      style={{
                        backgroundColor: optionStyles.bg,
                        color: optionStyles.text,
                      }}
                    >
                      {BOOKING_STATUS_LABELS[option]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-1 h-[24px] pl-3 pr-2 rounded-full text-[13px] font-medium font-sans select-none cursor-pointer transition-opacity hover:opacity-90"
        style={{ backgroundColor: styles.bg, color: styles.text }}
      >
        {BOOKING_STATUS_LABELS[status]}
        <ChevronDown size={12} strokeWidth={2.5} />
      </button>
      {menu}
    </div>
  );
}
