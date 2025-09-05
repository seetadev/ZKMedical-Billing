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

// Interface for SubscriptionPlan from contract
export interface SubscriptionPlan {
  plan_id: number;
  cost: bigint;
  files_allowed: bigint;
  plan_name: string;
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
 * Hook to check if user is subscribed (deprecated - keeping for compatibility)
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
 * Hook to get user's file limits (files used vs files allowed)
 */
export function useGetUserFileLimits({ accountAddress }: UseContractReadProps) {
  const {
    data: fileLimitsData,
    refetch: fileLimitsRefetch,
    isError: fileLimitsIsError,
    isLoading: fileLimitsIsLoading,
    error: fileLimitsError,
  } = useReadContract({
    functionName: "get_user_file_limits",
    args: accountAddress ? [accountAddress] : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 5000,
    enabled: !!accountAddress,
  });

  return {
    fileLimits: fileLimitsData as [bigint, bigint] | undefined, // [files_used, files_allowed]
    refetchFileLimits: fileLimitsRefetch,
    isError: fileLimitsIsError,
    isLoading: fileLimitsIsLoading,
    error: fileLimitsError,
  };
}

/**
 * Hook to get user's subscription summary
 */
export function useGetUserSubscriptionSummary({
  accountAddress,
}: UseContractReadProps) {
  const {
    data: summaryData,
    refetch: summaryRefetch,
    isError: summaryIsError,
    isLoading: summaryIsLoading,
    error: summaryError,
  } = useReadContract({
    functionName: "get_user_subscription_summary",
    args: accountAddress ? [accountAddress] : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 5000,
    enabled: !!accountAddress,
  });

  return {
    subscriptionSummary: summaryData as [bigint, bigint, number] | undefined, // [files_used, files_allowed, current_plan]
    refetchSummary: summaryRefetch,
    isError: summaryIsError,
    isLoading: summaryIsLoading,
    error: summaryError,
  };
}

/**
 * Hook to get all available subscription plans
 */
export function useGetAllPlans() {
  const {
    data: plansData,
    refetch: plansRefetch,
    isError: plansIsError,
    isLoading: plansIsLoading,
    error: plansError,
  } = useReadContract({
    functionName: "get_all_plans",
    args: [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: false,
    enabled: true,
  });

  return {
    plans: plansData as SubscriptionPlan[] | undefined,
    refetchPlans: plansRefetch,
    isError: plansIsError,
    isLoading: plansIsLoading,
    error: plansError,
  };
}

/**
 * Hook to get a specific subscription plan
 */
export function useGetSubscriptionPlan(planId: number) {
  const {
    data: planData,
    refetch: planRefetch,
    isError: planIsError,
    isLoading: planIsLoading,
    error: planError,
  } = useReadContract({
    functionName: "get_subscription_plan",
    args: [planId],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: false,
    enabled: planId > 0,
  });

  return {
    plan: planData as SubscriptionPlan | undefined,
    refetchPlan: planRefetch,
    isError: planIsError,
    isLoading: planIsLoading,
    error: planError,
  };
}

/**
 * Hook to get user's plan purchases for a specific plan
 */
export function useGetUserPlanPurchases({
  accountAddress,
  planId,
}: UseContractReadProps & { planId: number }) {
  const {
    data: purchasesData,
    refetch: purchasesRefetch,
    isError: purchasesIsError,
    isLoading: purchasesIsLoading,
    error: purchasesError,
  } = useReadContract({
    functionName: "get_user_plan_purchases",
    args: accountAddress && planId ? [accountAddress, planId] : [],
    abi: MED_INVOICE_ABI as Abi,
    address: CONTRACT_ADDRESS,
    watch: true,
    refetchInterval: 10000,
    enabled: !!(accountAddress && planId),
  });

  return {
    purchases: purchasesData as bigint | undefined,
    refetchPurchases: purchasesRefetch,
    isError: purchasesIsError,
    isLoading: purchasesIsLoading,
    error: purchasesError,
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
