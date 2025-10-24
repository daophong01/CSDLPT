import "../../styles/globals.css";
import { useState } from "react";
import FlightSearchForm from "../../components/FlightSearchForm";
import FlightResults from "../../components/FlightResults";

export default function SearchPage() {
  const [flights, setFlights] = useState([]);
  return (
    <div className="container">
      <h1>Search Flights</h1>
      <FlightSearchForm onResults={setFlights} />
      <FlightResults flights={flights} onBook={(f) => location.assign(`/booking/${encodeURIComponent(f.blockchainId || 0)}`)} />
    </div>
  );
}