import { groth16 } from "snarkjs";
import { buildPoseidon } from "circomlibjs";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

async function generateInvoiceProof(invoiceData) {
    const poseidon = await buildPoseidon();

    // Private witness — NEVER sent on-chain
    const witness = {
        // Private inputs
        patient_id:     BigInt(invoiceData.patientId),
        invoice_amount: BigInt(invoiceData.amountCents),   // e.g. 250000 = ₹2500
        service_code:   BigInt(invoiceData.cptCode),        // e.g. 99213
        provider_id:    BigInt(invoiceData.providerId),
        date_unix:      BigInt(Math.floor(invoiceData.date / 1000)),
        salt:           BigInt("0x" + crypto.randomBytes(31).toString("hex")),

        // Public input
        coverage_limit: BigInt(invoiceData.coverageLimitCents),
    };

    console.log("Generating proof for invoice:", invoiceData.invoiceId);
    const startTime = Date.now();

    const { proof, publicSignals } = await groth16.fullProve(
        witness,
        path.join(ROOT, "circuits/build/medical_invoice_js/medical_invoice.wasm"),
        path.join(ROOT, "circuits/build/medical_invoice_final.zkey")
    );

    const proofTime = Date.now() - startTime;
    console.log(`Proof generated in ${proofTime}ms`);

    // publicSignals = [invoice_commitment, is_valid]
    const commitment = publicSignals[0];
    const isValid    = publicSignals[1];

    console.log("Invoice commitment:", commitment);
    console.log("Is valid:", isValid === "1" ? "YES" : "NO");

    // Format for Solidity verifyProof() call
    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const result = {
        proof,
        publicSignals,
        commitment,
        calldata,
        proofTimeMs: proofTime,
    };

    fs.mkdirSync(path.join(ROOT, "outputs"), { recursive: true });
    fs.writeFileSync(
        path.join(ROOT, "outputs/proof.json"),
        JSON.stringify(result, null, 2)
    );

    console.log("\nCalldata for FVM contract:\n", calldata);
    return result;
}

// Example usage — run with: node scripts/generate_proof.js
const result = await generateInvoiceProof({
    invoiceId:          "INV-2025-001",
    patientId:          987654321,
    amountCents:        250000,        // ₹2,500
    cptCode:            99213,         // Office visit, moderate complexity
    providerId:         112233,
    date:               Date.now(),
    coverageLimitCents: 500000,        // ₹5,000 coverage
});

console.log("\nProof saved to outputs/proof.json");
