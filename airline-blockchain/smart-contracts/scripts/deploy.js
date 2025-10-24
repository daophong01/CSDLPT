require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function verify(hre, address, constructorArgs = []) {
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log("Verified on Etherscan:", address);
  } catch (e) {
    console.warn("Verify skipped/failed:", e.message || e);
  }
}

async function main() {
  const hre = require("hardhat");
  await hre.run("compile");

  const Contract = await hre.ethers.getContractFactory("AirlineTicketNFT");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("AirlineTicketNFT deployed at:", address);

  // sample flights
  const now = Math.floor(Date.now() / 1000);
  const flights = [
    ["VN231", "Vietnam Airlines", "HAN", "SGN", now + 86400, now + 86400 + 7200, 180],
    ["VJ101", "VietJet Air", "DAD", "HAN", now + 90000, now + 90000 + 5400, 180],
    ["QH801", "Bamboo Airways", "SGN", "CXR", now + 36000, now + 36000 + 4200, 160],
  ];

  for (const f of flights) {
    const tx = await contract.createFlight(...f);
    const receipt = await tx.wait();
    console.log("Flight created tx:", receipt.transactionHash, "data:", f[0], f[2], "->", f[3]);
  }

  // verify (optional)
  await verify(hre, address, []);

  // save deployments.json
  const deployments = {
    AirlineTicketNFT: address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };
  const outPath = path.join(process.cwd(), "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deployments, null, 2));
  console.log("Saved deployments to:", outPath);

  // export ABI to backend and frontend
  const artifactPath = path.join(process.cwd(), "artifacts/contracts/AirlineTicketNFT.sol/AirlineTicketNFT.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const abi = artifact.abi;
    const backendAbiPath = path.join(process.cwd(), "..", "backend", "src", "services", "abi.json");
    const frontendAbiPath = path.join(process.cwd(), "..", "frontend", "services", "abi.json");
    fs.writeFileSync(backendAbiPath, JSON.stringify(abi, null, 2));
    fs.writeFileSync(frontendAbiPath, JSON.stringify(abi, null, 2));
    console.log("Exported ABI to:", backendAbiPath, "and", frontendAbiPath);
  } else {
    console.warn("Artifact not found:", artifactPath);
  }
}

main().catch((e) => {
  console.error("Deploy failed:", e);
  process.exit(1);
});