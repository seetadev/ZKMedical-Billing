import { useReadContract } from "@starknet-react/core";
import { useCallback } from "react";
import { type Abi } from "starknet";
import { MED_INVOICE_ABI } from "../abis/medInvoiceAbi";
import { MED_TOKEN_ABI } from "../abis/medToken";
import {
  MED_INVOICE_CONTRACT_ADDRESS,
  MED_TOKEN_CONTRACT_ADDRESS,
} from "../abis/constants";

const CONTRACT_ADDRESS = MED_INVOICE_CONTRACT_ADDRESS as `0x${string}`;
const TOKEN_CONTRACT_ADDRESS = MED_TOKEN_CONTRACT_ADDRESS as `0x${string}`;

interface UseContractReadProps {
  accountAddress: `0x${string}` | undefined;
}

// Interface for FileRecord from contract
export interface FileRecord {
  file_name: string;
  ipfs_cid: string;
  timestamp: bigint;
  owner: string;
  exists: boolean;
}

/**
 * Hook to get user's files from the contract
 */
export function useGetUserFiles({ accountAddress }: UseContractReadProps) {
  const {
    data: filesData,
    refetch: filesRefetch,
    isError: filesIsError,
    isLoading: filesIsLoading,
    error: filesError,
  } = useReadContract({
    functionName: "get_files",
    args: accountAddress ? [accountAddress] : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 5000,
    enabled: !!accountAddress,
  });

  const refreshFiles = useCallback(() => {
    console.log("Manually refreshing files data");
    filesRefetch();
  }, [filesRefetch]);

  return {
    files: filesData as FileRecord[] | undefined,
    refetchFiles: refreshFiles,
    isError: filesIsError,
    isLoading: filesIsLoading,
    error: filesError,
  };
}

/**
 * Hook to get user's token balance
 */
export function useGetUserTokens({ accountAddress }: UseContractReadProps) {
  const {
    data: tokensData,
    refetch: tokensRefetch,
    isError: tokensIsError,
    isLoading: tokensIsLoading,
    error: tokensError,
  } = useReadContract({
    functionName: "get_user_tokens",
    args: accountAddress ? [accountAddress] : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 10000,
    enabled: !!accountAddress,
  });

  return {
    tokens: tokensData as bigint | undefined,
    refetchTokens: tokensRefetch,
    isError: tokensIsError,
    isLoading: tokensIsLoading,
    error: tokensError,
  };
}
/**
 * Hook to check if user is subscribed
 */
export function useIsUserSubscribed({ accountAddress }: UseContractReadProps) {
  const {
    data: subscribedData,
    refetch: subscribedRefetch,
    isError: subscribedIsError,
    isLoading: subscribedIsLoading,
    error: subscribedError,
  } = useReadContract({
    functionName: "is_subscribed",
    args: accountAddress ? [accountAddress] : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 10000,
    enabled: !!accountAddress,
  });

  return {
    isSubscribed: subscribedData as boolean | undefined,
    refetchSubscription: subscribedRefetch,
    isError: subscribedIsError,
    isLoading: subscribedIsLoading,
    error: subscribedError,
  };
}

/**
 * Hook to get user's subscription details
 */
export function useGetSubscriptionDetails({
  accountAddress,
}: UseContractReadProps) {
  const {
    data: subscriptionData,
    refetch: subscriptionRefetch,
    isError: subscriptionIsError,
    isLoading: subscriptionIsLoading,
    error: subscriptionError,
  } = useReadContract({
    functionName: "get_subscription_details",
    args: accountAddress ? [accountAddress] : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 10000,
    enabled: !!accountAddress,
  });

  return {
    subscriptionDetails: subscriptionData as [boolean, bigint] | undefined,
    refetchSubscriptionDetails: subscriptionRefetch,
    isError: subscriptionIsError,
    isLoading: subscriptionIsLoading,
    error: subscriptionError,
  };
}

/**
 * Hook to get subscription end date for a specific user
 */
export function useGetSubscriptionEndDate({
  accountAddress,
  targetAddress,
}: UseContractReadProps & { targetAddress?: `0x${string}` }) {
  const {
    data: endDateData,
    refetch: endDateRefetch,
    isError: endDateIsError,
    isLoading: endDateIsLoading,
    error: endDateError,
  } = useReadContract({
    functionName: "get_subscription_end_date",
    args: targetAddress
      ? [targetAddress]
      : accountAddress
      ? [accountAddress]
      : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: false,
    enabled: !!(accountAddress && (targetAddress || accountAddress)),
  });

  return {
    endDate: endDateData as bigint | undefined,
    refetchEndDate: endDateRefetch,
    isError: endDateIsError,
    isLoading: endDateIsLoading,
    error: endDateError,
  };
}

/**
 * Hook to get token allowance for the MedInvoice contract
 */
export function useGetTokenAllowance({
  owner,
  spender = CONTRACT_ADDRESS,
}: {
  owner: `0x${string}` | undefined;
  spender?: `0x${string}`;
}) {
  const {
    data: allowanceData,
    refetch: allowanceRefetch,
    isError: allowanceIsError,
    isLoading: allowanceIsLoading,
    error: allowanceError,
  } = useReadContract({
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : [],
    abi: MED_TOKEN_ABI as Abi,
    address: TOKEN_CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 10000,
    enabled: !!(owner && spender),
  });

  return {
    allowance: allowanceData as bigint | undefined,
    refetchAllowance: allowanceRefetch,
    isError: allowanceIsError,
    isLoading: allowanceIsLoading,
    error: allowanceError,
  };
}
