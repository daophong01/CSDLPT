import { NextResponse } from "next/server";
import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY!;

const ABI = [
  "function buy(uint256 id) payable",
];

export async function POST(req: Request) {
  if (!RPC_URL || !CONTRACT_ADDRESS || !WALLET_PRIVATE_KEY) {
    return NextResponse.json({ error: "RPC_URL/CONTRACT_ADDRESS/WALLET_PRIVATE_KEY chưa cấu hình" }, { status: 500 });
  }

  const body = await req.json();
  const ticketId = body.ticketId;
  const priceEth = body.priceEth || "0.01";

  if (!ticketId) {
    return NextResponse.json({ error: "Thiếu ticketId" }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const value = ethers.parseEther(priceEth.toString());
    const tx = await contract.buy(BigInt(ticketId), { value });
    const receipt = await tx.wait();

    return NextResponse.json({ txHash: receipt.transactionHash });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Lỗi gửi giao dịch" }, { status: 400 });
  }
}