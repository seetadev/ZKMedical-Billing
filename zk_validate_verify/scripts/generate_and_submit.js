import { groth16 }        from "snarkjs";
import { ethers }         from "ethers";
import { uploadInvoice }  from "../src/ipfs/invoiceStorage.js";
import { BridgeService }  from "../src/crosschain/bridgeService.js";
import crypto             from "crypto";
import fs                 from "fs";
import path               from "path";
import { fileURLToPath }  from "url";
import "dotenv/config";

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, "..");
const deployments = JSON.parse(fs.readFileSync(path.join(ROOT, "fvm-contracts/deployments/calibration.json")));

const REGISTRY_ABI = JSON.parse(
    fs.readFileSync(path.join(ROOT, "fvm-contracts/artifacts/contracts/MedicalBillingRegistry.sol/MedicalBillingRegistry.json"))
).abi;

const PPT_ABI = JSON.parse(
    fs.readFileSync(path.join(ROOT, "fvm-contracts/artifacts/contracts/MockPPT.sol/MockPPT.json"))
).abi;

async function generateAndSubmit(invoiceData) {
    const provider = new ethers.JsonRpcProvider(process.env.CALIBRATION_RPC);
    const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Provider wallet:", wallet.address);

    // ── Step 1: Upload encrypted invoice to Filecoin/IPFS ────────────────
    console.log("\n[1/5] Uploading invoice to Filecoin/IPFS...");
    const ipfsCID = await uploadInvoice(
        invoiceData,
        process.env.PRIVATE_KEY,
        "lighthouse"   // switch to "storacha" for W3C UCAN-based storage
    );
    console.log("CID:", ipfsCID);

    // ── Step 2: Generate ZK proof off-chain ───────────────────────────────
    console.log("\n[2/5] Generating ZK proof...");
    const witness = {
        patient_id:     BigInt(invoiceData.patientId),
        invoice_amount: BigInt(invoiceData.amountCents),
        service_code:   BigInt(invoiceData.cptCode),
        provider_id:    BigInt(invoiceData.providerId),
        date_unix:      BigInt(Math.floor(Date.now() / 1000)),
        salt:           BigInt("0x" + crypto.randomBytes(31).toString("hex")),
        coverage_limit: BigInt(invoiceData.coverageLimitCents),
    };

    const { proof, publicSignals } = await groth16.fullProve(
        witness,
        path.join(ROOT, "circuits/build/medical_invoice_js/medical_invoice.wasm"),
        path.join(ROOT, "circuits/build/medical_invoice_final.zkey")
    );

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    const [pA, pB, pC, pubSignalsFormatted] = JSON.parse("[" + calldata + "]");
    console.log("Proof generated");

    // ── Step 3: Approve PPT fee ───────────────────────────────────────────
    console.log("\n[3/5] Approving PPT fee...");
    const ppt = new ethers.Contract(deployments.pptToken, PPT_ABI, wallet);
    await (await ppt.approve(
        deployments.paymentController,
        ethers.parseEther("10")   // 10 PPT submission fee
    )).wait();
    console.log("PPT approved");

    // ── Step 4: Submit invoice to FVM registry ────────────────────────────
    console.log("\n[4/5] Submitting invoice to FVM registry...");
    const registry = new ethers.Contract(deployments.registry, REGISTRY_ABI, wallet);

    const tx = await registry.submitInvoice(
        pA, pB, pC, pubSignalsFormatted,
        BigInt(invoiceData.coverageLimitCents),
        ipfsCID
    );
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.hash);

    const commitment = "0x" + BigInt(pubSignalsFormatted[0]).toString(16).padStart(64, "0");

    // ── Step 5: Verify it is stored on-chain ──────────────────────────────────
    console.log("\n[5/6] Verifying on-chain...");
    const isVerified = await registry.isVerified(commitment);
    console.log("On-chain verified:", isVerified);

    // ── Step 6: Bridge proof commitment to Optimism ───────────────────────────
    let opAnchored = false;
    if (process.env.OP_RPC) {
        console.log("\n[6/6] Bridging proof to Optimism...");
        const opProvider  = new ethers.JsonRpcProvider(process.env.OP_RPC);
        const bridgeSvc   = new BridgeService(wallet, opProvider);
        await bridgeSvc.bridgeProofToOptimism(commitment, ipfsCID);
        console.log("Waiting for Optimism anchor (relayer must be running)...");
        try {
            opAnchored = await bridgeSvc.waitForAnchor(commitment, 120000);
            console.log("Anchored on Optimism:", opAnchored);
        } catch (err) {
            console.warn("Anchor timeout:", err.message);
        }
    } else {
        console.log("\n[6/6] Skipping Optimism bridge (OP_RPC not set)");
    }

    const result = { ipfsCID, commitment, txHash: receipt.hash, opAnchored };

    fs.mkdirSync(path.join(ROOT, "outputs"), { recursive: true });
    fs.writeFileSync(
        path.join(ROOT, "outputs/submission_result.json"),
        JSON.stringify(result, null, 2)
    );

    console.log("\n=== SUBMISSION COMPLETE ===");
    console.log("IPFS CID:      ", ipfsCID);
    console.log("Commitment:    ", commitment);
    console.log("Tx Hash:       ", receipt.hash);
    console.log("OP Anchored:   ", opAnchored);

    return result;
}

// Run with: node scripts/generate_and_submit.js
const result = await generateAndSubmit({
    patientId:          987654321,
    amountCents:        250000,    // ₹2,500
    cptCode:            99213,     // Office visit, moderate complexity
    providerId:         112233,
    coverageLimitCents: 500000,    // ₹5,000 coverage
});
