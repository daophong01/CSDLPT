export default function FlightResults({ flights, onBook }) {
  if (!flights || flights.length === 0) {
    return <div className="card">No flights found.</div>;
  }
  return (
    <div className="grid">
      {flights.map((f, idx) => (
        <div key={idx} className="card row" style={{ justifyContent: "space-between" }}>
          <div>
            <div><b>{f.flightNumber}</b> — {f.departureAirport} → {f.arrivalAirport}</div>
            <div className="badge info">{new Date(f.departureTime).toLocaleString()} — {new Date(f.arrivalTime).toLocaleString()}</div>
            <div>{f.airline}</div>
          </div>
          <button className="button" onClick={() => onBook?.(f)}>Book Now</button>
        </div>
      ))}
    </div>
  );
}