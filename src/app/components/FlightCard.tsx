export default function FlightCard({ flight, onBook }: { flight: any; onBook?: () => void }) {
  return (
    <div className="border rounded-lg p-4 flex items-start justify-between">
      <div>
        <div className="font-semibold">{flight.airline} {flight.code}</div>
        <div className="text-sm text-black/70 dark:text-white/70">
          {flight.origin} → {flight.destination}
        </div>
        <div className="text-sm">{new Date(flight.departureTime).toLocaleString()} — {new Date(flight.arrivalTime).toLocaleString()}</div>
        <div className="text-sm">Ghế còn lại: {flight.seatsAvailable}</div>
      </div>
      {onBook && (
        <button
          className="rounded border px-3 py-2 text-sm bg-black text-white dark:bg-white dark:text-black"
          onClick={onBook}
        >
          Đặt vé
        </button>
      )}
    </div>
  );
}