"use client";

import React from "react";

interface StatusToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
}

/**
 * Reusable toggle switch used throughout the admin panel.
 *
 * md (default): track 48×26px, thumb 18×18px, travel = 48-18-2*4 = 22 → use translate-x-[22px]
 *   Inner padding accounts for 4px padding each side so thumb never clips the track.
 * sm: track 36×20px, thumb 14×14px
 */
export function StatusToggle({ checked, onChange, size = "md" }: StatusToggleProps) {
  const track =
    size === "sm"
      ? "h-5 w-9"          // 36×20px
      : "h-[26px] w-12";   // 48×26px

  const thumb =
    size === "sm"
      ? "h-3.5 w-3.5"      // 14×14px
      : "h-[18px] w-[18px]"; // 18×18px  ← reduced from 22px so it never clips

  const travel =
    size === "sm"
      ? "translate-x-[18px]"
      : "translate-x-[22px]";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer ${track} rounded-full p-[4px] transition-colors duration-200 ease-in-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        checked ? "bg-success" : "bg-border-custom"
      }`}
    >
      <span
        className={`block ${thumb} rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? travel : "translate-x-0"
        }`}
      />
    </button>
  );
}
