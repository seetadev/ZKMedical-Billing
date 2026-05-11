import { ethers } from "ethers";
import path        from "path";
import fs          from "fs";

const ROOT         = path.join(__dirname, "../../..");
const deployments  = JSON.parse(fs.readFileSync(
    path.join(ROOT, "fvm-contracts/deployments/calibration.json"), "utf8"
));
const REGISTRY_ABI = JSON.parse(fs.readFileSync(
    path.join(ROOT, "fvm-contracts/artifacts/contracts/MedicalBillingRegistry.sol/MedicalBillingRegistry.json"), "utf8"
)).abi;

let opCrosschain: any = {};
try {
    opCrosschain = JSON.parse(fs.readFileSync(
        path.join(ROOT, "fvm-contracts/deployments/crosschain_op.json"), "utf8"
    ));
} catch { /* crosschain not yet deployed */ }

const ANCHOR_ABI = [
    "function isAnchored(bytes32) view returns (bool)",
    "function getAnchor(bytes32) view returns (tuple(bytes32,address,string,uint256,uint256))",
];

export class VerifyService {
    private fvmProvider = new ethers.JsonRpcProvider(process.env.CALIBRATION_RPC);
    private registry    = new ethers.Contract(deployments.registry, REGISTRY_ABI, this.fvmProvider);
    private opProvider  = process.env.OP_RPC
        ? new ethers.JsonRpcProvider(process.env.OP_RPC)
        : null;
    private anchor      = opCrosschain.opProofAnchor && this.opProvider
        ? new ethers.Contract(opCrosschain.opProofAnchor, ANCHOR_ABI, this.opProvider)
        : null;

    async verifyCommitment(commitment: string) {
        const record = await this.registry.invoices(commitment);
        const verified = Number(record.submittedAt) > 0 && !record.disputed;

        let anchoredOnOP = false;
        if (this.anchor) {
            try { anchoredOnOP = await this.anchor.isAnchored(commitment); } catch {}
        }

        const fraudAbi   = ["function checks(bytes32) view returns (uint256,bool,uint256)"];
        let fraudScore   = 0;
        if (deployments.fraudRegistry) {
            const fraudReg = new ethers.Contract(deployments.fraudRegistry, fraudAbi, this.fvmProvider);
            try {
                const check = await fraudReg.checks(commitment);
                fraudScore  = Number(check[0]);
            } catch {}
        }

        return {
            verified,
            commitment,
            ipfsCID:      record.ipfsCID      ?? null,
            provider:     record.provider     ?? null,
            submittedAt:  record.submittedAt  ? new Date(Number(record.submittedAt) * 1000).toISOString() : null,
            disputed:     record.disputed     ?? false,
            fraudScore,
            anchoredOnOP,
        };
    }

    async verifyBatch(commitments: string[]) {
        return Promise.all(commitments.map(c => this.verifyCommitment(c)));
    }
}
