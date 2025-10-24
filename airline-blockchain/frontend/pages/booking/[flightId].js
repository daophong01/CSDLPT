import "../../styles/globals.css";
import BookingForm from "../../components/BookingForm";

export default function BookingPage({ flightId }) {
  const fakeFlight = { blockchainId: Number(flightId), flightNumber: "VN231", departureAirport: "HAN", arrivalAirport: "SGN", departureTime: Date.now(), arrivalTime: Date.now() + 7200000 };
  return (
    <div className="container">
      <h1>Booking — Flight #{flightId}</h1>
      <div className="card">
        <div><b>{fakeFlight.flightNumber}</b> — {fakeFlight.departureAirport} → {fakeFlight.arrivalAirport}</div>
      </div>
      <BookingForm flight={fakeFlight} />
    </div>
  );
}

BookingPage.getInitialProps = ({ query }) => ({ flightId: query.flightId });