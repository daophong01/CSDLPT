"use client";

import { useEffect, useState } from "react";

type Flight = {
  flightId: string;
  flightCode: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  airplaneHash: string;
  lastEventTx: string;
};

export default function OnchainFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [ticketId, setTicketId] = useState("");
  const [priceEth, setPriceEth] = useState("0.01");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadFlights() {
    const res = await fetch("/api/onchain/flights");
    const data = await res.json();
    setFlights(data.flights || []);
  }

  useEffect(() => {
    loadFlights();
  }, []);

  async function buyOnChain() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/onchain/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, priceEth }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Mua vé thất bại");
      } else {
        setMsg(`Đã gửi giao dịch: ${data.txHash}`);
      }
    } catch (e: any) {
      setMsg(e.message || "Lỗi mua vé");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">On-chain Flights</h1>
      <p className="text-sm text-black/70 dark:text-white/70">
        Danh sách chuyến bay từ sự kiện on-chain (FlightCreated). Bạn có thể nhập ticketId để mua vé on-chain bằng ví server (demo).
      </p>

      <div className="space-y-2">
        <div className="flex gap-3">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Ticket ID (on-chain)"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 w-40"
            placeholder="Giá (ETH)"
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
          />
          <button
            className="rounded border px-4 py-2 text-sm bg-black text-white dark:bg-white dark:text-black"
            onClick={buyOnChain}
            disabled={loading || !ticketId}
          >
            {loading ? "Đang gửi..." : "Mua vé on-chain"}
          </button>
        </div>
        {msg && <div className="text-sm">{msg}</div>}
      </div>

      <div className="space-y-3">
        {flights.length === 0 ? (
          <p className="text-sm text-black/70 dark:text-white/70">Chưa có chuyến bay on-chain.</p>
        ) : (
          flights.map((f) => (
            <div key={f.flightId} className="border rounded-lg p-4">
              <div className="font-semibold">
                {f.flightCode} — {f.origin} → {f.destination}
              </div>
              <div className="text-sm">
                {new Date(f.departure).toLocaleString()} — {new Date(f.arrival).toLocaleString()}
              </div>
              <div className="text-xs text-black/60 dark:text-white/60">Flight ID: {f.flightId}</div>
              <div className="text-xs text-black/60 dark:text-white/60">Last TX: {f.lastEventTx}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}