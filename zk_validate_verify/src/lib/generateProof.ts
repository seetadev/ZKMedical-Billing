import path from "path";
// @ts-ignore
import * as snarkjs from 'snarkjs';

/**
 * Generates a ZK-proof for the Simple Multiplier circuit.
 * Improved with input validation and structured error reporting.
 */
export const generateProof = async (input0: number, input1: number): Promise<{ proof: string; publicSignals: any[] }> => {
  console.log(`[ZK-Logic] Generating proof for inputs: ${input0}, ${input1}`);
  
  // Step 1: Strict Input Validation
  if (typeof input0 !== 'number' || typeof input1 !== 'number') {
    console.error("Validation Error: Inputs must be valid numbers.");
    return { proof: "", publicSignals: [] };
  }

  const inputs = { in: [input0, input1] };

  // Step 2: Define Absolute Paths
  const wasmPath = path.join(process.cwd(), 'circuits/build/simple_multiplier_js/simple_multiplier.wasm');
  const provingKeyPath = path.join(process.cwd(), 'circuits/build/proving_key.zkey');

  try {
    // Step 3: Proof Generation using Plonk
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(inputs, wasmPath, provingKeyPath);

    // Step 4: Exporting for Solidity (Blockchain) Compatibility
    const calldataBlob = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);
    const calldata = calldataBlob.split(',');

    if (!calldata || calldata.length < 2) {
      throw new Error("Failed to generate valid calldata from proof.");
    }

    console.log("[ZK-Logic] Proof generated successfully.");

    return {
      proof: calldata[0], 
      publicSignals: JSON.parse(calldata[1]),
    }
  } catch (err: any) {
    // Step 5: Structured Logging for easier debugging
    console.error(`[ZK-Error] Proof generation failed:`, err.message || err);
    return {
      proof: "", 
      publicSignals: [],
    }
  }
}
