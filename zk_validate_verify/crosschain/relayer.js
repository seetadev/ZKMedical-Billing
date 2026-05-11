import { ethers } from "ethers";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, "..");

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

const BRIDGE_ABI = loadABI("BillingBridge");
const MIRROR_ABI = loadABI("PPTMirrorToken");
const ANCHOR_ABI = loadABI("ProofAnchor");

// ── Providers + signers ───────────────────────────────────────────────────────
const fvmProvider   = new ethers.JsonRpcProvider(process.env.FVM_RPC);
const opProvider    = new ethers.JsonRpcProvider(process.env.OP_RPC);
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY);
const fvmSigner     = relayerWallet.connect(fvmProvider);
const opSigner      = relayerWallet.connect(opProvider);

// ── Contracts ─────────────────────────────────────────────────────────────────
const bridge      = new ethers.Contract(fvmCrosschain.fvmBridge,     BRIDGE_ABI, fvmSigner);
const mirrorToken = new ethers.Contract(opCrosschain.opMirrorToken,  MIRROR_ABI, opSigner);
const proofAnchor = new ethers.Contract(opCrosschain.opProofAnchor,  ANCHOR_ABI, opSigner);

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleTokenBridge(sender, recipient, amount, nonce, bridgeId, event) {
    console.log(`\n[TOKEN BRIDGE] ${ethers.formatEther(amount)} PPT`);
    console.log(`  From (FVM): ${sender}`);
    console.log(`  To (OP):    ${recipient}`);
    console.log(`  BridgeId:   ${bridgeId}`);

    try {
        await waitForConfirmations(fvmProvider, event.log.blockHash, 3);

        const tx      = await mirrorToken.bridgeMint(recipient, amount, bridgeId);
        const receipt = await tx.wait();
        console.log(`  Minted on OP. Tx: ${receipt.hash}`);

        await (await bridge.confirmBridge(bridgeId)).wait();
        console.log(`  Bridge confirmed on FVM.`);
    } catch (err) {
        console.error(`  Token bridge failed: ${err.message}`);
    }
}

async function handleProofBridge(commitment, provider, ipfsCID, timestamp, event) {
    console.log(`\n[PROOF BRIDGE] ${commitment.slice(0, 10)}...`);
    console.log(`  Provider: ${provider}`);
    console.log(`  CID:      ${ipfsCID}`);

    try {
        await waitForConfirmations(fvmProvider, event.log.blockHash, 3);

        const tx      = await proofAnchor.anchorProof(commitment, provider, ipfsCID, timestamp);
        const receipt = await tx.wait();
        console.log(`  Anchored on OP. Tx: ${receipt.hash}`);
    } catch (err) {
        console.error(`  Proof anchor failed: ${err.message}`);
    }
}

// ── Wait for N block confirmations on the given provider ──────────────────────
async function waitForConfirmations(provider, blockHash, confirmations) {
    return new Promise((resolve) => {
        const check = async () => {
            const block   = await provider.getBlock(blockHash);
            const current = await provider.getBlockNumber();
            if (current - block.number >= confirmations) {
                resolve();
            } else {
                setTimeout(check, 3000);
            }
        };
        check();
    });
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function startRelayer() {
    const relayerAddr = relayerWallet.address;
    const fvmChainId  = (await fvmProvider.getNetwork()).chainId;
    const opChainId   = (await opProvider.getNetwork()).chainId;

    console.log("Relayer started.");
    console.log("Relayer address:", relayerAddr);
    console.log("FVM chainId:", fvmChainId.toString());
    console.log("OP  chainId:", opChainId.toString());
    console.log("Watching FVM bridge:", fvmCrosschain.fvmBridge);

    bridge.on("BridgeInitiated", handleTokenBridge);
    bridge.on("ProofBridged",    handleProofBridge);

    console.log("Listening for events...\n");

    process.on("SIGINT", () => {
        console.log("Relayer stopped.");
        bridge.removeAllListeners();
        process.exit(0);
    });
}

startRelayer().catch(console.error);
