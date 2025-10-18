/* eslint-disable */
const fs = require("fs");

async function main() {
  const hre = require("hardhat");

  const deployedPath = ".deployed.json";
  if (!fs.existsSync(deployedPath)) {
    throw new Error(".deployed.json not found. Run npm run deploy:contracts first.");
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));
  const registryAddr = deployed.AirlineRegistry;
  const flightAddr = deployed.Flight;
  const ticketingAddr = deployed.Ticketing;

  // Use first signer as airline
  const [signer] = await hre.ethers.getSigners();

  // Add airline to Registry
  const Registry = await hre.ethers.getContractFactory("AirlineRegistry");
  const registry = Registry.attach(registryAddr);
  const addTx = await registry.connect(signer).addAirline(await signer.getAddress());
  await addTx.wait();
  console.log("Airline added:", await signer.getAddress());

  // Create a flight
  const Flight = await hre.ethers.getContractFactory("Flight");
  const flight = Flight.attach(flightAddr);
  const now = Math.floor(Date.now() / 1000);
  const dep = now + 3600 * 24;
  const arr = dep + 2 * 3600;
  const airplaneHash = hre.ethers.id("A321");
  const createTx = await flight.connect(signer).createFlight("VN231", "HAN", "SGN", dep, arr, airplaneHash);
  const receipt = await createTx.wait();
  const event = receipt.logs.map((l) => l).find(() => true); // simplistic
  console.log("Flight created tx:", receipt.transactionHash);

  // Issue a ticket for that flight
  const Ticketing = await hre.ethers.getContractFactory("Ticketing");
  const ticketing = Ticketing.attach(ticketingAddr);
  const flightId = hre.ethers.id("VN231" + "HAN" + "SGN" + dep + await signer.getAddress()); // must match Flight.sol calculation
  const classCode = hre.ethers.encodeBytes32String("ECONOMY");
  const price = hre.ethers.parseEther("0.01");
  const issueTx = await ticketing.connect(signer).issueTicket(flightId, price, classCode);
  const issueReceipt = await issueTx.wait();
  console.log("Ticket issued tx:", issueReceipt.transactionHash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});