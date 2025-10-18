"use client";

import { useState } from "react";
import SearchForm from "../components/SearchForm";
import FlightCard from "../components/FlightCard";

export default function SearchPage() {
  const [flights, setFlights] = useState<any[]>([]);

  async function book(flight: any) {
    const res = await fetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        flightCode: flight.code,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
      }),
    });
    const data = await res.json();
    alert(data.message || "Đã tạo đặt chỗ");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Tìm chuyến bay</h1>
      <SearchForm onResults={setFlights} />
      <div className="space-y-3">
        {flights.length === 0 ? (
          <p className="text-sm text-black/70 dark:text-white/70">Không có kết quả. Hãy nhập tiêu chí và tìm kiếm.</p>
        ) : (
          flights.map((f) => (
            <FlightCard key={f.code + f.departureTime} flight={f} onBook={() => book(f)} />
          ))
        )}
      </div>
    </section>
  );
}