import { render, screen } from "@testing-library/react";
import MyTickets from "../components/MyTickets";
import * as web3 from "../services/web3Service";

jest.mock("../services/web3Service");

test("renders MyTickets list", async () => {
  web3.isWalletConnected.mockResolvedValue(true);
  web3.connectWallet.mockResolvedValue("0xabc");
  web3.getMyTickets.mockResolvedValue([
    { tokenId: 1, ticket: { passenger: "0xabc", passengerName: "Alice", seatNumber: "12A", ticketClass: "ECONOMY", price: 10000000000000000n, isCheckedIn: false, isUsed: false }, flight: { flightNumber: "VN231", departureAirport: "HAN", arrivalAirport: "SGN", departureTime: BigInt(Math.floor(Date.now()/1000)), arrivalTime: BigInt(Math.floor(Date.now()/1000)+7200) } }
  ]);

  render(<MyTickets />);
  expect(await screen.findByText(/Ticket #1/i)).toBeInTheDocument();
});