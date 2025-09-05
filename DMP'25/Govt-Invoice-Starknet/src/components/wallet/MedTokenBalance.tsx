import React from "react";
import {
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import { cash, cashOutline, refresh } from "ionicons/icons";
import { useAccount, useReadContract } from "@starknet-react/core";
import { MED_TOKEN_ABI } from "../../abis/medToken";
import { MED_TOKEN_CONTRACT_ADDRESS } from "../../abis/constants";
import { type Abi } from "starknet";
import { useTheme } from "../../contexts/ThemeContext";

const MedTokenBalance: React.FC = () => {
  const { address, status } = useAccount();
  const isConnected = status === "connected" && address;
  const { isDarkMode } = useTheme();

  const {
    data: balance,
    isLoading,
    isError,
    refetch,
  } = useReadContract({
    functionName: "balance_of",
    args: address ? [address] : [],
    abi: MED_TOKEN_ABI as Abi,
    address: MED_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    watch: true,
    refetchInterval: 10000,
    enabled: !!isConnected && !!address,
  });

  const formatBalance = (balance: bigint) => {
    try {
      // Convert from wei to tokens (assuming 18 decimals)
      const divisor = BigInt(10 ** 18);
      const tokenBalance = Number(balance) / Number(divisor);

      if (tokenBalance < 0.01) {
        return "0.00";
      } else if (tokenBalance < 1000) {
        return tokenBalance.toFixed(2);
      } else if (tokenBalance < 1000000) {
        return `${(tokenBalance / 1000).toFixed(1)}K`;
      } else {
        return `${(tokenBalance / 1000000).toFixed(1)}M`;
      }
    } catch (error) {
      console.error("Error formatting balance:", error);
      return "0.00";
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (!isConnected) {
    return (
      <IonButton fill="clear" disabled>
        <IonIcon icon={cashOutline} />
      </IonButton>
    );
  }

  if (isLoading) {
    return (
      <IonChip color="medium" outline className="med-token-balance">
        <IonSpinner name="dots" />
        <IonLabel color="medium">Loading...</IonLabel>
      </IonChip>
    );
  }

  if (isError || !balance) {
    return (
      <IonChip
        color="danger"
        outline
        className="med-token-balance"
        onClick={handleRefresh}
        style={{ cursor: "pointer" }}
      >
        <IonIcon icon={refresh} color="danger" />
        <IonLabel color="danger">Refresh</IonLabel>
      </IonChip>
    );
  }

  return (
    <IonChip
      color="warning"
      outline
      className="med-token-balance"
      onClick={handleRefresh}
      style={{
        cursor: "pointer",
        background: "linear-gradient(135deg, #ffb74d, #ff9800)",
        border: "2px solid #ff9800",
        color: "#fff",
      }}
      title="Click to refresh balance"
    >
      <IonIcon icon={cash} style={{ color: "#fff" }} />
      <IonLabel style={{ color: "#fff", fontWeight: "600" }}>
        {formatBalance(balance as bigint)} MED
      </IonLabel>
    </IonChip>
  );
};

export default MedTokenBalance;
