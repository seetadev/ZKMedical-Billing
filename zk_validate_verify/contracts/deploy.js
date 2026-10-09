const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load .env manually (no dotenv dependency needed)
const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.trim().split("=");
  if (key && rest.length) env[key] = rest.join("=").trim();
}

const SEPOLIA_RPC_URL = env["SEPOLIA_RPC_URL"];
const PRIVATE_KEY = env["PRIVATE_KEY"];

if (!SEPOLIA_RPC_URL || SEPOLIA_RPC_URL.includes("YOUR_ALCHEMY")) {
  console.error("ERROR: SEPOLIA_RPC_URL not set in .env");
  process.exit(1);
}
if (!PRIVATE_KEY || PRIVATE_KEY.includes("YOUR_WALLET")) {
  console.error("ERROR: PRIVATE_KEY not set in .env");
  process.exit(1);
}

// Load compiled artifacts
const plonkArtifact = JSON.parse(
  fs.readFileSync(path.join(__dirname, "out/PlonkVerifier.sol/PlonkVerifier.json"), "utf8")
);
const smArtifact = JSON.parse(
  fs.readFileSync(path.join(__dirname, "out/SimpleMultiplier.sol/SimpleMultiplier.json"), "utf8")
);

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying from address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "SepoliaETH");

  // Deploy PlonkVerifier
  console.log("\nDeploying PlonkVerifier...");
  const PlonkVerifier = new ethers.ContractFactory(
    plonkArtifact.abi,
    plonkArtifact.bytecode.object,
    wallet
  );
  const plonkVerifier = await PlonkVerifier.deploy();
  await plonkVerifier.deployed();
  console.log("PlonkVerifier deployed to:", plonkVerifier.address);

  // Deploy SimpleMultiplier with PlonkVerifier address
  console.log("\nDeploying SimpleMultiplier...");
  const SimpleMultiplier = new ethers.ContractFactory(
    smArtifact.abi,
    smArtifact.bytecode.object,
    wallet
  );
  const simpleMultiplier = await SimpleMultiplier.deploy(plonkVerifier.address);
  await simpleMultiplier.deployed();
  console.log("SimpleMultiplier deployed to:", simpleMultiplier.address);

  console.log("\n--- DEPLOYMENT COMPLETE ---");
  console.log("Update addresses.ts with:");
  console.log(`SIMPLE_MULTIPLIER_ADDR: "${simpleMultiplier.address}"`);
}

main().catch((err) => {
  console.error("Deployment failed:", err.message);
  process.exit(1);
});
