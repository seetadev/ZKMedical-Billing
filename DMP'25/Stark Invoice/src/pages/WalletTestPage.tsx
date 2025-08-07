import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonChip,
  IonSpinner,
  IonTextarea,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import {
  wallet,
  checkmarkCircle,
  alertCircle,
  refresh,
  bug,
  copy,
  trash,
} from "ionicons/icons";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import {
  debugWalletConnection,
  clearWalletData,
  requestWalletPermissions,
} from "../utils/walletDebug";

const WalletTestPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>({});

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, status, account } = useAccount();

  const isConnected = status === "connected" && address && account;

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const runDebugTests = () => {
    addLog("Running wallet debug tests...");
    const debug = debugWalletConnection();
    setDebugInfo(debug);

    const tests = {
      walletExtensions: debug.hasArgentX || debug.hasBraavos,
      secureContext: debug.isSecure,
      connectorsAvailable: connectors.length > 0,
      starknetProvider:
        !!(window as any).starknet || !!(window as any).starknet_braavos,
    };

    setTestResults(tests);
    addLog(`Test results: ${JSON.stringify(tests)}`);
  };

  const testWalletConnection = async (connector: any) => {
    try {
      setIsConnecting(true);
      addLog(`Testing connection with ${connector.id}...`);

      // Test permission request first
      try {
        const permissions = await requestWalletPermissions();
        addLog(`Permission request result: ${JSON.stringify(permissions)}`);
      } catch (permError) {
        addLog(`Permission request failed: ${permError}`);
      }

      // Test connection
      const result = await connect({ connector });
      addLog(`Connection attempt result: ${JSON.stringify(result)}`);

      // Wait and check status
      await new Promise((resolve) => setTimeout(resolve, 3000));
      addLog(
        `Status after connection: ${status}, Address: ${address}, Account: ${
          account ? "Ready" : "Not Ready"
        }`
      );
    } catch (error) {
      addLog(`Connection error: ${error}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const clearAll = () => {
    clearWalletData();
    setConnectionLogs([]);
    setDebugInfo(null);
    setTestResults({});
    addLog("Cleared all wallet data and logs");
  };

  const copyLogs = () => {
    const logsText = connectionLogs.join("\n");
    navigator.clipboard.writeText(logsText);
    addLog("Logs copied to clipboard");
  };

  useEffect(() => {
    runDebugTests();
  }, []);

  useEffect(() => {
    addLog(
      `Wallet status changed: ${status}, Address: ${
        address ? "Present" : "None"
      }, Account: ${account ? "Ready" : "Not Ready"}`
    );
  }, [status, address, account]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" />
          </IonButtons>
          <IonTitle>Wallet Connection Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: "16px" }}>
          {/* Current Status */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Current Wallet Status</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonChip color={isConnected ? "success" : "warning"}>
                <IonIcon icon={isConnected ? checkmarkCircle : alertCircle} />
                <IonLabel>
                  {isConnected ? "Connected" : "Not Connected"}
                </IonLabel>
              </IonChip>
              {address && (
                <div style={{ marginTop: "12px" }}>
                  <IonText>
                    <p>
                      <strong>Address:</strong> {address}
                    </p>
                    <p>
                      <strong>Status:</strong> {status}
                    </p>
                    <p>
                      <strong>Account:</strong>{" "}
                      {account ? "✅ Ready" : "❌ Not Ready"}
                    </p>
                  </IonText>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Debug Information */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Debug Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton onClick={runDebugTests} fill="outline" size="small">
                <IonIcon icon={refresh} slot="start" />
                Refresh Debug Info
              </IonButton>

              {debugInfo && (
                <div style={{ marginTop: "12px", fontSize: "14px" }}>
                  <p>ArgentX Extension: {debugInfo.hasArgentX ? "✅" : "❌"}</p>
                  <p>Braavos Extension: {debugInfo.hasBraavos ? "✅" : "❌"}</p>
                  <p>
                    Secure Context (HTTPS): {debugInfo.isSecure ? "✅" : "❌"}
                  </p>
                  <p>Domain: {debugInfo.domain}</p>
                  <p>Connectors Available: {connectors.length}</p>
                </div>
              )}

              {Object.keys(testResults).length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <h4>Test Results:</h4>
                  {Object.entries(testResults).map(([test, result]) => (
                    <p key={test}>
                      {test}: {result ? "✅ Pass" : "❌ Fail"}
                    </p>
                  ))}
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Available Connectors */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Available Wallets</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {connectors.map((connector) => (
                  <IonItem key={connector.id}>
                    <IonIcon icon={wallet} slot="start" />
                    <IonLabel>
                      <h3>{connector.id}</h3>
                    </IonLabel>
                    <IonButton
                      slot="end"
                      size="small"
                      onClick={() => testWalletConnection(connector)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <IonSpinner name="dots" />
                      ) : (
                        "Test Connect"
                      )}
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>

              {isConnected && (
                <IonButton
                  expand="block"
                  color="danger"
                  fill="outline"
                  onClick={() => {
                    disconnect();
                    addLog("Disconnected wallet");
                  }}
                >
                  Disconnect Wallet
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>

          {/* Connection Logs */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Connection Logs</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ marginBottom: "12px" }}>
                <IonButton size="small" fill="outline" onClick={copyLogs}>
                  <IonIcon icon={copy} slot="start" />
                  Copy Logs
                </IonButton>
                <IonButton
                  size="small"
                  fill="outline"
                  color="danger"
                  onClick={clearAll}
                >
                  <IonIcon icon={trash} slot="start" />
                  Clear All
                </IonButton>
              </div>

              <IonTextarea
                value={connectionLogs.join("\n")}
                readonly
                rows={10}
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  backgroundColor: "var(--ion-color-light)",
                  border: "1px solid var(--ion-color-medium)",
                }}
              />
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default WalletTestPage;
