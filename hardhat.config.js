require("@nomicfoundation/hardhat-ethers");

const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.20",
  networks: {
    custom: {
      url: RPC_URL,
      accounts: WALLET_PRIVATE_KEY ? [WALLET_PRIVATE_KEY] : [],
    },
    // You can also use 'hardhat' or 'localhost' as needed.
  },
};