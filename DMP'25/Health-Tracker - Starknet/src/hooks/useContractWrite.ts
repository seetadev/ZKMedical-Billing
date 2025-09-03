import { useAccount, useContract } from "@starknet-react/core";
import { type Abi, byteArray, CallData, uint256 } from "starknet";
import { useState } from "react";
import { MED_INVOICE_ABI } from "../abis/medInvoiceAbi";
import { MED_TOKEN_ABI } from "../abis/medToken";
import {
  MED_INVOICE_CONTRACT_ADDRESS,
  MED_TOKEN_CONTRACT_ADDRESS,
} from "../abis/constants";

const CONTRACT_ADDRESS = MED_INVOICE_CONTRACT_ADDRESS as `0x${string}`;
const TOKEN_CONTRACT_ADDRESS = MED_TOKEN_CONTRACT_ADDRESS as `0x${string}`;

export function useContractInstance() {
  const { contract } = useContract({
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
  });

  return contract;
}

export function useTokenContractInstance() {
  const { contract } = useContract({
    abi: MED_TOKEN_ABI as Abi,
    address: TOKEN_CONTRACT_ADDRESS,
  });

  return contract;
}

/**
 * Hook to save file to blockchain
 */
export function useSaveFile() {
  const contract = useContractInstance();
  const { account, status, isConnected } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ transactionHash: string } | null>(null);

  const saveFile = async (fileName: string, ipfsHash: string) => {
    if (!contract) return;
    // Check connection status first
    console.log("Wallet connection status:", {
      status,
      isConnected,
      account,
    });

    if (status !== "connected" || !isConnected || !account) {
      throw new Error("Wallet account not connected");
    }

    if (!account) {
      throw new Error("Wallet account not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      console.log("Saving file with name:", fileName, "IPFS hash:", ipfsHash);

      // Convert strings to ByteArray format
      const fileNameByteArray = byteArray.byteArrayFromString(fileName);
      const ipfsHashByteArray = byteArray.byteArrayFromString(ipfsHash);

      // Send transaction
      const response = await account.execute({
        contractAddress: contract.address,
        entrypoint: "save_file",
        calldata: CallData.compile([fileNameByteArray, ipfsHashByteArray]),
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
 * Hook to subscribe to the service (deprecated - keeping for compatibility)
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

/**
 * Hook to approve tokens for the MedInvoice contract
 */
export function useApproveTokens() {
  const tokenContract = useTokenContractInstance();
  const { account } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ transactionHash: string } | null>(null);

  const approveTokens = async (amount: bigint) => {
    if (!tokenContract) {
      throw new Error("Token contract not available");
    }
    if (!account) {
      console.log("Account not connected, cannot approve tokens", account);
      throw new Error("Wallet account not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      console.log("Approving tokens:", amount.toString());
      console.log("Account:", account);
      console.log("Token contract:", tokenContract.address);

      // Convert bigint to proper u256 format for Starknet
      const amountU256 = uint256.bnToUint256(amount);

      // Send approval transaction
      const response = await account.execute({
        contractAddress: tokenContract.address,
        entrypoint: "approve",
        calldata: CallData.compile([CONTRACT_ADDRESS, amountU256]),
      });

      console.log("Approval transaction response:", response);
      setData({ transactionHash: response.transaction_hash });
      return response;
    } catch (err: unknown) {
      console.error("Error approving tokens:", err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error(
        "An unexpected error occurred while approving tokens"
      );
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    approveTokens,
    data,
    isPending,
    isError: !!error,
    error,
  };
}

/**
 * Hook to subscribe to a specific plan
 */
export function useSubscribeToPlan() {
  const contract = useContractInstance();
  const { account } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ transactionHash: string } | null>(null);

  const subscribeToPlan = async (planId: number) => {
    if (!contract) {
      throw new Error("Invoice contract not available");
    }
    if (!account) {
      throw new Error("Wallet account not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      console.log("Subscribing to plan:", planId);
      console.log("Account:", account);
      console.log("Contract:", contract.address);

      // Send transaction
      const response = await account.execute({
        contractAddress: contract.address,
        entrypoint: "subscribe_to_plan",
        calldata: [Number(planId)],
      });

      console.log("Subscribe to plan transaction response:", response);

      const result = { transactionHash: response.transaction_hash };
      setData(result);
      return result;
    } catch (err: unknown) {
      console.error("Error subscribing to plan:", err);
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error(
        "An unexpected error occurred while subscribing to plan"
      );
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    subscribeToPlan,
    data,
    isPending,
    isError: !!error,
    error,
  };
}
