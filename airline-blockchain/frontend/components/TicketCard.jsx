export default function TicketCard({ ticket, onTransfer, onCheckIn, onCancel }) {
  return (
    <div className="card">
      <div><b>Ticket #{ticket.tokenId}</b></div>
      <div>{ticket.flightNumber} — {ticket.route}</div>
      <div>{ticket.departure.toLocaleString()} — {ticket.arrival.toLocaleString()}</div>
      <div>Passenger: {ticket.passengerName} ({ticket.passenger})</div>
      <div>Seat: {ticket.seatNumber} — Class: {ticket.class} — Price: {ticket.priceEth} ETH</div>
      <div className="row">
        {!ticket.used && !ticket.checkedIn && <button className="button" onClick={onCheckIn}>Check-in</button>}
        {!ticket.used && <button className="button secondary" onClick={onTransfer}>Transfer</button>}
        {!ticket.used && <button className="button warning" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}