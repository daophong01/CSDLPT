import { useState } from "react";

export default function TransferTicketModal({ ticket, onClose, onSubmit }) {
  const [to, setTo] = useState("");
  const [name, setName] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)" }}>
      <div className="card" style={{ maxWidth: 480, margin: "10% auto" }}>
        <h3>Transfer Ticket #{ticket.tokenId}</h3>
        <input className="input" placeholder="Recipient wallet address" value={to} onChange={(e) => setTo(e.target.value)} />
        <input className="input" placeholder="New passenger name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="row">
          <button className="button" onClick={() => onSubmit(to, name)}>Transfer</button>
          <button className="button warning" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}