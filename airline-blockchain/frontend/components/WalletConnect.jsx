import { useEffect, useState } from "react";
import { connectWallet, isWalletConnected } from "../services/web3Service";

export default function WalletConnect() {
  const [address, setAddress] = useState(null);

  async function connect() {
    const a = await connectWallet();
    setAddress(a);
  }

  useEffect(() => {
    isWalletConnected().then(async (c) => {
      if (c) {
        const a = await connectWallet();
        setAddress(a);
      }
    });
  }, []);

  return (
    <div className="card row" style={{ justifyContent: "space-between" }}>
      <div>{address ? `Connected: ${address}` : "Wallet not connected"}</div>
      {!address && <button className="button" onClick={connect}>Connect Wallet</button>}
    </div>
  );
}