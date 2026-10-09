import crypto from "crypto";
import path   from "path";
import fs     from "fs";

const ROOT = path.join(__dirname, "../../..");

export interface GenerateProofInput {
    patientId:          string;
    amountCents:        number;
    cptCode:            number;
    providerId:         string;
    coverageLimitCents: number;
}

export interface GenerateProofResult {
    commitment:  string;
    isValid:     boolean;
    calldata:    string;
    proofTimeMs: number;
}

export class ProofService {

    async generateProof(input: GenerateProofInput): Promise<GenerateProofResult> {
        const { groth16 } = await import("snarkjs");

        const witness = {
            patient_id:     BigInt(input.patientId.replace(/\D/g, "") || "0"),
            invoice_amount: BigInt(input.amountCents),
            service_code:   BigInt(input.cptCode),
            provider_id:    BigInt(input.providerId.replace(/\D/g, "") || "0"),
            date_unix:      BigInt(Math.floor(Date.now() / 1000)),
            salt:           BigInt("0x" + crypto.randomBytes(31).toString("hex")),
            coverage_limit: BigInt(input.coverageLimitCents),
        };

        const start = Date.now();
        const { proof, publicSignals } = await groth16.fullProve(
            witness,
            path.join(ROOT, "circuits/build/medical_invoice_js/medical_invoice.wasm"),
            path.join(ROOT, "circuits/build/medical_invoice_final.zkey")
        );
        const proofTimeMs = Date.now() - start;

        const calldata   = await groth16.exportSolidityCallData(proof, publicSignals);
        const isValid    = publicSignals[1] === "1";
        const commitment = "0x" + BigInt(publicSignals[0]).toString(16).padStart(64, "0");

        return { commitment, isValid, calldata, proofTimeMs };
    }

    async verifyLocally(proof: object, publicSignals: string[]): Promise<boolean> {
        const { groth16 } = await import("snarkjs");
        const vKey = JSON.parse(
            fs.readFileSync(path.join(ROOT, "circuits/build/verification_key.json"), "utf8")
        );
        return groth16.verify(vKey, publicSignals, proof);
    }
}
