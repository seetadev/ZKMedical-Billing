import axios from "axios";
import FormData from "form-data";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");
const SINDRI_BASE = process.env.SINDRI_API_URL ?? "https://sindri.app/api/v1";
const HEADERS     = {
    Authorization:  `Bearer ${process.env.SINDRI_API_KEY}`,
    "Content-Type": "application/json",
};

export class SindriService {

    // ── Circuit management (one-time setup) ───────────────────────────────────

    /**
     * Upload ONNX model to Sindri, compile as ZKML circuit.
     * Run once after training. Save SINDRI_CIRCUIT_ID to .env.
     */
    async uploadAndCompileCircuit() {
        console.log("Uploading ONNX model to Sindri...");
        const onnxBuffer = fs.readFileSync(path.join(ROOT, "zkml/fraud_model.onnx"));

        // 1. Create circuit entry
        const createRes = await axios.post(
            `${SINDRI_BASE}/circuit/create`,
            {
                circuit_name:    "op-medicine-fraud-detector",
                circuit_type:    "onnx",
                proving_scheme:  "groth16",
                curve:           "bn254",
                onnx_model_name: "fraud_model",
                description:     "Medical billing anomaly detection for OP Medicine",
            },
            { headers: HEADERS }
        );
        const circuitId = createRes.data.circuit_id;
        console.log("Circuit ID:", circuitId);

        // 2. Upload ONNX file
        const form = new FormData();
        form.append("onnx_file", onnxBuffer, {
            filename:    "fraud_model.onnx",
            contentType: "application/octet-stream",
        });
        await axios.post(
            `${SINDRI_BASE}/circuit/${circuitId}/upload`,
            form,
            { headers: { ...HEADERS, ...form.getHeaders() } }
        );
        console.log("ONNX file uploaded.");

        // 3. Trigger compilation (trusted setup — takes ~2 mins)
        await axios.post(
            `${SINDRI_BASE}/circuit/${circuitId}/compile`,
            {},
            { headers: HEADERS }
        );
        console.log("Compilation started. Polling...");
        const compiled = await this._poll(
            `${SINDRI_BASE}/circuit/${circuitId}/status`, "compiled", 120000
        );
        if (!compiled) throw new Error("Circuit compilation timed out");
        console.log("Circuit compiled!");

        // 4. Export Solidity verifier
        const verifierRes = await axios.get(
            `${SINDRI_BASE}/circuit/${circuitId}/verifier/solidity`,
            { headers: HEADERS }
        );
        const outPath = path.join(ROOT, "fvm-contracts/contracts/FraudVerifier.sol");
        fs.writeFileSync(outPath, verifierRes.data.verifier_code);
        console.log("FraudVerifier.sol exported to fvm-contracts/contracts/");
        console.log(`\nAdd to .env: SINDRI_CIRCUIT_ID=${circuitId}`);

        return circuitId;
    }

    // ── Proof generation (per invoice) ────────────────────────────────────────

    /**
     * Generate a fraud score proof for a single invoice.
     * @param {object} features - from featureExtractor.extractFraudFeatures()
     * @returns {{ fraudScore, isSafe, threshold, proofId, proof, calldata }}
     */
    async generateFraudProof(features) {
        const circuitId = process.env.SINDRI_CIRCUIT_ID;
        if (!circuitId) throw new Error("SINDRI_CIRCUIT_ID not set in .env");

        const input = {
            invoice_features: [[
                features.amountNormalised,
                features.serviceCodeBucket,
                features.providerFrequency,
                features.dayOfWeek,
                features.amountZscore,
            ]]
        };

        console.log("  Generating fraud proof via Sindri...");

        const proofRes = await axios.post(
            `${SINDRI_BASE}/circuit/${circuitId}/prove`,
            { witness: JSON.stringify(input) },
            { headers: HEADERS }
        );
        const proofId = proofRes.data.proof_id;

        const done = await this._poll(
            `${SINDRI_BASE}/proof/${proofId}/status`, "ready", 60000
        );
        if (!done) throw new Error("Proof generation timed out");

        const detailRes = await axios.get(
            `${SINDRI_BASE}/proof/${proofId}`,
            { headers: HEADERS }
        );
        const proofData = detailRes.data;

        // IsolationForest decision score → normalise to 0–100
        const rawScore   = parseFloat(proofData.public_outputs[0]);
        const fraudScore = this._normaliseScore(rawScore);
        const threshold  = parseInt(process.env.FRAUD_THRESHOLD ?? "75");
        const isSafe     = fraudScore < threshold;

        console.log(`  Fraud score: ${fraudScore}/100 — ${isSafe ? "SAFE" : "SUSPICIOUS"}`);

        return {
            fraudScore,
            isSafe,
            threshold,
            proofId,
            proof:    proofData.proof,
            calldata: proofData.solidity_calldata,
        };
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    // IsolationForest: positive = normal, negative = anomalous.
    // Flip to 0–100 where 0 = safe, 100 = fraud.
    _normaliseScore(rawScore) {
        const clamped = Math.max(-0.5, Math.min(0.5, rawScore));
        return Math.round((0.5 - clamped) * 100);
    }

    async _poll(url, targetStatus, timeoutMs) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const res    = await axios.get(url, { headers: HEADERS });
            const status = res.data.status;
            process.stdout.write(".");
            if (status === targetStatus) { process.stdout.write("\n"); return true; }
            if (status === "failed") throw new Error(`Sindri job failed: ${res.data.error}`);
            await new Promise(r => setTimeout(r, 3000));
        }
        return false;
    }
}
