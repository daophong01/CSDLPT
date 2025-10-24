import { useState } from "react";
import { connectWallet, calculatePrice, bookTicket } from "../services/web3Service";

export default function BookingForm({ flight }) {
  const [connected, setConnected] = useState(false);
  const [passengerName, setPassengerName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [ticketClass, setTicketClass] = useState("ECONOMY");
  const [isTransferable, setIsTransferable] = useState(true);
  const [price, setPrice] = useState(0);
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(false);

  async function connect() {
    await connectWallet();
    setConnected(true);
    const p = await calculatePrice(ticketClass);
    setPrice(p);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await bookTicket({ flightId: flight.blockchainId || 0, passengerName, passportNumber, seatNumber, ticketClass, isTransferable });
      setTx(r.txHash);
    } catch (e) {
      alert(e.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      {!connected ? (
        <button className="button" onClick={connect}>Connect MetaMask</button>
      ) : (
        <form onSubmit={submit} className="grid">
          <input className="input" placeholder="Passenger name" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} />
          <input className="input" placeholder="Passport number" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
          <input className="input" placeholder="Seat number" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
          <div className="row">
            <select className="input" value={ticketClass} onChange={async (e) => { setTicketClass(e.target.value); setPrice(await calculatePrice(e.target.value)); }}>
              <option value="ECONOMY">Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
            <label><input type="checkbox" checked={isTransferable} onChange={(e) => setIsTransferable(e.target.checked)} /> Transferable</label>
          </div>
          <div>Total price: {price} ETH</div>
          <button className="button" type="submit" disabled={loading}>{loading ? "Booking..." : "Book"}</button>
        </form>
      )}
      {tx && <div className="badge success">Tx: {tx}</div>}
    </div>
  );
}