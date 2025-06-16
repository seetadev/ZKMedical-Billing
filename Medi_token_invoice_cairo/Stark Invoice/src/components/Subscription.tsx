import React, { useState, useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonText,
  IonItem,
  IonLabel,
  IonChip,
  IonToast,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
} from "@ionic/react";
import {
  star,
  checkmarkCircle,
  alertCircle,
  time,
  card,
  refresh,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import {
  useIsUserSubscribed,
  useGetSubscriptionDetails,
  useGetUserTokens,
} from "../hooks/useContractRead";
import { useSubscribe } from "../hooks/useContractWrite";

const Subscription: React.FC = () => {
  const { address, status } = useAccount();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");

  const {
    isSubscribed,
    isLoading: subscriptionLoading,
    refetchSubscription,
  } = useIsUserSubscribed({
    accountAddress: address as `0x${string}` | undefined,
  });

  const { subscriptionDetails, refetchSubscriptionDetails } =
    useGetSubscriptionDetails({
      accountAddress: address as `0x${string}` | undefined,
    });

  const {
    tokens,
    isLoading: tokensLoading,
    refetchTokens,
  } = useGetUserTokens({
    accountAddress: address as `0x${string}` | undefined,
  });

  const { subscribe, isPending: isSubscribing } = useSubscribe();

  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Debug logging
  useEffect(() => {
    console.log("Subscription Debug:", {
      address,
      status,
      isSubscribed,
      subscriptionDetails,
      tokens: tokens?.toString(),
      subscriptionLoading,
      tokensLoading,
    });
  }, [address, status, isSubscribed, subscriptionDetails, tokens, subscriptionLoading, tokensLoading]);

  // Calculate time remaining for subscription
  useEffect(() => {
    if (subscriptionDetails && subscriptionDetails[1]) {
      const endTime = Number(subscriptionDetails[1]) * 1000; // Convert to milliseconds
      const now = Date.now();

      if (endTime > now) {
        const diffMs = endTime - now;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days} days, ${hours} hours`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours} hours, ${minutes} minutes`);
        } else {
          setTimeRemaining(`${minutes} minutes`);
        }
      } else {
        setTimeRemaining("Expired");
      }
    }
  }, [subscriptionDetails]);

  const handleSubscribe = async () => {
    if (status !== "connected") {
      setToastMessage("Please connect your wallet first");
      setToastColor("warning");
      setShowToast(true);
      return;
    }

    // Check if user has enough tokens (10 tokens = 10 * 10^18 wei)
    const requiredTokens = BigInt("10000000000000000000"); // 10 tokens in wei
    if (tokens && tokens < requiredTokens) {
      setToastMessage(
        "Insufficient Medi tokens. You need at least 10 MEDI tokens to subscribe."
      );
      setToastColor("danger");
      setShowToast(true);
      return;
    }

    try {
      await subscribe();

      setToastMessage(
        "Subscription successful! You now have premium access for 365 days."
      );
      setToastColor("success");
      setShowToast(true);

      // Refresh data
      setTimeout(() => {
        refetchSubscription();
        refetchSubscriptionDetails();
        refetchTokens();
      }, 2000);
    } catch (error) {
      console.error("Subscription error:", error);
      setToastMessage(
        error instanceof Error ? error.message : "Subscription failed"
      );
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const formatTokens = (tokenAmount: bigint | undefined) => {
    if (!tokenAmount) return "0";
    // Convert from wei to tokens (divide by 10^18)
    const tokens = Number(tokenAmount) / Math.pow(10, 18);
    return tokens.toFixed(2);
  };

  const getSubscriptionProgress = () => {
    if (!subscriptionDetails || !subscriptionDetails[1]) return 0;

    const endTime = Number(subscriptionDetails[1]) * 1000;
    const startTime = endTime - 365 * 24 * 60 * 60 * 1000; // 365 days ago
    const now = Date.now();

    const elapsed = now - startTime;
    const total = endTime - startTime;

    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  if (!address) {
    return (
      <IonCard>
        <IonCardContent>
          <IonText color="medium">
            <p style={{ textAlign: "center", padding: "20px" }}>
              <IonIcon icon={alertCircle} size="large" />
              <br />
              Connect your wallet to view subscription details
            </p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={star} /> Premium Subscription
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                {/* Subscription Status */}
                <IonItem>
                  <IonIcon
                    icon={isSubscribed ? checkmarkCircle : alertCircle}
                    color={isSubscribed ? "success" : "warning"}
                    slot="start"
                  />
                  <IonLabel>
                    <h3>Status</h3>
                    <IonChip color={isSubscribed ? "success" : "warning"}>
                      {subscriptionLoading
                        ? "Loading..."
                        : isSubscribed
                        ? "Active"
                        : "Inactive"}
                    </IonChip>
                  </IonLabel>
                </IonItem>

                {/* Token Balance */}
                <IonItem>
                  <IonIcon icon={card} color="primary" slot="start" />
                  <IonLabel>
                    <h3>MEDI Token Balance</h3>
                    <p>
                      {tokensLoading
                        ? "Loading..."
                        : `${formatTokens(tokens)} MEDI`}
                    </p>
                  </IonLabel>
                </IonItem>

                {/* Time Remaining */}
                {isSubscribed && (
                  <IonItem>
                    <IonIcon icon={time} color="medium" slot="start" />
                    <IonLabel>
                      <h3>Time Remaining</h3>
                      <p>{timeRemaining}</p>
                    </IonLabel>
                  </IonItem>
                )}
              </IonCol>

              <IonCol size="12" sizeMd="6">
                {/* Subscription Progress */}
                {isSubscribed && (
                  <div style={{ padding: "16px" }}>
                    <IonText>
                      <h4>Subscription Progress</h4>
                    </IonText>
                    <IonProgressBar
                      value={getSubscriptionProgress() / 100}
                      color="primary"
                    />
                    <IonText color="medium">
                      <p style={{ fontSize: "0.8em", marginTop: "8px" }}>
                        {(100 - getSubscriptionProgress()).toFixed(1)}%
                        remaining
                      </p>
                    </IonText>
                  </div>
                )}

                {/* Subscription Benefits */}
                <div style={{ padding: "16px" }}>
                  <IonText>
                    <h4>Premium Benefits:</h4>
                    <ul
                      style={{
                        fontSize: "0.9em",
                        color: "var(--ion-color-medium)",
                      }}
                    >
                      <li>Unlimited file uploads</li>
                      <li>Advanced file organization</li>
                      <li>Priority support</li>
                      <li>Enhanced security features</li>
                      <li>365 days of premium access</li>
                    </ul>
                  </IonText>
                </div>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                {!isSubscribed ? (
                  <div>
                    <IonText>
                      <h3 style={{ textAlign: "center", marginBottom: "16px" }}>
                        Subscribe for Premium Access
                      </h3>
                      <p
                        style={{
                          textAlign: "center",
                          color: "var(--ion-color-medium)",
                        }}
                      >
                        Cost: 10 MEDI Tokens for 365 days
                      </p>
                    </IonText>

                    <IonButton
                      expand="block"
                      onClick={handleSubscribe}
                      disabled={isSubscribing || status !== "connected"}
                      color="primary"
                    >
                      <IonIcon icon={star} slot="start" />
                      {isSubscribing ? "Subscribing..." : "Subscribe Now"}
                    </IonButton>

                    {tokens && tokens < BigInt("10000000000000000000") && (
                      <IonText color="danger">
                        <p
                          style={{
                            textAlign: "center",
                            fontSize: "0.8em",
                            marginTop: "8px",
                          }}
                        >
                          Insufficient tokens. You need 10 MEDI tokens to
                          subscribe.
                        </p>
                      </IonText>
                    )}
                  </div>
                ) : (
                  <div>
                    <IonText color="success">
                      <h3 style={{ textAlign: "center", marginBottom: "16px" }}>
                        <IonIcon icon={checkmarkCircle} /> Active Subscription
                      </h3>
                      <p style={{ textAlign: "center" }}>
                        You have premium access until your subscription expires.
                      </p>
                    </IonText>

                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => {
                        refetchSubscription();
                        refetchSubscriptionDetails();
                        refetchTokens();
                      }}
                    >
                      <IonIcon icon={refresh} slot="start" />
                      Refresh Status
                    </IonButton>
                  </div>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>

      {/* Loading overlay */}
      <IonLoading isOpen={isSubscribing} message="Processing subscription..." />

      {/* Toast notification */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        color={toastColor}
        icon={toastColor === "success" ? checkmarkCircle : alertCircle}
      />
    </>
  );
};

export default Subscription;
