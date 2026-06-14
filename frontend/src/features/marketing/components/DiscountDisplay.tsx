"use client";

import React from "react";

interface DiscountDisplayProps {
  label: string;
}

export function DiscountDisplay({ label }: DiscountDisplayProps) {
  return (
    <span className="text-[15px] font-bold text-success font-sans select-none">
      {label}
    </span>
  );
}
