import { ethers } from "ethers";
import abi from "./abi.json";

let provider, signer, contract;

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  contract = new ethers.Contract(address, abi, signer);
  return accounts[0];
}

export async function isWalletConnected() {
  if (!window.ethereum) return false;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts && accounts.length > 0;
}

export async function bookTicket({ flightId, passengerName, passportNumber, seatNumber, ticketClass, isTransferable }) {
  const price = await contract.calculateTicketPrice(ticketClass);
  const tx = await contract.mintTicket(flightId, passengerName, passportNumber, seatNumber, ticketClass, isTransferable, { value: price });
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

export async function getMyTickets(address) {
  const ids = await contract.getPassengerTickets(address);
  const details = [];
  for (const id of ids) {
    const info = await contract.getTicketDetails(id);
    details.push({ tokenId: Number(id), ticket: info[0], flight: info[1] });
  }
  return details;
}

export async function transferTicket(tokenId, toAddress, newName) {
  const tx = await contract.transferTicket(tokenId, toAddress, newName);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

export async function checkIn(tokenId) {
  const tx = await contract.checkIn(tokenId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

export async function cancelTicket(tokenId) {
  const tx = await contract.cancelTicket(tokenId);
  const receipt = await tx.wait();
  return { txHash: receipt.transactionHash };
}

export async function calculatePrice(ticketClass) {
  const price = await contract.calculateTicketPrice(ticketClass);
  return Number(ethers.formatEther(price));
}

export function formatTicket(t) {
  return {
    tokenId: t.tokenId,
    passenger: t.ticket.passenger,
    passengerName: t.ticket.passengerName,
    seatNumber: t.ticket.seatNumber,
    class: t.ticket.ticketClass,
    priceEth: Number(ethers.formatEther(t.ticket.price)),
    checkedIn: t.ticket.isCheckedIn,
    used: t.ticket.isUsed,
    flightNumber: t.flight.flightNumber,
    route: `${t.flight.departureAirport} → ${t.flight.arrivalAirport}`,
    departure: new Date(Number(t.flight.departureTime) * 1000),
    arrival: new Date(Number(t.flight.arrivalTime) * 1000)
  };
}

export function formatFlight(f) {
  return {
    flightNumber: f.flightNumber,
    airline: f.airline,
    route: `${f.departureAirport} → ${f.arrivalAirport}`,
    departure: new Date(f.departureTime),
    arrival: new Date(f.arrivalTime)
  };
}

if (typeof window !== "undefined" && window.ethereum) {
  window.ethereum.on("accountsChanged", () => {
    signer = null;
  });
  window.ethereum.on("chainChanged", () => {
    signer = null;
  });
}