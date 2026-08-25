const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY must be set in contracts/.env before deploying.");
  }

  console.log("==================================================");
  console.log("🚀 Deploying PROOFIN Contracts to Monad Testnet...");
  console.log("==================================================");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "MON");

  const communityPool = deployer.address;

  const ProofinFactory = await ethers.getContractFactory("Proofin");
  const proofin = await ProofinFactory.deploy(communityPool);
  await proofin.waitForDeployment();

  const contractAddress = await proofin.getAddress();
  console.log("\n✅ PROOFIN deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Monad Testnet Explorer:", `https://testnet.monadscan.com/address/${contractAddress}`);

  // Seed sample demo event: "MONAD BLITZ WORKSHOP"
  console.log("\n📦 Seeding Demo Event: 'MONAD BLITZ WORKSHOP'...");
  const now = Math.floor(Date.now() / 1000);
  const eventTime = now + 4 * 3600; // 4 hours from now
  const checkInDeadline = now + 3.75 * 3600; // 3 hours 45 mins from now
  const depositAmount = ethers.parseEther("0.01"); // 0.01 MON
  const capacity = 50;

  try {
    const createTx = await proofin.createEvent(
      "MONAD BLITZ WORKSHOP",
      "EVENT",
      "Hands-on Web3 builder workshop and hackathon sprint on Monad Testnet. Learn, build, and deploy high-throughput dApps.",
      "Monad Hub, Hyderabad (Room A-101)",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      eventTime - 3600,
      eventTime + 3600,
      now + 2 * 3600,
      checkInDeadline,
      depositAmount,
      capacity,
      0 // ORGANIZER policy
    );
    await createTx.wait();
    console.log("✅ Demo Event created with ID: 1");
  } catch (err) {
    console.log("Demo event seeding note:", err.message);
  }

  // Export contract deployment info and ABI to frontend
  const deployedInfo = {
    address: contractAddress,
    network: "monadTestnet",
    chainId: 10143,
    explorer: `https://testnet.monadscan.com/address/${contractAddress}`,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../../web/src/lib");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "deployedContract.json"),
    JSON.stringify(deployedInfo, null, 2)
  );

  // Also export ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Proofin.sol/Proofin.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(outputDir, "ProofinABI.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("💾 Exported ABI to web/src/lib/ProofinABI.json");
  }

  console.log("\n💾 Exported deployment metadata to web/src/lib/deployedContract.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
