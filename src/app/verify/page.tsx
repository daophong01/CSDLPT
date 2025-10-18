"use client";

import { useState } from "react";

export default function VerifyPage() {
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không tìm thấy vé");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || "Lỗi xác thực");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Xác thực vé (on-chain mirror)</h1>

      <div className="flex gap-3">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Nhập ticketId (on-chain)"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
        />
        <button
          className="rounded border px-4 py-2 text-sm bg-black text-white dark:bg-white dark:text-black"
          onClick={verify}
          disabled={loading || !ticketId}
        >
          {loading ? "Đang kiểm tra..." : "Kiểm tra"}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {result && (
        <div className="border rounded-lg p-4 space-y-2">
          <div className="font-semibold">Thông tin vé</div>
          <div className="text-sm">Ticket ID: {result.ticket?.ticketId}</div>
          <div className="text-sm">Flight ID: {result.ticket?.flightId}</div>
          <div className="text-sm">Owner: {result.ticket?.owner}</div>
          <div className="text-sm">Class: {result.ticket?.class}</div>
          <div className="text-sm">Status: {result.ticket?.status}</div>
          <div className="text-sm">Price: {result.ticket?.price}</div>
          {result.ticket?.lastEventTx && (
            <div className="text-sm">
              Last Event TX:{" "}
              <a
                className="underline"
                href={`#${result.ticket?.lastEventTx}`}
                target="_blank"
                rel="noreferrer"
              >
                {result.ticket?.lastEventTx}
              </a>
            </div>
          )}
          {result.flight && (
            <div className="pt-2">
              <div className="font-semibold">Thông tin chuyến bay</div>
              <div className="text-sm">
                {result.flight.flightCode} — {result.flight.origin} → {result.flight.destination}
              </div>
              <div className="text-sm">
                {new Date(result.flight.departure).toLocaleString()} — {new Date(result.flight.arrival).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}