import React, { useState, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonToast,
  IonToggle,
} from "@ionic/react";
import {
  settings,
  informationCircle,
  arrowBack,
  flash,
  wifiOutline,
  cloudOfflineOutline,
  downloadOutline,
  wallet,
  shield,
  card,
} from "ionicons/icons";
import Menu from "../components/Menu/Menu";
import { useTheme } from "../contexts/ThemeContext";
import { useHistory } from "react-router-dom";
import { usePWA } from "../hooks/usePWA";
import { resetUserOnboarding } from "../utils/helper";
import { getAutoSaveEnabled, setAutoSaveEnabled } from "../utils/settings";
import WalletConnection from "../components/wallet/WalletConnection";
import SubscriptionPlans from "../components/wallet/SubscriptionPlans";
import MedTokenBalance from "../components/wallet/MedTokenBalance";
import { useAccount } from "@starknet-react/core";
import {
  useGetUserFiles,
  useGetUserSubscriptionSummary,
} from "../hooks/useContractRead";
import "./SettingsPage.css";

const SettingsPage: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);
  const [globalAutoSaveEnabled, setGlobalAutoSaveEnabled] = useState(
    getAutoSaveEnabled()
  );
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  // Blockchain-related state
  const { address, status } = useAccount();
  const { files } = useGetUserFiles({
    accountAddress: address as `0x${string}`,
  });
  const { subscriptionSummary } = useGetUserSubscriptionSummary({
    accountAddress: address as `0x${string}`,
  });
  const isConnected = status === "connected" && address;

  const handleNotificationPermission = async () => {
    try {
      // Push notifications disabled in local-only mode
      setToastMessage("Push notifications are disabled in local-only mode");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to enable notifications");
      setShowToast(true);
    }
  };

  const handleResetOnboarding = () => {
    resetUserOnboarding();
    setShowResetToast(true);
  };

  const handleAutoSaveToggle = (enabled: boolean) => {
    setGlobalAutoSaveEnabled(enabled);
    setAutoSaveEnabled(enabled);
    setToastMessage(
      `Auto-save ${enabled ? "enabled" : "disabled"} by default for new files`
    );
    setShowToast(true);
  };

  React.useEffect(() => {
    // Push notifications disabled in local-only mode
  }, []);

  return (
    <IonPage
      className={isDarkMode ? "settings-page-dark" : "settings-page-light"}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.push("/app/files")}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ fontWeight: "bold", fontSize: "1.3em" }}>
            Settings
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        className={
          isDarkMode ? "settings-content-dark" : "settings-content-light"
        }
      >
        <div className="settings-container">
          {/* General Settings Card */}
          <div className="signature-section" style={{ marginBottom: "20px" }}>
            <IonCard
              className={
                isDarkMode ? "settings-card-dark" : "settings-card-light"
              }
            >
              <IonCardHeader>
                <IonCardTitle
                  style={{
                    fontSize: "1.1em",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <IonIcon icon={settings} style={{ fontSize: "1.2em" }} />
                  General Settings
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList className="settings-list">
                  <IonItem>
                    <IonLabel>
                      <h3>Dark Mode</h3>
                      <p>Toggle between light and dark theme</p>
                    </IonLabel>
                    <IonToggle
                      checked={isDarkMode}
                      onIonChange={toggleDarkMode}
                      slot="end"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h3>Auto-save for New Files</h3>
                      <p>Enable auto-save by default for new files</p>
                    </IonLabel>
                    <IonToggle
                      checked={globalAutoSaveEnabled}
                      onIonChange={(e) =>
                        handleAutoSaveToggle(e.detail.checked)
                      }
                      slot="end"
                    />
                  </IonItem>
                  <IonItem button onClick={handleResetOnboarding}>
                    <IonIcon icon={informationCircle} slot="start" />
                    <IonLabel>
                      <h3>Reset Tutorial</h3>
                      <p>Show the welcome tutorial again</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem button onClick={handleNotificationPermission}>
                    <IonIcon icon={flash} slot="start" />
                    <IonLabel>
                      <h3>Enable Notifications</h3>
                      <p>Get notified about important updates</p>
                    </IonLabel>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          </div>

          {/* Blockchain Settings Card */}
          <div style={{ marginBottom: "16px" }}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--ion-color-primary)",
                  }}
                >
                  <IonIcon icon={wallet} style={{ fontSize: "1.2em" }} />
                  Blockchain Settings
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {!isConnected ? (
                  <IonList className="settings-list">
                    <IonItem>
                      <IonIcon icon={wallet} slot="start" />
                      <IonLabel>
                        <h3>Connect Wallet</h3>
                        <p>
                          Connect your Starknet wallet to access blockchain
                          features
                        </p>
                      </IonLabel>
                      <WalletConnection />
                    </IonItem>
                  </IonList>
                ) : (
                  <IonList className="settings-list">
                    <IonItem>
                      <IonIcon icon={wallet} slot="start" />
                      <IonLabel>
                        <h3>Wallet Status</h3>
                        <p>
                          Connected: {address?.slice(0, 8)}...
                          {address?.slice(-6)}
                        </p>
                      </IonLabel>
                      <WalletConnection />
                    </IonItem>

                    <IonItem>
                      <IonIcon icon={card} slot="start" />
                      <IonLabel>
                        <h3>Token Balance</h3>
                        <MedTokenBalance />
                      </IonLabel>
                    </IonItem>

                    <IonItem>
                      <IonIcon icon={shield} slot="start" />
                      <IonLabel>
                        <h3>Blockchain Files</h3>
                        <p>{files?.length || 0} files stored on Starknet</p>
                      </IonLabel>
                    </IonItem>

                    {subscriptionSummary && (
                      <IonItem>
                        <IonIcon icon={informationCircle} slot="start" />
                        <IonLabel>
                          <h3>Storage Usage</h3>
                          <p>
                            {subscriptionSummary[0].toString()}/
                            {subscriptionSummary[1].toString()} files used
                          </p>
                        </IonLabel>
                      </IonItem>
                    )}

                    <IonItem
                      button
                      onClick={() => setShowSubscriptionModal(true)}
                    >
                      <IonIcon icon={card} slot="start" />
                      <IonLabel>
                        <h3>Subscription Plans</h3>
                        <p>Manage your subscription</p>
                      </IonLabel>
                    </IonItem>
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          </div>

          {/* PWA Status Card */}
          <div className="signature-section" style={{ marginBottom: "20px" }}>
            <IonCard
              className={
                isDarkMode ? "settings-card-dark" : "settings-card-light"
              }
            >
              <IonCardHeader>
                <IonCardTitle
                  style={{
                    fontSize: "1.1em",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <IonIcon
                    icon={isOnline ? wifiOutline : cloudOfflineOutline}
                    style={{ fontSize: "1.2em" }}
                  />
                  App Status
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList className="settings-list">
                  <IonItem>
                    <IonLabel>
                      <h3>Connection Status</h3>
                      <p>{isOnline ? "Online" : "Offline"}</p>
                    </IonLabel>
                    <IonIcon
                      icon={isOnline ? wifiOutline : cloudOfflineOutline}
                      color={isOnline ? "success" : "medium"}
                      slot="end"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <h3>App Status</h3>
                      <p>{isInstalled ? "Installed" : "Running in browser"}</p>
                    </IonLabel>
                  </IonItem>
                  {isInstallable && !isInstalled && (
                    <IonItem button onClick={installApp}>
                      <IonIcon icon={downloadOutline} slot="start" />
                      <IonLabel>
                        <h3>Install App</h3>
                        <p>Install for offline access</p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        {/* Menu Component (Action Sheet) */}
        <Menu showM={showMenu} setM={() => setShowMenu(false)} />
      </IonContent>

      {/* Subscription Modal */}
      <SubscriptionPlans
        isOpen={showSubscriptionModal}
        onDidDismiss={() => setShowSubscriptionModal(false)}
      />

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={toastMessage.includes("Maximum") ? 4000 : 3000}
        position="bottom"
        color={
          toastMessage.includes("successful")
            ? "success"
            : toastMessage.includes("Maximum")
            ? "warning"
            : "danger"
        }
      />

      {/* Toast for reset onboarding confirmation */}
      <IonToast
        isOpen={showResetToast}
        onDidDismiss={() => setShowResetToast(false)}
        message="Onboarding reset! Landing page will show on next visit."
        duration={3000}
        position="bottom"
        color="success"
      />
    </IonPage>
  );
};

export default SettingsPage;
