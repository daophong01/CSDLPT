import { useEffect, useState } from "react";
import axios from "axios";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);

  async function load() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    const res = await axios.get(`${api}/api/analytics/dashboard`);
    setData(res.data);
  }

  useEffect(() => { load(); }, []);

  if (!data) return <div className="card">Loading...</div>;

  return (
    <div className="grid">
      <div className="card grid grid-2">
        <div>Total Tickets: {data.metrics.totalTickets}</div>
        <div>Active Flights: {data.metrics.activeFlights}</div>
      </div>
      <div className="card">
        <div><b>Revenue by Class</b></div>
        {data.revenueByClass.map((r) => (
          <div key={r._id}>{r._id}: {r.total} ({r.count})</div>
        ))}
      </div>
      <div className="card">
        <div><b>Top Routes</b></div>
        {data.topRoutes.map((r, i) => (
          <div key={i}>{r._id.from} → {r._id.to}: {r.count}</div>
        ))}
      </div>
    </div>
  );
}