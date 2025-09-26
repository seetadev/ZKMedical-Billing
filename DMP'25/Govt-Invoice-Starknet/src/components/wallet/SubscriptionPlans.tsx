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
  const [currentStep, setCurrentStep] = useState<"idle" | "approving" | "approved" | "purchasing" | "completed">("idle");
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);

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
    setCurrentStep("idle");
    setApprovalTxHash(null);

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

      // Step 1: Check allowance and approve if necessary
      if (!allowance || allowance < cost) {
        setCurrentStep("approving");
        setToastMessage("Step 1/2: Approving token allowance...");
        setShowToast(true);

        try {
          const approvalResult = await approveTokens(cost);
          setApprovalTxHash(approvalResult.transaction_hash);
          setCurrentStep("approved");
          setToastMessage("Step 1/2: Tokens approved! Waiting for confirmation...");
          setShowToast(true);

          // Wait for the approval transaction to be confirmed
          // Adding a delay to ensure the approval is processed on-chain
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Refetch allowance to confirm approval
          await refetchAllowance();
          
          // Wait a bit more to ensure the blockchain state is updated
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (approvalError) {
          console.error("Approval failed:", approvalError);
          setToastMessage("Token approval failed. Please try again.");
          setShowToast(true);
          setSelectedPlan(null);
          setCurrentStep("idle");
          return;
        }
      }

      // Step 2: Subscribe to plan
      setCurrentStep("purchasing");
      setToastMessage("Step 2/2: Purchasing plan...");
      setShowToast(true);

      try {
        console.log("Attempting to subscribe to plan:", planId);
        await subscribeToPlan(planId);
        
        setCurrentStep("completed");
        setToastMessage("Plan purchased successfully!");
        setShowToast(true);

        // Refresh data
        refetchFileLimits();
        refetchAllowance();
        
      } catch (subscriptionError) {
        console.error("Subscription failed:", subscriptionError);
        
        // Check if it's specifically an allowance error
        if (subscriptionError.message?.includes("insufficient allowance")) {
          setToastMessage("Allowance still insufficient. Please wait a moment and try again.");
        } else {
          setToastMessage("Plan purchase failed. Please try again.");
        }
        setShowToast(true);
        setCurrentStep("idle");
        setSelectedPlan(null);
        return;
      }

    } catch (error) {
      console.error("Error purchasing plan:", error);
      setToastMessage(error.message || "Failed to purchase plan");
      setShowToast(true);
      setCurrentStep("idle");
    } finally {
      // Only reset if not in purchasing step
      if (currentStep !== "purchasing") {
        setSelectedPlan(null);
      }
    }
  };

  // Manual purchase function for when the user wants to retry the second step
  const handleManualPurchase = async (planId: number) => {
    if (currentStep !== "approved") {
      setToastMessage("Please complete token approval first");
      setShowToast(true);
      return;
    }

    setCurrentStep("purchasing");
    setToastMessage("Step 2/2: Purchasing plan...");
    setShowToast(true);

    try {
      console.log("Manual purchase attempt for plan:", planId);
      await subscribeToPlan(planId);
      
      setCurrentStep("completed");
      setToastMessage("Plan purchased successfully!");
      setShowToast(true);

      // Refresh data
      refetchFileLimits();
      refetchAllowance();
      
      // Reset after success
      setTimeout(() => {
        setSelectedPlan(null);
        setCurrentStep("idle");
        setApprovalTxHash(null);
      }, 2000);
      
    } catch (subscriptionError) {
      console.error("Manual subscription failed:", subscriptionError);
      setToastMessage("Purchase failed. Please ensure approval is confirmed and try again.");
      setShowToast(true);
      setCurrentStep("approved"); // Go back to approved state
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

            {/* Purchase Instructions */}
            <IonCard color="light">
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: "16px" }}>
                  📋 Purchase Process
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ fontSize: "14px" }}>
                  <p><strong>Step 1:</strong> Approve tokens for spending</p>
                  <p><strong>Step 2:</strong> Complete the purchase</p>
                  <p style={{ marginTop: "12px", fontStyle: "italic" }}>
                    ⚠️ If Step 2 fails, use the "Complete Purchase Now" button after approval
                  </p>
                </div>
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
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <IonSpinner />
                                {selectedPlan === plan.plan_id && (
                                  <span>
                                    {currentStep === "approving" && "Approving Tokens..."}
                                    {currentStep === "approved" && "Waiting for Confirmation..."}
                                    {currentStep === "purchasing" && "Purchasing Plan..."}
                                    {currentStep === "completed" && "Purchase Complete!"}
                                    {currentStep === "idle" && "Processing..."}
                                  </span>
                                )}
                              </div>
                            ) : (
                              `Purchase Plan`
                            )}
                          </IonButton>

                          {/* Manual purchase button for approved state */}
                          {selectedPlan === plan.plan_id && currentStep === "approved" && (
                            <IonButton
                              expand="block"
                              color="secondary"
                              onClick={() => handleManualPurchase(plan.plan_id)}
                              style={{ marginTop: "8px" }}
                            >
                              Complete Purchase Now
                            </IonButton>
                          )}

                          {/* Show approval transaction hash if available */}
                          {selectedPlan === plan.plan_id && approvalTxHash && currentStep === "approved" && (
                            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--ion-color-medium)" }}>
                              <p>Approval TX: {approvalTxHash.slice(0, 10)}...{approvalTxHash.slice(-6)}</p>
                              <p>You can now complete the purchase manually</p>
                            </div>
                          )}
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
        duration={currentStep === "approving" || currentStep === "approved" ? 6000 : 3000}
        position="top"
        color={
          toastMessage.includes("successfully") || toastMessage.includes("Complete!") 
            ? "success" 
            : toastMessage.includes("failed") || toastMessage.includes("Insufficient")
            ? "danger"
            : "primary"
        }
      />
    </>
  );
};

export default SubscriptionPlans;
