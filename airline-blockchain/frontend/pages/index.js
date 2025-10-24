import "../styles/globals.css";
import { useState } from "react";
import FlightSearchForm from "../components/FlightSearchForm";
import FlightResults from "../components/FlightResults";
import WalletConnect from "../components/WalletConnect";

export default function Home() {
  const [flights, setFlights] = useState([]);
  return (
    <div className="container">
      <h1>Airline Blockchain</h1>
      <p>Book and manage airline tickets as NFTs on the blockchain.</p>
      <WalletConnect />
      <FlightSearchForm onResults={setFlights} />
      <FlightResults flights={flights} onBook={(f) => location.assign(`/booking/${encodeURIComponent(f.blockchainId || 0)}`)} />
    </div>
  );
}