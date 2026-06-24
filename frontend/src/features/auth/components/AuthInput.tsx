"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  id: string;
  type?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  /** @deprecated variant is no longer used — both panels share the same theme-aware style */
  variant?: "light" | "dark";
  rightAction?: React.ReactNode;
  error?: string;
}

export function AuthInput({
  id,
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  rightAction,
  error,
}: AuthInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[13px] font-semibold text-text-heading"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted"
          strokeWidth={2}
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={!!error}
          className={`w-full rounded-[12px] pl-10 pr-10 py-3 text-[14px] font-medium outline-none transition-all duration-150 bg-background border text-text-heading placeholder:text-text-muted focus:ring-2 theme-transition ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/15"
              : "border-border-custom focus:border-primary focus:ring-primary/15"
          }`}
        />
        {rightAction && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAction}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[12px] font-medium text-danger">{error}</p>
      )}
    </div>
  );
}
