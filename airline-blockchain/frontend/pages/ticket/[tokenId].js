import "../../styles/globals.css";
import { useEffect, useState } from "react";
import { connectWallet, getMyTickets, formatTicket } from "../../services/web3Service";

export default function TicketPage({ tokenId }) {
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    (async () => {
      const addr = await connectWallet();
      const list = await getMyTickets(addr);
      const t = list.find((x) => Number(x.tokenId) === Number(tokenId));
      if (t) setTicket(formatTicket(t));
    })().catch(() => {});
  }, [tokenId]);

  if (!ticket) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <h1>Ticket #{ticket.tokenId}</h1>
      <div className="card">
        <div><b>{ticket.flightNumber}</b> — {ticket.route}</div>
        <div>{ticket.departure.toLocaleString()} — {ticket.arrival.toLocaleString()}</div>
        <div>Passenger: {ticket.passengerName} ({ticket.passenger})</div>
        <div>Seat: {ticket.seatNumber} — Class: {ticket.class} — Price: {ticket.priceEth} ETH</div>
        <div className="badge info">Status: {ticket.used ? "Used/Cancelled" : ticket.checkedIn ? "Checked-in" : "Confirmed"}</div>
      </div>
    </div>
  );
}

TicketPage.getInitialProps = ({ query }) => ({ tokenId: query.tokenId });