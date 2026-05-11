require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// ── Admin Hardhat tasks ────────────────────────────────────────────────────

task("ppt:fee", "Read current invoice fee from PPTPaymentController")
    .setAction(async (_, hre) => {
        const deployments = require("./deployments/calibration.json");
        const controller  = await hre.ethers.getContractAt(
            "PPTPaymentController",
            deployments.paymentController
        );
        const fee = await controller.invoiceFee();
        console.log("Current invoice fee:", hre.ethers.formatEther(fee), "PPT");
    });

task("ppt:set-fee", "Set invoice fee on PPTPaymentController")
    .addParam("fee", "New fee in PPT (e.g. 10)")
    .setAction(async ({ fee }, hre) => {
        const deployments = require("./deployments/calibration.json");
        const controller  = await hre.ethers.getContractAt(
            "PPTPaymentController",
            deployments.paymentController
        );
        const tx = await controller.setInvoiceFee(hre.ethers.parseEther(fee));
        await tx.wait();
        console.log("Invoice fee updated to", fee, "PPT. Tx:", tx.hash);
    });

task("ppt:subscription", "Check subscription status for an address")
    .addParam("address", "Wallet address to check")
    .setAction(async ({ address }, hre) => {
        const deployments  = require("./deployments/calibration.json");
        const controller   = await hre.ethers.getContractAt(
            "PPTPaymentController",
            deployments.paymentController
        );
        const { plan, expiry } = await controller.subscriptions(address);
        const hasAccess        = await controller.hasActiveAccess(address);
        const planNames        = ["None", "Basic", "Pro", "Enterprise"];
        const expiryDate       = Number(expiry) > 0
            ? new Date(Number(expiry) * 1000).toISOString()
            : "N/A";

        console.log("Address:    ", address);
        console.log("Plan:       ", planNames[Number(plan)] ?? "Unknown");
        console.log("Expiry:     ", expiryDate);
        console.log("Has Access: ", hasAccess);
    });

// ──────────────────────────────────────────────────────────────────────────

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,   // required — verifier contract is large
    }
  },
  networks: {
    // FVM Calibration testnet — use this for all testing
    calibration: {
      chainId: 314159,
      url:      process.env.CALIBRATION_RPC  || "https://api.calibration.node.glif.io/rpc/v1",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // FVM Mainnet — only after full testing
    filecoin: {
      chainId: 314,
      url:      process.env.MAINNET_RPC || "https://api.node.glif.io/rpc/v1",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Optimism Sepolia — for cross-chain PPTMirrorToken + ProofAnchor
    optimismSepolia: {
      chainId: 11155420,
      url:      process.env.OP_RPC || "https://sepolia.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};
