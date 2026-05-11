const { ethers } = require("hardhat");
const deployments = require("../deployments/calibration.json");
const proofData   = require("../../outputs/proof.json");  // from generate_proof.js

async function main() {
    const [provider] = await ethers.getSigners();
    console.log("Testing invoice submission from:", provider.address);

    const ppt      = await ethers.getContractAt("MockPPT",                deployments.pptToken);
    const payment  = await ethers.getContractAt("PPTPaymentController",   deployments.paymentController);
    const registry = await ethers.getContractAt("MedicalBillingRegistry", deployments.registry);

    // 1. Mint test PPT and approve the payment controller
    await (await ppt.faucet(provider.address, ethers.parseEther("100"))).wait();
    await (await ppt.approve(deployments.paymentController, ethers.parseEther("100"))).wait();
    console.log("PPT minted and approved");

    // 2. Parse snarkjs calldata into proof components
    const calldata = JSON.parse("[" + proofData.calldata + "]");
    const [pA, pB, pC, pubSignals] = calldata;

    // 3. Submit invoice with IPFS CID
    const ipfsCID      = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    const coverageLimit = BigInt(500000); // matches circuit input

    const tx      = await registry.submitInvoice(pA, pB, pC, pubSignals, coverageLimit, ipfsCID);
    const receipt = await tx.wait();
    console.log("Invoice submitted! Tx:", receipt.hash);

    // 4. Confirm it was stored and verified
    const commitment = "0x" + BigInt(pubSignals[0]).toString(16).padStart(64, "0");
    const verified   = await registry.isVerified(commitment);
    console.log("Is verified on-chain:", verified);

    const count = await registry.getInvoiceCount(provider.address);
    console.log("Total invoices for provider:", count.toString());
}

main().catch(console.error);
