"use client";

import React from "react";
import {
  BookingStatus,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
} from "@/lib/booking-types";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const styles = BOOKING_STATUS_STYLES[status];

  return (
    <span
      className="inline-flex items-center justify-center h-[24px] px-3 rounded-full text-[13px] font-medium font-sans select-none"
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
