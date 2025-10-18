import { ethers } from "ethers";
import { pool } from "@/lib/db";

const RPC_URL = process.env.RPC_URL!;
const TICKETING_CONTRACT = process.env.CONTRACT_ADDRESS!; // Ticketing.sol
const FLIGHT_CONTRACT = process.env.FLIGHT_CONTRACT_ADDRESS || ""; // Flight.sol
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY!;

// Minimal ABIs with events used for mirroring
const TICKETING_ABI = [
  "event TicketIssued(uint256 indexed id, bytes32 flightId, uint256 price, bytes32 classCode)",
  "event TicketPurchased(uint256 indexed id, address indexed buyer, uint256 price)",
  "event TicketTransferred(uint256 indexed id, address indexed from, address indexed to)",
  "event TicketCanceled(uint256 indexed id)",
  "function tickets(uint256 id) view returns (uint256 id_, bytes32 flightId, address owner, uint256 price, bytes32 classCode, uint8 status)"
];

const FLIGHT_ABI = [
  "event FlightCreated(bytes32 indexed flightId, string flightCode, string origin, string destination, uint256 departure, uint256 arrival, bytes32 airplaneHash, address indexed issuer)"
];

async function upsertTicketMirror(data: {
  ticketId: string;
  flightId: string;
  owner?: string;
  class?: string;
  status?: string;
  price?: string;
  txHash: string;
}) {
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT ticket_id FROM ticket_mirror WHERE ticket_id = $1", [data.ticketId]);
    if (existing.rowCount === 0) {
      await client.query(
        `INSERT INTO ticket_mirror (ticket_id, flight_id, owner, class, status, price, last_event_tx)
         VALUES ($1, $2, COALESCE($3, ''), COALESCE($4, 'ECONOMY'), COALESCE($5, 'ISSUED'), COALESCE($6, '0'), $7)`,
        [data.ticketId, data.flightId, data.owner, data.class, data.status, data.price, data.txHash]
      );
    } else {
      await client.query(
        `UPDATE ticket_mirror
         SET owner = COALESCE($2, owner),
             class = COALESCE($3, class),
             status = COALESCE($4, status),
             price = COALESCE($5::numeric, price),
             last_event_tx = $6
         WHERE ticket_id = $1`,
        [data.ticketId, data.owner, data.class, data.status, data.price, data.txHash]
      );
    }
  } finally {
    client.release();
  }
}

async function upsertFlightMirror(data: {
  flightId: string;
  flightCode: string;
  origin: string;
  destination: string;
  departure: number;
  arrival: number;
  airplaneHash: string;
  txHash: string;
}) {
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT flight_id FROM flight_mirror WHERE flight_id = $1", [data.flightId]);
    if (existing.rowCount === 0) {
      await client.query(
        `INSERT INTO flight_mirror (flight_id, flight_code, origin, destination, departure, arrival, airplane_hash, last_event_tx)
         VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6), $7, $8)`,
        [data.flightId, data.flightCode, data.origin, data.destination, data.departure, data.arrival, data.airplaneHash, data.txHash]
      );
    } else {
      await client.query(
        `UPDATE flight_mirror
         SET flight_code = $2,
             origin = $3,
             destination = $4,
             departure = to_timestamp($5),
             arrival = to_timestamp($6),
             airplane_hash = $7,
             last_event_tx = $8
         WHERE flight_id = $1`,
        [data.flightId, data.flightCode, data.origin, data.destination, data.departure, data.arrival, data.airplaneHash, data.txHash]
      );
    }
  } finally {
    client.release();
  }
}

async function main() {
  if (!RPC_URL || !TICKETING_CONTRACT) {
    throw new Error("Missing RPC_URL or CONTRACT_ADDRESS (Ticketing) in env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = WALLET_PRIVATE_KEY ? new ethers.Wallet(WALLET_PRIVATE_KEY, provider) : undefined;

  // Ticketing subscription
  const ticketing = new ethers.Contract(TICKETING_CONTRACT, TICKETING_ABI, wallet ?? provider);

  ticketing.on("TicketIssued", async (id, flightId, price, classCode, event) => {
    await upsertTicketMirror({
      ticketId: id.toString(),
      flightId: flightId,
      class: ethers.decodeBytes32String(classCode),
      status: "ISSUED",
      price: price.toString(),
      txHash: event.log.transactionHash,
    });
    console.log("Issued:", id.toString(), "tx:", event.log.transactionHash);
  });

  ticketing.on("TicketPurchased", async (id, buyer, price, event) => {
    await upsertTicketMirror({
      ticketId: id.toString(),
      flightId: "", // keep existing
      owner: buyer.toLowerCase(),
      status: "PURCHASED",
      price: price.toString(),
      txHash: event.log.transactionHash,
    });
    console.log("Purchased:", id.toString(), "buyer:", buyer, "tx:", event.log.transactionHash);
  });

  ticketing.on("TicketTransferred", async (id, from, to, event) => {
    await upsertTicketMirror({
      ticketId: id.toString(),
      flightId: "",
      owner: to.toLowerCase(),
      status: "TRANSFERRED",
      txHash: event.log.transactionHash,
    });
    console.log("Transferred:", id.toString(), "to:", to, "tx:", event.log.transactionHash);
  });

  ticketing.on("TicketCanceled", async (id, event) => {
    await upsertTicketMirror({
      ticketId: id.toString(),
      flightId: "",
      status: "CANCELED",
      txHash: event.log.transactionHash,
    });
    console.log("Canceled:", id.toString(), "tx:", event.log.transactionHash);
  });

  // Flight subscription (optional if FLIGHT_CONTRACT set)
  if (FLIGHT_CONTRACT) {
    const flight = new ethers.Contract(FLIGHT_CONTRACT, FLIGHT_ABI, wallet ?? provider);
    flight.on("FlightCreated", async (flightId, flightCode, origin, destination, departure, arrival, airplaneHash, issuer, event) => {
      await upsertFlightMirror({
        flightId: flightId,
        flightCode,
        origin,
        destination,
        departure: Number(departure),
        arrival: Number(arrival),
        airplaneHash,
        txHash: event.log.transactionHash,
      });
      console.log("FlightCreated:", flightCode, "tx:", event.log.transactionHash);
    });
    console.log("Subscribed Flight contract:", FLIGHT_CONTRACT);
  }

  console.log("Web3 listener started. Ticketing contract:", TICKETING_CONTRACT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});