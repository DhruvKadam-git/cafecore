"use client";

import React from "react";
import { Pencil } from "lucide-react";
import {
  Booking,
  BookingStatus,
  formatBookingDate,
  formatBookingTime,
  formatPartySize,
} from "@/lib/booking-types";
import { DeleteActionButton } from "@/features/marketing/components/DeleteActionButton";
import { BookingStatusSelect } from "./BookingStatusSelect";

interface BookingTableProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (booking: Booking) => void;
}

export function BookingTable({
  bookings,
  onStatusChange,
  onDelete,
  onEdit,
}: BookingTableProps) {
  return (
    <div className="w-full bg-surface border border-border-custom rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] theme-transition">
      <div className="overflow-x-auto overflow-y-visible w-full no-scrollbar">
        <table className="w-full border-collapse text-left font-sans min-w-[900px]">
          <thead>
            <tr className="bg-card-bg h-[48px] border-b border-border-custom theme-transition">
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none w-[18%]">
                Date
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none w-[14%]">
                Time
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none w-[22%]">
                Customer
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none w-[12%]">
                Party
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none w-[12%]">
                Table
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none w-[14%]">
                Status
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none text-right w-[8%]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="h-[58px] border-b border-border-custom last:border-0 hover:bg-surface/80 transition-colors duration-200 theme-transition"
              >
                <td className="px-6 py-2 text-[15px] font-medium text-text-heading">
                  {formatBookingDate(booking.date)}
                </td>

                <td className="px-6 py-2 text-[15px] font-bold text-text-heading">
                  {formatBookingTime(booking.time)}
                </td>

                <td className="px-6 py-2 text-[15px] font-medium text-text-heading">
                  {booking.customerName}
                </td>

                <td className="px-6 py-2 text-[15px] font-medium text-text-heading">
                  {formatPartySize(booking.partySize)}
                </td>

                <td className="px-6 py-2 text-[15px] font-medium text-text-heading">
                  {booking.table}
                </td>

                <td className="px-6 py-2">
                  <BookingStatusSelect
                    status={booking.status}
                    onChange={(status) => onStatusChange(booking.id, status)}
                  />
                </td>

                <td className="px-6 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(booking)}
                      title="Edit Booking"
                      className="w-8 h-8 flex items-center justify-center rounded-[10px] text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <DeleteActionButton
                      onDelete={() => onDelete(booking.id)}
                      title="Delete Booking"
                    />
                  </div>
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-[15px] font-medium text-text-muted"
                >
                  No bookings found. Click &quot;+ New Booking&quot; to add one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
