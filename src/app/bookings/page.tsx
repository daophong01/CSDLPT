"use client";

import { useEffect, useState } from "react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.bookings || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Đặt chỗ của bạn</h1>
      {bookings.length === 0 ? (
        <p className="text-sm text-black/70 dark:text-white/70">Chưa có đặt chỗ nào.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="font-semibold">{b.flightCode} — {b.origin} → {b.destination}</div>
              <div className="text-sm">{new Date(b.departureTime).toLocaleString()}</div>
              <div className="text-sm text-black/70 dark:text-white/70">Mã đặt chỗ: {b.bookingId}</div>
            </div>
          ))}
        </div>
      )}
      <button
        className="rounded border px-3 py-2 text-sm"
        onClick={load}
      >
        Làm mới
      </button>
    </section>
  );
}