import lighthouse from "@lighthouse-web3/sdk";
import { ethers } from "ethers";

/**
 * Set on-chain access conditions for an uploaded CID.
 *
 * Only wallets where insurerAccess[insurer][commitment] == true
 * on the MedicalBillingRegistry can decrypt the file.
 * Call this after registry.grantInsurerAccess() has been confirmed.
 *
 * @param {string} cid              - IPFS CID of the encrypted invoice
 * @param {string} commitment       - bytes32 Poseidon commitment (hex string)
 * @param {string} registryAddress  - deployed MedicalBillingRegistry address
 * @param {string} uploaderWalletKey - provider's private key (original uploader)
 */
export async function setRegistryAccessCondition(
    cid,
    commitment,
    registryAddress,
    uploaderWalletKey
) {
    const wallet    = new ethers.Wallet(uploaderWalletKey);
    const signature = await wallet.signMessage(`Access condition: ${cid}`);

    // Condition: call registry.isVerified(commitment) → must return true
    const conditions = [
        {
            id: 1,
            chain: "Filecoin",
            method: "isVerified",
            standardContractType: "Custom",
            contractAddress: registryAddress,
            returnValueTest: { comparator: "==", value: "true" },
            parameters: [commitment],
            inputArrayType: ["bytes32"],
            outputType: "bool",
        },
    ];

    const aggregator = "([1])";  // condition 1 must pass

    const response = await lighthouse.applyAccessConditions(
        cid,
        conditions,
        process.env.LIGHTHOUSE_API_KEY,
        signature,
        wallet.address,
        aggregator
    );

    console.log("Registry-gated access condition applied for CID:", cid);
    console.log("Response:", response.data);
}
