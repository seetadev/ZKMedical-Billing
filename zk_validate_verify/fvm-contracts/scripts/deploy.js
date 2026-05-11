const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying from:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "FIL");

    // ── 1. Deploy MedicalInvoiceVerifier (auto-generated from snarkjs) ──
    console.log("\n[1/3] Deploying MedicalInvoiceVerifier...");
    const Verifier = await ethers.getContractFactory("MedicalInvoiceVerifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddr = await verifier.getAddress();
    console.log("MedicalInvoiceVerifier:", verifierAddr);

    // ── 2. Deploy PPTPaymentController ──
    console.log("\n[2/3] Deploying PPTPaymentController...");

    const PPT_TOKEN_ADDRESS = process.env.PPT_TOKEN_ADDRESS;
    const TREASURY_ADDRESS  = process.env.TREASURY_ADDRESS || deployer.address;

    if (!PPT_TOKEN_ADDRESS) {
        throw new Error("PPT_TOKEN_ADDRESS not set. Run deploy_mock_ppt.js first.");
    }

    const PaymentController = await ethers.getContractFactory("PPTPaymentController");
    const paymentController = await PaymentController.deploy(PPT_TOKEN_ADDRESS, TREASURY_ADDRESS);
    await paymentController.waitForDeployment();
    const paymentAddr = await paymentController.getAddress();
    console.log("PPTPaymentController:", paymentAddr);

    // ── 3. Deploy MedicalBillingRegistry ──
    console.log("\n[3/3] Deploying MedicalBillingRegistry...");
    const Registry = await ethers.getContractFactory("MedicalBillingRegistry");
    const registry = await Registry.deploy(verifierAddr, paymentAddr);
    await registry.waitForDeployment();
    const registryAddr = await registry.getAddress();
    console.log("MedicalBillingRegistry:", registryAddr);

    // ── 4. Post-deployment wiring ──
    console.log("\nWiring contracts...");
    const tx = await paymentController.setAuthorisedCaller(registryAddr, true);
    await tx.wait();
    console.log("Registry authorised as PPT caller");

    // ── 5. Save deployment manifest ──
    const deployment = {
        network:           "calibration",
        chainId:           314159,
        verifier:          verifierAddr,
        paymentController: paymentAddr,
        registry:          registryAddr,
        pptToken:          PPT_TOKEN_ADDRESS,
        treasury:          TREASURY_ADDRESS,
        deployedAt:        new Date().toISOString(),
    };

    fs.mkdirSync(path.join(__dirname, "../deployments"), { recursive: true });
    fs.writeFileSync(
        path.join(__dirname, "../deployments/calibration.json"),
        JSON.stringify(deployment, null, 2)
    );

    console.log("\n=== DEPLOYMENT COMPLETE ===");
    console.log("MedicalInvoiceVerifier: ", verifierAddr);
    console.log("PPTPaymentController:   ", paymentAddr);
    console.log("MedicalBillingRegistry: ", registryAddr);
    console.log("\nSaved to deployments/calibration.json");
}

main().catch((err) => { console.error(err); process.exit(1); });
