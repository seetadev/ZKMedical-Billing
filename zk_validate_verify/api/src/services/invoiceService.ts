import { ethers }  from "ethers";
import crypto       from "crypto";
import path         from "path";
import fs           from "fs";

const ROOT         = path.join(__dirname, "../../..");
const deployments  = JSON.parse(fs.readFileSync(
    path.join(ROOT, "fvm-contracts/deployments/calibration.json"), "utf8"
));
const REGISTRY_ABI = JSON.parse(fs.readFileSync(
    path.join(ROOT, "fvm-contracts/artifacts/contracts/MedicalBillingRegistry.sol/MedicalBillingRegistry.json"), "utf8"
)).abi;
const PPT_ABI = JSON.parse(fs.readFileSync(
    path.join(ROOT, "fvm-contracts/artifacts/contracts/MockPPT.sol/MockPPT.json"), "utf8"
)).abi;

export interface SubmitInvoiceInput {
    patientId:          string;
    amountCents:        number;
    cptCode:            number;
    providerId:         string;
    coverageLimitCents: number;
    providerWallet:     string;
}

export interface SubmitInvoiceResult {
    commitment: string;
    ipfsCID:    string;
    txHash:     string;
    fraudScore: number;
}

export class InvoiceService {
    private get provider() {
        return new ethers.JsonRpcProvider(process.env.CALIBRATION_RPC);
    }
    private get wallet() {
        if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY env var is not set");
        return new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    }
    private get registry() {
        return new ethers.Contract(deployments.registry, REGISTRY_ABI, this.wallet);
    }
    private get ppt() {
        return new ethers.Contract(process.env.PPT_TOKEN_ADDRESS!, PPT_ABI, this.wallet);
    }

    async submitInvoice(input: SubmitInvoiceInput): Promise<SubmitInvoiceResult> {
        // Dynamic imports — these use ES module syntax in the rest of the project
        const { groth16 }       = await import("snarkjs");
        const { SindriService } = await import("../../../zkml/sindriService.js" as any);
        const { uploadInvoice } = await import("../../../src/ipfs/invoiceStorage.js" as any);
        const { extractFraudFeatures } = await import("../../../zkml/featureExtractor.js" as any);

        const witness = {
            patient_id:     BigInt(input.patientId.replace(/\D/g, "") || "0"),
            invoice_amount: BigInt(input.amountCents),
            service_code:   BigInt(input.cptCode),
            provider_id:    BigInt(input.providerId.replace(/\D/g, "") || "0"),
            date_unix:      BigInt(Math.floor(Date.now() / 1000)),
            salt:           BigInt("0x" + crypto.randomBytes(31).toString("hex")),
            coverage_limit: BigInt(input.coverageLimitCents),
        };

        // Fraud check
        const sindri       = new SindriService();
        const emptyStats   = { frequency: {}, means: {}, stds: {} };
        const features     = extractFraudFeatures(witness, emptyStats);
        const fraudCheck   = await sindri.generateFraudProof(features);

        if (!fraudCheck.isSafe) {
            const err: any = new Error(
                `Invoice blocked — fraud score ${fraudCheck.fraudScore}/100`
            );
            err.statusCode = 422;
            err.code       = "FRAUD_DETECTED";
            throw err;
        }

        // Generate ZK billing proof
        const { proof, publicSignals } = await groth16.fullProve(
            witness,
            path.join(ROOT, "circuits/build/medical_invoice_js/medical_invoice.wasm"),
            path.join(ROOT, "circuits/build/medical_invoice_final.zkey")
        );
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
        const [pA, pB, pC, pubSigs] = JSON.parse("[" + calldata + "]");

        // Upload to IPFS
        const ipfsCID = await uploadInvoice(
            { cptCode: input.cptCode, amountCents: input.amountCents },
            process.env.PRIVATE_KEY!,
            "lighthouse"
        );

        // Approve PPT
        await (await this.ppt.approve(
            deployments.paymentController,
            ethers.parseEther("10")
        )).wait();

        // Submit to FVM with fraud proof
        const [fpA, fpB, fpC, fraudPubSigs] = JSON.parse("[" + fraudCheck.calldata + "]");
        const tx      = await this.registry.submitInvoice(
            pA, pB, pC, pubSigs,
            witness.coverage_limit, ipfsCID,
            fpA, fpB, fpC, fraudPubSigs
        );
        const receipt    = await tx.wait();
        const commitment = "0x" + BigInt(publicSignals[0]).toString(16).padStart(64, "0");

        return { commitment, ipfsCID, txHash: receipt.hash, fraudScore: fraudCheck.fraudScore };
    }

    async getInvoice(commitment: string) {
        const record = await this.registry.invoices(commitment);
        if (!record.submittedAt || Number(record.submittedAt) === 0) return null;
        return {
            commitment,
            ipfsCID:     record.ipfsCID,
            provider:    record.provider,
            submittedAt: new Date(Number(record.submittedAt) * 1000).toISOString(),
            disputed:    record.disputed,
        };
    }

    async getProviderInvoices(address: string): Promise<string[]> {
        return this.registry.getProviderInvoices(address);
    }
}
