import React, { useState } from "react";
import {
  IonButton,
  IonButtons,
  IonText,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
} from "@ionic/react";
import { useConnect, useDisconnect, useAccount } from "@starknet-react/core";
import {
  wallet,
  walletOutline,
  close,
  checkmarkCircle,
  alertCircle,
} from "ionicons/icons";
import { useTheme } from "../../contexts/ThemeContext";

const WalletConnection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();
  const { isDarkMode } = useTheme();

  const isConnected = status === "connected" && address;

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect({ connector });
    setShowModal(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "success";
      case "connecting":
        return "warning";
      case "disconnected":
        return "medium";
      default:
        return "medium";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return checkmarkCircle;
      case "connecting":
        return wallet;
      case "disconnected":
        return alertCircle;
      default:
        return walletOutline;
    }
  };

  return (
    <>
      {!isConnected ? (
        <IonIcon
          icon={walletOutline}
          // fill="clear"
          onClick={() => setShowModal(true)}
          color={isDarkMode ? "dark" : "light"}
          size="large"
          // className="ion-padding-horizontal"
        />
      ) : (
        <IonIcon
          onClick={() => setShowModal(true)}
          color="success"
          size="large"
          icon={checkmarkCircle}
        />
      )}

      <IonModal
        isOpen={showModal}
        onDidDismiss={() => setShowModal(false)}
        className={isDarkMode ? "dark-theme" : ""}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {isConnected ? "Wallet Info" : "Connect Wallet"}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: "20px" }}>
            {!isConnected ? (
              <>
                <IonText>
                  <h3>Choose a wallet to connect:</h3>
                  <p>Select from the available Starknet wallets to continue.</p>
                </IonText>
                <IonList>
                  {connectors.map((connector) => (
                    <IonItem
                      key={connector.id}
                      button
                      onClick={() => handleConnect(connector)}
                    >
                      <IonIcon icon={wallet} slot="start" />
                      <IonLabel>
                        <h2>{connector.id}</h2>
                        <p>Connect with {connector.id} wallet</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </>
            ) : (
              <div className="ion-text-center">
                <IonChip color="success">
                  <IonIcon icon={checkmarkCircle} />
                  <IonLabel>Connected</IonLabel>
                </IonChip>
                <IonText>
                  <h3>Wallet Address:</h3>
                  <p
                    style={{
                      margin: "12px 0",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      wordBreak: "break-all",
                    }}
                  >
                    {address}
                  </p>
                  <p style={{ margin: "12px 0" }}>
                    Short: {formatAddress(address)}
                  </p>
                </IonText>
                <IonButton
                  expand="block"
                  fill="outline"
                  color="danger"
                  onClick={() => {
                    disconnect();
                    setShowModal(false);
                  }}
                >
                  <IonIcon icon={close} slot="start" />
                  Disconnect Wallet
                </IonButton>
              </div>
            )}
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default WalletConnection;
