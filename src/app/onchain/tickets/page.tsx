"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";

type Ticket = {
  ticketId: string;
  flightId: string;
  owner: string;
  class: string;
  status: string;
  price: string;
  lastEventTx: string;
};

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TICKETING_ADDRESS;

export default function OnchainTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadTickets() {
    const res = await fetch("/api/onchain/tickets");
    const data = await res.json();
    setTickets(data.tickets || []);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function buyWithMetaMask(id: string) {
    setMsg(null);
    setLoadingId(id);
    try {
      // Require MetaMask (window.ethereum)
      const anyWindow = window as any;
      const eth = anyWindow.ethereum;
      if (!eth) {
        setMsg("MetaMask chưa được cài đặt.");
        setLoadingId(null);
        return;
      }
      await eth.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();

      // Read price from contract (tickets(id).price)
      const ABI = [
        "function buy(uint256 id) payable",
        "function tickets(uint256 id) view returns (uint256 id_, bytes32 flightId, address owner, uint256 price, bytes32 classCode, uint8 status)"
      ];
      const address = CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_TICKETING_ADDRESS;
      if (!address) {
        setMsg("Thiếu địa chỉ hợp đồng Ticketing (NEXT_PUBLIC_TICKETING_ADDRESS).");
        setLoadingId(null);
        return;
      }
      const contract = new ethers.Contract(address, ABI, signer);
      const info = await contract.tickets(BigInt(id));
      const priceWei = info.price;
      const tx = await contract.buy(BigInt(id), { value: priceWei });
      const receipt = await tx.wait();
      setMsg(`Đã mua vé on-chain, tx: ${receipt.transactionHash}`);
    } catch (e: any) {
      setMsg(e.message || "Lỗi mua vé với MetaMask");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">On-chain Tickets</h1>
      <p className="text-sm text-black/70 dark:text-white/70">
        Danh sách vé từ mirror on-chain. Bạn có thể dùng MetaMask để mua vé trực tiếp (demo).
      </p>
      {msg && <div className="text-sm">{msg}</div>}
      <div className="space-y-3">
        {tickets.length === 0 ? (
          <p className="text-sm text-black/70 dark:text-white/70">Chưa có vé on-chain.</p>
        ) : (
          tickets.map((t) => (
            <div key={t.ticketId} className="border rounded-lg p-4 flex items-start justify-between">
              <div>
                <div className="font-semibold">Ticket #{t.ticketId}</div>
                <div className="text-sm">Flight: {t.flightId}</div>
                <div className="text-sm">Owner: {t.owner}</div>
                <div className="text-sm">Class: {t.class}</div>
                <div className="text-sm">Status: {t.status}</div>
                <div className="text-sm">Last TX: {t.lastEventTx}</div>
                <div className="pt-2">
                  <Link href={`/verify?ticketId=${t.ticketId}`} className="underline text-sm">Xác thực vé</Link>
                </div>
              </div>
              <button
                className="rounded border px-3 py-2 text-sm bg-black text-white dark:bg-white dark:text-black"
                onClick={() => buyWithMetaMask(t.ticketId)}
                disabled={loadingId === t.ticketId}
              >
                {loadingId === t.ticketId ? "Đang mua..." : "Mua bằng MetaMask"}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}