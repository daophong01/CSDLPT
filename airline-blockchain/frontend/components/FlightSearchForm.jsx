import { useState } from "react";
import axios from "axios";

export default function FlightSearchForm({ onResults }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  async function submit(e) {
    e.preventDefault();
    const api = process.env.NEXT_PUBLIC_API_URL;
    const res = await axios.post(`${api}/api/flights/search`, { from, to, departureDate: date });
    onResults(res.data.flights || []);
  }

  return (
    <form onSubmit={submit} className="card grid grid-3">
      <input className="input" placeholder="From (HAN)" value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} />
      <input className="input" placeholder="To (SGN)" value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} />
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button className="button" type="submit">Search</button>
    </form>
  );
}