import { useAccount, useContract } from "@starknet-react/core";
import { type Abi } from "starknet";
import { useState } from "react";
import { MED_INVOICE_ABI } from "../abis/medInvoiceAbi";

const CONTRACT_ADDRESS = import.meta.env
  .VITE_MED_INVOICE_CONTRACT_ADDRESS as `0x${string}`;

export function useContractInstance() {
  const { contract } = useContract({
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
  });

  return contract;
}

/**
 * Hook to save file to blockchain
 */
export function useSaveFile() {
  const contract = useContractInstance();
  const { account } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ transactionHash: string } | null>(null);

  const saveFile = async (ipfsHash: string) => {
    if (!contract) return;
    if (!account) {
      throw new Error("Wallet account not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      console.log("Saving file with IPFS hash:", ipfsHash);

      // Send transaction
      const response = await account.execute({
        contractAddress: contract.address,
        entrypoint: "save_file",
        calldata: [ipfsHash],
      });

      console.log("Transaction response:", response);
      setData({ transactionHash: response.transaction_hash });
      return response;
    } catch (err: unknown) {
      console.error("Error saving file:", err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error("An unexpected error occurred while saving file");
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    saveFile,
    data,
    isPending,
    isError: !!error,
    error,
  };
}

/**
 * Hook to subscribe to the service
 */
export function useSubscribe() {
  const contract = useContractInstance();
  const { account } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ transactionHash: string } | null>(null);

  const subscribe = async () => {
    if (!contract) return;
    if (!account) {
      throw new Error("Wallet account not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      console.log("Subscribing to service...");

      // Send transaction
      const response = await account.execute({
        contractAddress: contract.address,
        entrypoint: "subscribe",
        calldata: [],
      });

      console.log("Subscription transaction response:", response);
      setData({ transactionHash: response.transaction_hash });
      return response;
    } catch (err: unknown) {
      console.error("Error subscribing:", err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error("An unexpected error occurred while subscribing");
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    subscribe,
    data,
    isPending,
    isError: !!error,
    error,
  };
}

/**
 * Hook to withdraw tokens (owner only)
 */
export function useWithdrawTokens() {
  const contract = useContractInstance();
  const { account } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ transactionHash: string } | null>(null);

  const withdrawTokens = async (amount: string) => {
    if (!contract) return;
    if (!account) {
      throw new Error("Wallet account not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      console.log("Withdrawing tokens:", amount);

      // Convert amount to proper format
      const amountBigInt = BigInt(amount);

      // Send transaction
      const response = await account.execute({
        contractAddress: contract.address,
        entrypoint: "withdraw_tokens",
        calldata: [amountBigInt.toString()],
      });

      console.log("Withdrawal transaction response:", response);
      setData({ transactionHash: response.transaction_hash });
      return response;
    } catch (err: unknown) {
      console.error("Error withdrawing tokens:", err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error(
        "An unexpected error occurred while withdrawing tokens"
      );
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    withdrawTokens,
    data,
    isPending,
    isError: !!error,
    error,
  };
}
