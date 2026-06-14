"use client";

import React, { useState } from "react";
import { Booking, BookingFormData, BookingStatus } from "@/lib/booking-types";
import { INITIAL_BOOKINGS } from "@/lib/mock-bookings";
import { BookingToolbar } from "@/features/bookings/components/BookingToolbar";
import { BookingTable } from "@/features/bookings/components/BookingTable";
import { BookingModal } from "@/features/bookings/components/BookingModal";

export default function BookingsPage() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const handleNewBooking = () => {
    setEditingBooking(null);
    setModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBooking(null);
  };

  const handleSaveBooking = (data: BookingFormData) => {
    if (data.id) {
      // Edit existing
      setBookings((prev) =>
        prev.map((b) => (b.id === data.id ? { ...b, ...data, id: b.id } : b))
      );
    } else {
      // Create new
      setBookings((prev) => [
        ...prev,
        { ...data, id: Math.random().toString(36).substring(2, 9) },
      ]);
    }
  };

  const handleStatusChange = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto font-sans">
      <BookingToolbar onNewBooking={handleNewBooking} />

      <BookingTable
        bookings={bookings}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onEdit={handleEditBooking}
      />

      <BookingModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBooking}
        booking={editingBooking}
      />
    </div>
  );
}
