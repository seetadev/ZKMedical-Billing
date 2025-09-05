import React, { useState, useEffect } from "react";
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
  IonToggle,
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
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(
    localStorage.getItem('starknet-auto-connect') === 'true'
  );
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();
  const { isDarkMode } = useTheme();

  const isConnected = status === "connected" && address;

  // Auto-connect functionality
  useEffect(() => {
    const attemptAutoConnect = async () => {
      // Don't auto-connect if already connected or connecting
      if (isConnected || status === "connecting" || isAutoConnecting) {
        return;
      }

      try {
        // Check localStorage for previous wallet connection preference
        const lastConnectedWallet = localStorage.getItem('starknet-last-wallet');
        const autoConnectEnabled = localStorage.getItem('starknet-auto-connect') === 'true';
        
        if (!autoConnectEnabled || !lastConnectedWallet) {
          return;
        }

        // Find the connector that matches the stored wallet
        const savedConnector = connectors.find(
          connector => connector.id === lastConnectedWallet
        );

        if (savedConnector) {
          setIsAutoConnecting(true);
          console.log(`Auto-connecting to ${savedConnector.id}...`);
          
          // Attempt to connect
          await connect({ connector: savedConnector });
          
          // Small delay to let connection settle
          setTimeout(() => {
            setIsAutoConnecting(false);
          }, 2000);
        }
      } catch (error) {
        console.log('Auto-connect failed:', error);
        setIsAutoConnecting(false);
        // Clear invalid stored data if auto-connect fails
        localStorage.removeItem('starknet-last-wallet');
      }
    };

    // Only attempt auto-connect when connectors are available and we're not connected
    if (connectors.length > 0 && !isConnected) {
      attemptAutoConnect();
    }
  }, [connectors, isConnected, status, connect, isAutoConnecting]);

  const handleConnect = (connector: (typeof connectors)[number]) => {
    // Store the wallet choice for auto-connect
    localStorage.setItem('starknet-last-wallet', connector.id);
    localStorage.setItem('starknet-auto-connect', 'true');
    
    connect({ connector });
    setShowModal(false);
  };

  const handleDisconnect = () => {
    // Clear auto-connect preference when manually disconnecting
    localStorage.removeItem('starknet-last-wallet');
    localStorage.setItem('starknet-auto-connect', 'false');
    setAutoConnectEnabled(false);
    
    disconnect();
    setShowModal(false);
  };

  const toggleAutoConnect = (enabled: boolean) => {
    setAutoConnectEnabled(enabled);
    localStorage.setItem('starknet-auto-connect', enabled.toString());
    
    if (!enabled) {
      // Remove saved wallet when disabling auto-connect
      localStorage.removeItem('starknet-last-wallet');
    }
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

  // Show connecting state during auto-connect
  if (isAutoConnecting || status === "connecting") {
    return (
      <IonIcon
        icon={wallet}
        color="warning"
        size="large"
      />
    );
  }

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
                
                {/* Auto-connect toggle */}
                <IonItem>
                  <IonLabel>
                    <h3>Auto-connect on app start</h3>
                    <p>Automatically connect to your preferred wallet when the app loads</p>
                  </IonLabel>
                  <IonToggle
                    checked={autoConnectEnabled}
                    onIonChange={(e) => toggleAutoConnect(e.detail.checked)}
                    slot="end"
                  />
                </IonItem>
                
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
                  onClick={handleDisconnect}
                >
                  <IonIcon icon={close} slot="start" />
                  Disconnect Wallet
                </IonButton>
                
                {/* Auto-connect toggle for connected state */}
                <IonItem style={{ marginTop: "16px" }}>
                  <IonLabel>
                    <h3>Auto-connect on app start</h3>
                    <p>Automatically connect to this wallet when the app loads</p>
                  </IonLabel>
                  <IonToggle
                    checked={autoConnectEnabled}
                    onIonChange={(e) => toggleAutoConnect(e.detail.checked)}
                    slot="end"
                  />
                </IonItem>
              </div>
            )}
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default WalletConnection;
