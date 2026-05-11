import { ethers } from "ethers";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, "../..");

const fvmCrosschain = JSON.parse(
    fs.readFileSync(path.join(ROOT, "fvm-contracts/deployments/crosschain_fvm.json"))
);
const opCrosschain = JSON.parse(
    fs.readFileSync(path.join(ROOT, "fvm-contracts/deployments/crosschain_op.json"))
);

function loadABI(contractName) {
    return JSON.parse(
        fs.readFileSync(
            path.join(ROOT, `fvm-contracts/artifacts/contracts/crosschain/${contractName}.sol/${contractName}.json`)
        )
    ).abi;
}

export class BridgeService {
    /**
     * @param {ethers.Signer}   fvmSigner   - signer connected to FVM
     * @param {ethers.Provider} opProvider  - read-only provider for Optimism
     */
    constructor(fvmSigner, opProvider) {
        this.bridge = new ethers.Contract(
            fvmCrosschain.fvmBridge,
            loadABI("BillingBridge"),
            fvmSigner
        );
        this.anchor = new ethers.Contract(
            opCrosschain.opProofAnchor,
            loadABI("ProofAnchor"),
            opProvider
        );
    }

    /**
     * Bridge PPT tokens from FVM to Optimism.
     * Returns bridgeId — poll BridgeCompleted event to confirm arrival.
     */
    async bridgeTokensToOptimism(amount, recipientOnOP) {
        const amountWei = ethers.parseEther(amount.toString());
        console.log(`Bridging ${amount} PPT to Optimism...`);

        const tx      = await this.bridge.bridgeTokens(amountWei, recipientOnOP);
        const receipt = await tx.wait();

        const event = receipt.logs
            .map(log => { try { return this.bridge.interface.parseLog(log); } catch { return null; } })
            .find(e => e?.name === "BridgeInitiated");

        const bridgeId = event?.args?.bridgeId;
        console.log("Bridge initiated. ID:", bridgeId);
        console.log("Tx:", receipt.hash);
        console.log("Waiting for relayer to mint on Optimism (~30s)...");

        return { bridgeId, txHash: receipt.hash };
    }

    /**
     * Bridge a verified invoice commitment from FVM to Optimism.
     * Call after registry.submitInvoice() succeeds on FVM.
     */
    async bridgeProofToOptimism(commitment, ipfsCID) {
        console.log(`Bridging proof commitment to Optimism...`);
        const tx      = await this.bridge.bridgeProof(commitment, ipfsCID);
        const receipt = await tx.wait();
        console.log("Proof bridge tx:", receipt.hash);
        return receipt;
    }

    /**
     * Check if a commitment has been anchored on Optimism.
     * Insurers call this to verify a claim without touching FVM.
     */
    async isAnchoredOnOptimism(commitment) {
        return this.anchor.isAnchored(commitment);
    }

    /**
     * Get full anchor details for a commitment on Optimism.
     */
    async getAnchor(commitment) {
        const a = await this.anchor.getAnchor(commitment);
        return {
            commitment:   a.commitment,
            provider:     a.provider,
            ipfsCID:      a.ipfsCID,
            anchoredAt:   new Date(Number(a.anchoredAt)   * 1000),
            fvmTimestamp: new Date(Number(a.fvmTimestamp) * 1000),
        };
    }

    /**
     * Poll until a commitment is anchored on Optimism.
     * Useful in the frontend to show real-time confirmation status.
     *
     * @param {string} commitment - bytes32 Poseidon commitment
     * @param {number} timeoutMs  - give up after this many ms (default 2 min)
     */
    async waitForAnchor(commitment, timeoutMs = 120000) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const anchored = await this.isAnchoredOnOptimism(commitment);
            if (anchored) return true;
            await new Promise(r => setTimeout(r, 5000));
        }
        throw new Error("Anchor timeout — relayer may be slow or not running");
    }
}
