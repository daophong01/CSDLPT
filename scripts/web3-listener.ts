import { ethers } from "ethers";
import { pool } from "@/lib/db";

const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY!;

// Minimal ABI with events used for mirroring
const ABI = [
  "event TicketIssued(uint256 indexed id, bytes32 flightId, uint256 price, bytes32 classCode)",
  "event TicketPurchased(uint256 indexed id, address indexed buyer, uint256 price)",
  "event TicketTransferred(uint256 indexed id, address indexed from, address indexed to)",
  "event TicketCanceled(uint256 indexed id)",
  "function tickets(uint256 id) view returns (uint256 id_, bytes32 flightId, address owner, uint256 price, bytes32 classCode, uint8 status)"
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

async function main() {
  if (!RPC_URL || !CONTRACT_ADDRESS) {
    throw new Error("Missing RPC_URL or CONTRACT_ADDRESS in env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = WALLET_PRIVATE_KEY ? new ethers.Wallet(WALLET_PRIVATE_KEY, provider) : undefined;
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet ?? provider);

  contract.on("TicketIssued", async (id, flightId, price, classCode, event) => {
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

  contract.on("TicketPurchased", async (id, buyer, price, event) => {
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

  contract.on("TicketTransferred", async (id, from, to, event) => {
    await upsertTicketMirror({
      ticketId: id.toString(),
      flightId: "",
      owner: to.toLowerCase(),
      status: "TRANSFERRED",
      txHash: event.log.transactionHash,
    });
    console.log("Transferred:", id.toString(), "to:", to, "tx:", event.log.transactionHash);
  });

  contract.on("TicketCanceled", async (id, event) => {
    await upsertTicketMirror({
      ticketId: id.toString(),
      flightId: "",
      status: "CANCELED",
      txHash: event.log.transactionHash,
    });
    console.log("Canceled:", id.toString(), "tx:", event.log.transactionHash);
  });

  console.log("Web3 listener started. Subscribed to contract:", CONTRACT_ADDRESS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});