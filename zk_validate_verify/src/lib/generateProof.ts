import path from "path";
// @ts-ignore
import * as snarkjs from "snarkjs";

// Number of line items the circuit was compiled with (must match medical_invoice.circom)
const NUM_ITEMS = 5;

export interface InvoiceProofInputs {
    /** Cost of each line item in cents (array of NUM_ITEMS values; pad unused slots with 0) */
    itemCosts: number[];
    /** Sum of all itemCosts in cents */
    treatmentTotal: number;
    /** Portion of the bill covered by insurance, in cents */
    insuranceCoverage: number;
    /** Portion owed by the patient (treatmentTotal - insuranceCoverage), in cents */
    patientContribution: number;
}

export interface ProofResult {
    /** Solidity-encoded PLONK proof bytes */
    proof: string;
    /** Public signals: [claimedTotal] */
    publicSignals: string[];
}

/**
 * Generates a PLONK zero-knowledge proof for a medical invoice.
 *
 * The proof attests that:
 *  - The line items sum correctly to treatmentTotal
 *  - insuranceCoverage + patientContribution == treatmentTotal
 *  - All monetary values are in a valid range [0, 2^27)
 *
 * Only `claimedTotal` (== treatmentTotal) is revealed as a public signal.
 * The individual item costs and the coverage split remain private.
 *
 * @param inputs - Invoice data.  itemCosts must have exactly NUM_ITEMS entries.
 * @returns Encoded proof and public signals ready for on-chain submission.
 */
export const generateProof = async (inputs: InvoiceProofInputs): Promise<ProofResult> => {
    const { itemCosts, treatmentTotal, insuranceCoverage, patientContribution } = inputs;

    if (itemCosts.length !== NUM_ITEMS) {
        throw new Error(
            `itemCosts must have exactly ${NUM_ITEMS} entries; received ${itemCosts.length}. ` +
                `Pad unused slots with 0.`
        );
    }

    if (itemCosts.reduce((a, b) => a + b, 0) !== treatmentTotal) {
        throw new Error("Sum of itemCosts does not equal treatmentTotal.");
    }

    if (insuranceCoverage + patientContribution !== treatmentTotal) {
        throw new Error("insuranceCoverage + patientContribution must equal treatmentTotal.");
    }

    console.log("Generating medical invoice ZK proof…", {
        treatmentTotal,
        insuranceCoverage,
        patientContribution,
    });

    const circuitInputs = {
        itemCosts,
        treatmentTotal,
        insuranceCoverage,
        patientContribution,
    };

    // Paths to the compiled circuit artifacts.
    // Run `circom medical_invoice.circom --r1cs --wasm --sym` and then
    // `snarkjs plonk setup` to regenerate these files after circuit changes.
    const wasmPath = path.join(
        process.cwd(),
        "circuits/build/medical_invoice_js/medical_invoice.wasm"
    );
    const provingKeyPath = path.join(process.cwd(), "circuits/build/proving_key.zkey");

    try {
        const { proof, publicSignals } = await snarkjs.plonk.fullProve(
            circuitInputs,
            wasmPath,
            provingKeyPath
        );

        // Export as Solidity calldata for the on-chain verifier
        const calldataBlob = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);
        const calldata = calldataBlob.split(",");

        console.log("Proof generated. Public signals:", publicSignals);

        return {
            proof: calldata[0],
            publicSignals: JSON.parse(calldata[1]),
        };
    } catch (err) {
        console.error("Error generating proof:", err);
        return {
            proof: "",
            publicSignals: [],
        };
    }
};
