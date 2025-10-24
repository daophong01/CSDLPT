import { useEffect, useState } from "react";
import { connectWallet, isWalletConnected, getMyTickets, formatTicket, transferTicket, checkIn, cancelTicket } from "../services/web3Service";
import TicketCard from "./TicketCard";
import TransferTicketModal from "./TransferTicketModal";

export default function MyTickets() {
  const [address, setAddress] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showTransfer, setShowTransfer] = useState(null);

  async function load() {
    if (!(await isWalletConnected())) {
      const a = await connectWallet();
      setAddress(a);
    }
    const a = address || (await connectWallet());
    setAddress(a);
    const data = await getMyTickets(a);
    setTickets(data.map(formatTicket));
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid">
      {tickets.map((t) => (
        <TicketCard
          key={t.tokenId}
          ticket={t}
          onTransfer={() => setShowTransfer(t)}
          onCheckIn={async () => { await checkIn(t.tokenId); await load(); }}
          onCancel={async () => { await cancelTicket(t.tokenId); await load(); }}
        />
      ))}
      {showTransfer && (
        <TransferTicketModal
          ticket={showTransfer}
          onClose={() => setShowTransfer(null)}
          onSubmit={async (to, name) => {
            await transferTicket(showTransfer.tokenId, to, name);
            setShowTransfer(null);
            await load();
          }}
        />
      )}
    </div>
  );
}