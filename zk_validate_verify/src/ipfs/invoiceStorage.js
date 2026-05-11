import lighthouse from "@lighthouse-web3/sdk";
import * as Client from "@web3-storage/w3up-client";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

/**
 * Encrypts invoice JSON and uploads to Filecoin/IPFS.
 * Returns a CID you pass into submitInvoice().
 *
 * @param {object} invoiceData  - raw invoice fields (patient_id, amount, etc.)
 * @param {string} walletKey    - provider's private key (for Lighthouse encryption)
 * @param {string} provider     - "lighthouse" | "storacha"
 */
export async function uploadInvoice(invoiceData, walletKey, provider = "lighthouse") {
    const payload = {
        version: "1.0",
        uploadedAt: new Date().toISOString(),
        invoice: invoiceData,
    };

    const tempPath = `/tmp/invoice_${Date.now()}.json`;
    fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2));

    let cid;

    if (provider === "lighthouse") {
        cid = await uploadWithLighthouse(tempPath, walletKey);
    } else {
        cid = await uploadWithStoracha(tempPath);
    }

    fs.unlinkSync(tempPath);
    return cid;
}

// ── Lighthouse path ──────────────────────────────────────────────────────────

async function uploadWithLighthouse(filePath, walletKey) {
    const apiKey  = process.env.LIGHTHOUSE_API_KEY;
    const wallet  = new ethers.Wallet(walletKey);

    // Wallet signature becomes the encryption key — only this wallet can decrypt
    const message   = `OP Medicine invoice upload: ${Date.now()}`;
    const signature = await wallet.signMessage(message);

    console.log("Uploading to Lighthouse with encryption...");

    const response = await lighthouse.uploadEncrypted(
        filePath,
        apiKey,
        wallet.address,
        signature
    );

    const cid = response.data.Hash;
    console.log("Lighthouse CID:", cid);
    console.log("Gateway URL:", `https://gateway.lighthouse.storage/ipfs/${cid}`);

    // Access condition: any wallet with >= 0 FIL balance can request decryption
    // (tightened to specific insurer addresses in setAccessConditions.js)
    await lighthouse.applyAccessConditions(
        cid,
        [
            {
                id: 1,
                chain: "Filecoin",
                method: "getBalance",
                standardContractType: "",
                contractAddress: "",
                returnValueTest: { comparator: ">=", value: "0" },
                parameters: [":userAddress"],
            },
        ],
        apiKey,
        signature,
        wallet.address
    );

    return cid;
}

// ── Storacha (w3up) path ─────────────────────────────────────────────────────

async function uploadWithStoracha(filePath) {
    const client = await Client.create();

    // One-time setup — run w3 login and w3 space create first (see README)
    // await client.login(process.env.STORACHA_EMAIL);
    // await client.setCurrentSpace(process.env.STORACHA_SPACE_DID);

    const fileContent = fs.readFileSync(filePath);
    const file = new File([fileContent], path.basename(filePath), {
        type: "application/json",
    });

    console.log("Uploading to Storacha...");
    const cid = await client.uploadFile(file);

    console.log("Storacha CID:", cid.toString());
    console.log("Gateway URL:", `https://w3s.link/ipfs/${cid}`);

    return cid.toString();
}
