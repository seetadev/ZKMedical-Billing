import React, { useState } from "react";
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
  IonToggle,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  saveOutline,
  cloudUpload,
  save,
  print,
  mail,
  settings,
  informationCircle,
  moon,
  sunny,
  wallet,
  card,
  alertCircle,
} from "ionicons/icons";
import Menu from "../components/Menu/Menu";
import { Local } from "../components/Storage/LocalStorage";
import Subscription from "../components/wallet/Subscription";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useGetUserTokens } from "../hooks/useContractRead";
import { useTheme } from "../contexts/ThemeContext";
import { useInvoice } from "../contexts/InvoiceContext";
import "./SettingsPage.css";

const SettingsPage: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { billType, updateBillType } = useInvoice();

  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { tokens, isLoading: tokensLoading } = useGetUserTokens({
    accountAddress: address as `0x${string}` | undefined,
  });
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleSaveLocal = () => {
    setShowMenu(true);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTokens = (tokenAmount: bigint | undefined) => {
    if (!tokenAmount) return "0";
    // Convert from wei to tokens (divide by 10^18)
    const tokens = Number(tokenAmount) / Math.pow(10, 18);
    return tokens.toFixed(2);
  };

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <IonPage
      className={isDarkMode ? "settings-page-dark" : "settings-page-light"}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ fontWeight: "bold", fontSize: "1.3em" }}>
            ⚙️ User Settings
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={toggleDarkMode}
              style={{ fontSize: "1.5em" }}
            >
              <IonIcon icon={isDarkMode ? sunny : moon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        className={
          isDarkMode ? "settings-content-dark" : "settings-content-light"
        }
      >
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Menu & Settings</IonTitle>
            <IonButtons slot="end">
              <IonButton
                fill="clear"
                onClick={toggleDarkMode}
                style={{ fontSize: "1.5em" }}
              >
                <IonIcon icon={isDarkMode ? sunny : moon} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div
          className={`menu-page-container ${isDarkMode ? "" : "light-mode"}`}
        >
          {/* Wallet Card */}
          <IonCard
            className={
              isDarkMode ? "settings-card-dark" : "settings-card-light"
            }
          >
            <IonCardHeader
              className={
                isDarkMode
                  ? "settings-card-header-dark"
                  : "settings-card-header-light"
              }
            >
              <IonCardTitle
                className={
                  isDarkMode
                    ? "settings-card-title-dark"
                    : "settings-card-title-light"
                }
              >
                <IonIcon
                  icon={wallet}
                  style={{ marginRight: "8px", fontSize: "1.5em" }}
                />
                Wallet & Account
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {/* Connection Status */}
              <IonItem>
                <IonIcon
                  icon={status === "connected" ? wallet : alertCircle}
                  color={status === "connected" ? "success" : "warning"}
                  slot="start"
                />
                <IonLabel>
                  <h3>Connection Status</h3>
                  <p>
                    {status === "connected" ? "Connected" : "Not Connected"}
                  </p>
                  {address && (
                    <p className="address-display">{formatAddress(address)}</p>
                  )}
                </IonLabel>
                {status === "connected" ? (
                  <IonButton
                    fill="outline"
                    color="danger"
                    size="small"
                    onClick={() => disconnect()}
                    slot="end"
                  >
                    Disconnect
                  </IonButton>
                ) : (
                  <IonButton
                    fill="solid"
                    color="primary"
                    size="small"
                    onClick={handleConnect}
                    slot="end"
                  >
                    Connect
                  </IonButton>
                )}
              </IonItem>

              {/* Network Information */}
              <IonItem>
                <IonIcon icon={settings} color="tertiary" slot="start" />
                <IonLabel>
                  <h3>Network</h3>
                  <p>Starknet Sepolia Testnet</p>
                </IonLabel>
              </IonItem>

              {/* Token Balance */}
              <IonItem>
                <IonIcon icon={card} color="primary" slot="start" />
                <IonLabel>
                  <h3>MEDI Token Balance</h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                    className="token-balance-container"
                  >
                    <span className="coin-emoji">🪙</span>
                    <span className="balance-text">
                      {tokensLoading
                        ? "Loading..."
                        : `${formatTokens(tokens)} MEDI`}
                    </span>
                  </div>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Settings Card */}
          <IonCard
            className={
              isDarkMode ? "settings-card-dark" : "settings-card-light"
            }
          >
            <IonCardHeader
              className={
                isDarkMode
                  ? "settings-card-header-dark"
                  : "settings-card-header-light"
              }
            >
              <IonCardTitle
                className={
                  isDarkMode
                    ? "settings-card-title-dark"
                    : "settings-card-title-light"
                }
              >
                <IonIcon
                  icon={settings}
                  style={{ marginRight: "8px", fontSize: "1.5em" }}
                />
                Preferences
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonIcon icon={isDarkMode ? moon : sunny} slot="start" />
                  <IonLabel>Dark Mode</IonLabel>
                  <IonToggle
                    checked={isDarkMode}
                    onIonChange={(e) => toggleDarkMode()}
                    slot="end"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Bill Type</IonLabel>
                  <IonSelect
                    value={billType}
                    onIonChange={(e) => updateBillType(e.detail.value)}
                    slot="end"
                  >
                    <IonSelectOption value={1}>Invoice</IonSelectOption>
                    <IonSelectOption value={2}>Receipt</IonSelectOption>
                    <IonSelectOption value={3}>Estimate</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Subscription Card */}
          <IonCard
            className={
              isDarkMode ? "settings-card-dark" : "settings-card-light"
            }
          >
            <IonCardHeader
              className={
                isDarkMode
                  ? "settings-card-header-dark"
                  : "settings-card-header-light"
              }
            >
              <IonCardTitle
                className={
                  isDarkMode
                    ? "settings-card-title-dark"
                    : "settings-card-title-light"
                }
              >
                <IonIcon
                  icon={informationCircle}
                  style={{ marginRight: "8px", fontSize: "1.5em" }}
                />
                Subscription
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton
                expand="block"
                fill="clear"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <IonIcon icon={informationCircle} slot="start" />
                Manage Subscription
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Menu Component (Action Sheet) */}
        <Menu showM={showMenu} setM={() => setShowMenu(false)} />

        {/* Subscription Modal */}
        <Subscription />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
