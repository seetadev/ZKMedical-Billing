import { Addresses } from '@/shared/addresses';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { prepareWriteContract, writeContract } from '@wagmi/core';

/**
 * Executes a ZK-proof submission transaction on the blockchain.
 * Includes improved error handling and validation for secure execution.
 */
export const executeTransaction = async (proof: any, publicSignals: Array<string>): Promise<TransactionReceipt> => {
  const abiPath = require('./abi/SimpleMultiplier.json');

  // Step 1: Input Validation - Ensuring proof data exists before calling the contract
  if (!proof || publicSignals.length === 0) {
    throw new Error("Validation Error: Proof or public signals are missing.");
  }

  try {
    // Step 2: Prepare the transaction data
    const config = await prepareWriteContract({
      address: Addresses.SIMPLE_MULTIPLIER_ADDR,
      abi: abiPath.abi,
      functionName: 'submitProof',
      args: [proof, publicSignals]
    });

    // Step 3: Execute the transaction
    const writeResult = await writeContract(config);

    // Step 4: Wait for the transaction block to be mined and return result
    console.log("Transaction sent! Waiting for confirmation...");
    const txResult = await writeResult.wait();
    
    return txResult;

  } catch (error: any) {
    // Step 5: Graceful Error Handling
    console.error("Blockchain Transaction Failed:", error);
    throw new Error(`Transaction Execution Failed: ${error.message || "Unknown Error"}`);
  }
}
