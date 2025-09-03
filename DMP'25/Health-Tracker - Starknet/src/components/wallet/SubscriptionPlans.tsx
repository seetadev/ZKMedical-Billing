import React, { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonSpinner,
  IonText,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonChip,
} from "@ionic/react";
import {
  checkmarkCircle,
  close,
  cube,
  documentText,
  wallet,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import {
  useGetAllPlans,
  useGetUserFileLimits,
  useGetUserTokens,
  useGetTokenAllowance,
} from "../../hooks/useContractRead";
import {
  useSubscribeToPlan,
  useApproveTokens,
} from "../../hooks/useContractWrite";
import { useTheme } from "../../contexts/ThemeContext";
import WalletConnection from "./WalletConnection";

interface SubscriptionPlansProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  isOpen,
  onDidDismiss,
}) => {
  const { isDarkMode } = useTheme();
  const { address } = useAccount();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  // Contract hooks
  const { plans, isLoading: plansLoading } = useGetAllPlans();
  const { fileLimits, refetchFileLimits } = useGetUserFileLimits({
    accountAddress: address as `0x${string}` | undefined,
  });
  const { tokens } = useGetUserTokens({
    accountAddress: address as `0x${string}` | undefined,
  });
  const { allowance, refetchAllowance } = useGetTokenAllowance({
    owner: address as `0x${string}` | undefined,
  });

  // Write hooks
  const { subscribeToPlan, isPending: isSubscribing } = useSubscribeToPlan();
  const { approveTokens, isPending: isApproving } = useApproveTokens();

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (!amount) return "0";
    // Convert from wei (18 decimals) to readable format
    const readable = Number(amount) / Math.pow(10, 18);
    return readable.toFixed(2);
  };

  const handlePlanPurchase = async (planId: number, cost: bigint) => {
    console.log("Wallet connection status:", {
      address,
    });

    if (!address) {
      setToastMessage("Please connect your wallet to purchase storage plans");
      setShowToast(true);
      return;
    }

    setSelectedPlan(planId);

    try {
      // Additional validation

      if (!plans || plans.length === 0) {
        setToastMessage("Plans not loaded yet, please wait...");
        setShowToast(true);
        setSelectedPlan(null);
        return;
      }

      // Check if user has enough tokens
      if (!tokens || tokens < cost) {
        setToastMessage("Insufficient PPT tokens");
        setShowToast(true);
        setSelectedPlan(null);
        return;
      }

      // Check allowance and approve if necessary
      if (!allowance || allowance < cost) {
        setToastMessage("Approving tokens...");
        setShowToast(true);

        await approveTokens(cost);

        // Refetch allowance
        await refetchAllowance();

        setToastMessage("Tokens approved successfully");
        setShowToast(true);
      }

      // Subscribe to plan
      setToastMessage("Purchasing plan...");
      setShowToast(true);
      console.log("trying subs");
      await subscribeToPlan(planId);
      console.log("Plan subscribed successfully");
      setToastMessage("Plan purchased successfully!");
      setShowToast(true);

      // Refresh data
      refetchFileLimits();
      refetchAllowance();
    } catch (error) {
      console.error("Error purchasing plan:", error);
      setToastMessage(error.message || "Failed to purchase plan");
      setShowToast(true);
    } finally {
      setSelectedPlan(null);
    }
  };

  const getPlanColor = (planId: number) => {
    switch (planId) {
      case 1:
        return "success";
      case 2:
        return "warning";
      case 3:
        return "tertiary";
      default:
        return "medium";
    }
  };

  const isPlanLoading = (planId: number) => {
    return selectedPlan === planId && (isSubscribing || isApproving);
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onDidDismiss}
        className={isDarkMode ? "dark-theme" : ""}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Subscription Plans</IonTitle>
            <IonButton slot="end" fill="clear" onClick={onDidDismiss}>
              <IonIcon icon={close} />
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <div style={{ padding: "16px" }}>
            {/* Current Status */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Current Status</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="12">
                      <IonText>
                        <h3>Wallet Status</h3>
                        <p>
                          {address ? (
                            <IonChip color="success">
                              <IonIcon icon={checkmarkCircle} />
                              <IonLabel>
                                Connected: {address.slice(0, 8)}...
                              </IonLabel>
                            </IonChip>
                          ) : (
                            <div style={{ marginTop: "8px" }}>
                              <WalletConnection />
                            </div>
                          )}
                        </p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol size="6">
                      <IonText>
                        <h3>PPT Balance</h3>
                        <p>{formatTokenAmount(tokens)} PPT</p>
                      </IonText>
                    </IonCol>
                    <IonCol size="6">
                      <IonText>
                        <h3>File Storage</h3>
                        <p>
                          {fileLimits
                            ? `${fileLimits[0]} / ${fileLimits[1]} files used`
                            : "Loading..."}
                        </p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>

            {/* Plans */}
            <IonText>
              <h2>Available Plans</h2>
              <p>Purchase file storage with PPT tokens</p>
            </IonText>

            {plansLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <IonSpinner />
                <p>Loading plans...</p>
              </div>
            ) : (
              <IonGrid>
                <IonRow
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    justifyContent: "center",
                  }}
                >
                  {plans?.map((plan) => (
                    <IonCol
                      size="12"
                      sizeMd="4"
                      key={plan.plan_id}
                      style={{
                        minWidth: "280px",
                        flex: "1 1 auto",
                        maxWidth: "350px",
                      }}
                    >
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle color={getPlanColor(plan.plan_id)}>
                            {plan.plan_name}
                          </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <IonList>
                            <IonItem>
                              <IonIcon icon={documentText} slot="start" />
                              <IonLabel>
                                <h3>{Number(plan.files_allowed)} Files</h3>
                                <p>Additional file storage</p>
                              </IonLabel>
                            </IonItem>
                            <IonItem>
                              <IonIcon icon={cube} slot="start" />
                              <IonLabel>
                                <h3>{formatTokenAmount(plan.cost)} PPT</h3>
                                <p>One-time purchase</p>
                              </IonLabel>
                            </IonItem>
                          </IonList>

                          <IonButton
                            expand="block"
                            color={getPlanColor(plan.plan_id)}
                            onClick={() =>
                              handlePlanPurchase(plan.plan_id, plan.cost)
                            }
                            disabled={!address || isPlanLoading(plan.plan_id)}
                            style={{ marginTop: "16px" }}
                          >
                            {isPlanLoading(plan.plan_id) ? (
                              <IonSpinner />
                            ) : (
                              `Purchase Plan`
                            )}
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}

            {!address && (
              <IonCard>
                <IonCardContent>
                  <IonText>
                    <h3>Connect Wallet</h3>
                    <p>
                      Please connect your Starknet wallet to purchase storage
                      plans.
                    </p>
                  </IonText>
                  <div style={{ marginTop: "16px" }}>
                    <WalletConnection />
                  </div>
                </IonCardContent>
              </IonCard>
            )}
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="top"
      />
    </>
  );
};

export default SubscriptionPlans;
