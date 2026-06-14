"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  BookingFormData,
  BookingStatus,
  BOOKING_STATUS_LABELS,
  TABLE_OPTIONS,
} from "@/lib/booking-types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => void;
  booking?: Booking | null; // if provided → edit mode
}

const inputClass =
  "h-[48px] w-full px-4 rounded-[12px] bg-surface border border-border-custom text-[14px] font-medium text-text-heading outline-none focus:border-primary transition-colors placeholder:text-text-muted";

const labelClass = "text-[14px] font-medium text-text-heading mb-1.5";

export function BookingModal({ isOpen, onClose, onSave, booking }: BookingModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [table, setTable] = useState("Table 5");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<BookingStatus>("pending");
  const [nameError, setNameError] = useState("");
  const [partySizeError, setPartySizeError] = useState("");
  const [dateTimeError, setDateTimeError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (booking) {
        // Edit mode — pre-fill with existing booking data
        setDate(booking.date);
        setTime(booking.time);
        setCustomerName(booking.customerName);
        setPartySize(String(booking.partySize));
        setTable(booking.table);
        setNotes(booking.notes ?? "");
        setStatus(booking.status);
      } else {
        // Create mode — default to tomorrow at 7 PM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const dd = String(tomorrow.getDate()).padStart(2, "0");
        setDate(`${yyyy}-${mm}-${dd}`);
        setTime("19:00");
        setCustomerName("");
        setPartySize("2");
        setTable("Table 5");
        setNotes("");
        setStatus("pending");
      }
      setNameError("");
      setPartySizeError("");
      setDateTimeError("");
    }
  }, [isOpen, booking]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setNameError("");
    setPartySizeError("");
    setDateTimeError("");

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setNameError("Customer name is required.");
      return;
    }

    const parsedPartySize = parseInt(partySize, 10);
    if (!partySize || isNaN(parsedPartySize) || parsedPartySize <= 0) {
      setPartySizeError("Party size must be at least 1.");
      return;
    }

    if (!date || !time) {
      setDateTimeError("Date and time are required.");
      return;
    }

    onSave({
      id: booking?.id,
      date,
      time,
      customerName: trimmedName,
      partySize: parsedPartySize,
      table,
      status,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[600px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden theme-transition"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[68px] px-6 flex items-center justify-between border-b border-border-custom">
          <h2 className="text-[24px] font-bold text-text-heading">
            {booking ? "Edit Booking" : "New Booking"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-text-muted hover:text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelClass}>Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setDateTimeError("");
                }}
                className={`${inputClass} cursor-pointer ${dateTimeError ? "border-danger" : ""}`}
              />
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setDateTimeError("");
                }}
                className={`${inputClass} cursor-pointer ${dateTimeError ? "border-danger" : ""}`}
              />
            </div>
          </div>
          {dateTimeError && (
            <p className="text-[12px] font-semibold text-danger -mt-2">
              {dateTimeError}
            </p>
          )}

          <div className="flex flex-col">
            <label className={labelClass}>Customer name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setNameError("");
              }}
              placeholder="Jane Doe"
              className={`${inputClass} ${nameError ? "border-danger" : ""}`}
            />
            {nameError && (
              <p className="text-[12px] font-semibold text-danger mt-1">
                {nameError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelClass}>Party size</label>
              <input
                type="number"
                min="1"
                required
                value={partySize}
                onChange={(e) => {
                  setPartySize(e.target.value);
                  setPartySizeError("");
                }}
                placeholder="2"
                className={`${inputClass} ${partySizeError ? "border-danger" : ""}`}
              />
              {partySizeError && (
                <p className="text-[12px] font-semibold text-danger mt-1">
                  {partySizeError}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>Table</label>
              <select
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                {TABLE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests..."
              rows={3}
              className="w-full px-4 py-3 rounded-[12px] bg-surface border border-border-custom text-[14px] font-medium text-text-heading outline-none focus:border-primary transition-colors placeholder:text-text-muted resize-none min-h-[72px] theme-transition"
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className={`${inputClass} cursor-pointer`}
            >
              {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {BOOKING_STATUS_LABELS[s]}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] rounded-[12px] bg-white border border-border-custom text-[15px] font-semibold text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-[44px] rounded-[12px] bg-primary text-white text-[15px] font-semibold hover:brightness-[1.04] transition-all cursor-pointer"
            >
              {booking ? "Save Changes" : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
