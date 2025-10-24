import "../styles/globals.css";
import MyTickets from "../components/MyTickets";

export default function MyTicketsPage() {
  return (
    <div className="container">
      <h1>My Tickets</h1>
      <MyTickets />
    </div>
  );
}