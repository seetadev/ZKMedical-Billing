import { groth16 }           from "snarkjs";
import { ethers }            from "ethers";
import { EMTTRClient }       from "./emttrClient.js";
import { mapRecordToWitness }  from "./fieldMapper.js";
import { uploadInvoice }     from "../ipfs/invoiceStorage.js";
import { SindriService }     from "../../zkml/sindriService.js";
import { extractFraudFeatures, buildProviderStats } from "../../zkml/featureExtractor.js";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const sindri = new SindriService();

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, "../..");
const DEPLOYMENTS = JSON.parse(
    fs.readFileSync(path.join(ROOT, "fvm-contracts/deployments/calibration.json"))
);
const REGISTRY_ABI = JSON.parse(
    fs.readFileSync(
        path.join(ROOT, "fvm-contracts/artifacts/contracts/MedicalBillingRegistry.sol/MedicalBillingRegistry.json")
    )
).abi;
const PPT_ABI = JSON.parse(
    fs.readFileSync(
        path.join(ROOT, "fvm-contracts/artifacts/contracts/MockPPT.sol/MockPPT.json")
    )
).abi;

/**
 * Process all pending EMTTR records through the full ZK billing pipeline.
 * Runs sequentially to avoid nonce collisions on FVM.
 *
 * @param {object} options
 * @param {number}  options.batchSize - max records per run (default 10)
 * @param {boolean} options.dryRun   - generate proofs but skip IPFS + FVM
 */
export async function runBillingPipeline({ batchSize = 10, dryRun = false } = {}) {
    const emttr    = new EMTTRClient();
    const provider = new ethers.JsonRpcProvider(process.env.CALIBRATION_RPC);
    const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const registry = new ethers.Contract(DEPLOYMENTS.registry, REGISTRY_ABI, wallet);
    const ppt      = new ethers.Contract(process.env.PPT_TOKEN_ADDRESS, PPT_ABI, wallet);

    if (!dryRun) {
        const batchApproval = ethers.parseEther(String(10 * batchSize));
        await (await ppt.approve(DEPLOYMENTS.paymentController, batchApproval)).wait();
        console.log(`Approved PPT for batch of ${batchSize}`);
    }

    const records = await emttr.getPendingBillingRecords(batchSize);
    console.log(`Processing ${records.length} pending EMTTR records...`);

    // Build provider stats once for the whole batch — used by fraud feature extractor
    const providerStats = buildProviderStats(records);

    const results = { processed: 0, succeeded: 0, failed: 0, errors: [] };

    for (const record of records) {
        console.log(`\n[${results.processed + 1}/${records.length}] Record: ${record.id}`);

        try {
            const result = await processRecord(record, emttr, wallet, registry, dryRun, providerStats);
            results.succeeded++;
            console.log(`  Success — commitment: ${result.commitment.slice(0, 10)}...`);
        } catch (err) {
            results.failed++;
            results.errors.push({ recordId: record.id, error: err.message });
            console.error(`  Failed: ${err.message}`);
            try {
                await emttr.markBillingFailed(record.id, err.message);
            } catch (writeErr) {
                console.error("  Could not write failure to EMTTR:", writeErr.message);
            }
        }

        results.processed++;
        // Small delay between records — avoids FVM rate limiting
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log("\n=== Batch complete ===");
    console.log(`Succeeded: ${results.succeeded}/${results.processed}`);
    if (results.errors.length > 0) {
        console.log("Errors:", JSON.stringify(results.errors, null, 2));
    }

    fs.mkdirSync(path.join(ROOT, "outputs"), { recursive: true });
    fs.writeFileSync(
        path.join(ROOT, `outputs/pipeline_run_${Date.now()}.json`),
        JSON.stringify({ ...results, runAt: new Date().toISOString() }, null, 2)
    );

    return results;
}

// ── Single record processor ───────────────────────────────────────────────────

async function processRecord(record, emttr, wallet, registry, dryRun, providerStats) {
    const coverage = await emttr.getCoveragePolicy(record.patient_id);
    const witness  = mapRecordToWitness(record, coverage);
    console.log(
        `  Mapped: ${witness._meta.originalAmount} ${witness._meta.currency}` +
        ` → ${witness.invoice_amount} (smallest unit)`
    );

    console.log("  Generating ZK proof...");
    const { proof, publicSignals } = await groth16.fullProve(
        omitMeta(witness),
        path.join(ROOT, "circuits/build/medical_invoice_js/medical_invoice.wasm"),
        path.join(ROOT, "circuits/build/medical_invoice_final.zkey")
    );
    console.log(`  is_valid: ${publicSignals[1]}`);

    if (publicSignals[1] !== "1") {
        throw new Error("ZK circuit rejected invoice — constraint violation");
    }

    // ── Fraud check via Sindri ────────────────────────────────────────────────
    console.log("  Running fraud detection...");
    const features   = extractFraudFeatures(witness, providerStats);
    const fraudCheck = await sindri.generateFraudProof(features);

    if (!fraudCheck.isSafe) {
        throw new Error(
            `Invoice blocked — fraud score ${fraudCheck.fraudScore}/100 ` +
            `exceeds threshold ${fraudCheck.threshold}`
        );
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (dryRun) {
        console.log("  [DRY RUN] Skipping IPFS upload and on-chain submission");
        return {
            commitment:  "0x" + BigInt(publicSignals[0]).toString(16),
            ipfsCID:     "dry-run",
            txHash:      "dry-run",
            fraudScore:  fraudCheck.fraudScore,
        };
    }

    console.log("  Uploading to Filecoin/IPFS...");
    const invoicePayload = {
        emttrRecordId: record.id,
        trialId:       record.trial_id,
        serviceDate:   record.service_date,
        serviceCode:   record.service_code,
        billedAmount:  record.billed_amount,
        currency:      record.currency,
        providerNpi:   record.provider_npi,
        // patient_id intentionally excluded — private, only in the ZK proof
    };
    const ipfsCID = await uploadInvoice(invoicePayload, process.env.PRIVATE_KEY, "lighthouse");

    console.log("  Submitting to FVM...");
    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    const [pA, pB, pC, pubSigs] = JSON.parse("[" + calldata + "]");

    // Parse fraud proof calldata and append to registry call
    const [fpA, fpB, fpC, fraudPubSigs] = JSON.parse("[" + fraudCheck.calldata + "]");

    const tx = await registry.submitInvoice(
        pA, pB, pC, pubSigs,
        witness.coverage_limit, ipfsCID,
        fpA, fpB, fpC, fraudPubSigs
    );
    const receipt    = await tx.wait();
    const commitment = "0x" + BigInt(publicSignals[0]).toString(16).padStart(64, "0");

    console.log("  Writing result back to EMTTR...");
    await emttr.updateBillingStatus(record.id, { commitment, ipfsCID, txHash: receipt.hash });

    return { commitment, ipfsCID, txHash: receipt.hash, fraudScore: fraudCheck.fraudScore };
}

function omitMeta({ _meta, ...circuitInputs }) {
    return circuitInputs;
}
