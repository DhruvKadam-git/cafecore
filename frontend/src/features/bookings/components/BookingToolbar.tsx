"use client";

import React from "react";
import { Plus } from "lucide-react";

interface BookingToolbarProps {
  onNewBooking: () => void;
}

export function BookingToolbar({ onNewBooking }: BookingToolbarProps) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 select-none">
      <h2 className="text-[20px] font-bold text-text-heading font-sans">
        Bookings & Reservations
      </h2>

      <button
        type="button"
        onClick={onNewBooking}
        className="h-[44px] px-[22px] rounded-[14px] bg-primary text-white text-[15px] font-semibold flex items-center gap-2.5 hover:brightness-[1.04] hover:translate-y-[-1px] transition-all duration-200 cursor-pointer"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>New Booking</span>
      </button>
    </div>
  );
}
