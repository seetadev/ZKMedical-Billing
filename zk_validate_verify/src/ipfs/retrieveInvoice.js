import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";

/**
 * Retrieve and decrypt an invoice from Filecoin/IPFS.
 *
 * The insurer must have been granted access by the provider first:
 *   registry.grantInsurerAccess(commitment, insurerAddress)
 *
 * @param {string} cid               - IPFS CID from the on-chain InvoiceRecord
 * @param {string} insurerPrivateKey - insurer's wallet private key
 */
export async function retrieveInvoice(cid, insurerPrivateKey) {
    const wallet    = new ethers.Wallet(insurerPrivateKey);
    const message   = `Decrypt invoice: ${cid}`;
    const signature = await wallet.signMessage(message);

    console.log("Retrieving encrypted invoice from Lighthouse...");
    console.log("Insurer address:", wallet.address);

    // Lighthouse decrypts server-side using the wallet signature as proof of identity
    const response = await lighthouse.decryptFile(
        cid,
        wallet.address,
        signature
    );

    const invoiceText = await response.text();
    const invoice     = JSON.parse(invoiceText);

    console.log("Invoice retrieved successfully");
    console.log("Uploaded at:", invoice.uploadedAt);
    console.log("Invoice data:", invoice.invoice);

    return invoice;
}

// Example usage:
// const invoice = await retrieveInvoice("bafybei...", process.env.INSURER_PRIVATE_KEY);
