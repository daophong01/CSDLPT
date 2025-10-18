/* eslint-disable */
const fs = require("fs");
const path = require("path");

async function main() {
  const hre = require("hardhat");

  const rpc = process.env.RPC_URL || "http://localhost:8545";
  const pk = process.env.WALLET_PRIVATE_KEY || "";
  if (!pk) {
    console.warn("WALLET_PRIVATE_KEY is empty. Deployment may fail if network requires accounts.");
  }
  console.log("Using RPC:", rpc);

  // Compile
  await hre.run("compile");

  // Deploy AirlineRegistry
  const Registry = await hre.ethers.getContractFactory("AirlineRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("AirlineRegistry deployed:", registryAddress);

  // Deploy Flight with registry
  const Flight = await hre.ethers.getContractFactory("Flight");
  const flight = await Flight.deploy(registryAddress);
  await flight.waitForDeployment();
  const flightAddress = await flight.getAddress();
  console.log("Flight deployed:", flightAddress);

  // Deploy Ticketing with registry
  const Ticketing = await hre.ethers.getContractFactory("Ticketing");
  const ticketing = await Ticketing.deploy(registryAddress);
  await ticketing.waitForDeployment();
  const ticketingAddress = await ticketing.getAddress();
  console.log("Ticketing deployed:", ticketingAddress);

  // Save deployed addresses
  const out = {
    AirlineRegistry: registryAddress,
    Flight: flightAddress,
    Ticketing: ticketingAddress,
    network: rpc,
    deployedAt: new Date().toISOString(),
  };
  const outfile = path.join(process.cwd(), ".deployed.json");
  fs.writeFileSync(outfile, JSON.stringify(out, null, 2));
  console.log("Saved addresses to", outfile);

  // Helper: print env vars to set
  console.log("Set these in your .env:");
  console.log("CONTRACT_ADDRESS=", ticketingAddress);
  console.log("FLIGHT_CONTRACT_ADDRESS=", flightAddress);
  console.log("REGISTRY_ADDRESS=", registryAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});