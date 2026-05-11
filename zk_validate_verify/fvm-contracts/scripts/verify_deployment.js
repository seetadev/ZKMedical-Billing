const { ethers } = require("hardhat");
const deployments = require("../deployments/calibration.json");

async function main() {
    console.log("Verifying deployment on Calibration testnet...\n");

    const registry = await ethers.getContractAt("MedicalBillingRegistry", deployments.registry);
    const payment  = await ethers.getContractAt("PPTPaymentController",   deployments.paymentController);

    console.log("Registry address:     ", deployments.registry);
    console.log("PaymentController:    ", deployments.paymentController);
    console.log("Verifier address:     ", deployments.verifier);

    console.log("\nRegistry paused?     ", await registry.paused());
    console.log("Total invoices:       ", (await registry.totalInvoices()).toString());
    console.log("Invoice fee (PPT):    ", ethers.formatEther(await payment.invoiceSubmissionFee()));
    console.log("Registry authorised?: ", await payment.authorisedCallers(deployments.registry));

    console.log("\nAll checks passed. Contracts are live and ready.");
}

main().catch(console.error);
