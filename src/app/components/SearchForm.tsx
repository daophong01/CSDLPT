"use client";

import { useState } from "react";

export default function SearchForm({
  onResults,
}: {
  onResults: (flights: any[]) => void;
}) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  async function search() {
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    const res = await fetch(`/api/flights?${params.toString()}`);
    const data = await res.json();
    onResults(data.flights || []);
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Điểm đi (VD: HAN)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value.toUpperCase())}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Điểm đến (VD: SGN)"
          value={destination}
          onChange={(e) => setDestination(e.target.value.toUpperCase())}
        />
        <input
          className="border rounded px-3 py-2"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <button
        className="rounded border px-4 py-2 text-sm bg-black text-white dark:bg-white dark:text-black"
        onClick={search}
      >
        Tìm kiếm
      </button>
    </div>
  );
}