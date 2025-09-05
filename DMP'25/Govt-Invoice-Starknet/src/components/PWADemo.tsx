import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonToast,
  IonBadge,
} from "@ionic/react";
import {
  downloadOutline,
  wifiOutline,
  cloudOfflineOutline,
  notifications,
  refreshOutline,
  cloudDoneOutline,
} from "ionicons/icons";
import { usePWA } from "../hooks/usePWA";
// import { usePushNotifications } from '../utils/pushNotifications';
import { useOfflineStorage } from "../utils/offlineStorage";

const PWADemo: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  // const { requestPermission, showNotification } = usePushNotifications();
  const { saveInvoice, getAllInvoices } = useOfflineStorage();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [offlineData, setOfflineData] = useState<any[]>([]);

  useEffect(() => {
    // Load offline data
    loadOfflineData();
  }, []);

  useEffect(() => {
    // Show notification when going offline
    if (!isOnline) {
      setToastMessage("📱 You're now offline! The app will continue to work.");
      setShowToast(true);
    } else {
      setToastMessage("🌐 You're back online! Data will sync automatically.");
      setShowToast(true);
    }
  }, [isOnline]);

  const loadOfflineData = async () => {
    try {
      const data = await getAllInvoices();
      setOfflineData(data);
    } catch (error) {
      // Error loading offline data
    }
  };

  const testOfflineStorage = async () => {
    const testInvoice = {
      id: `test-${Date.now()}`,
      title: "Test Invoice",
      amount: 100,
      date: new Date().toISOString(),
      status: "draft",
    };

    try {
      await saveInvoice(testInvoice.id, testInvoice);
      setToastMessage("✅ Test data saved offline!");
      setShowToast(true);
      loadOfflineData();
    } catch (error) {
      setToastMessage("❌ Error saving offline data");
      setShowToast(true);
    }
  };

  const testNotification = async () => {
    // const permission = await requestPermission();
    // if (permission === 'granted') {
    //   await showNotification('PWA Test', {
    //     body: 'This is a test notification from your PWA!',
    //     icon: '/pwa-192x192.png'
    //   });
    // }
    // Notification functionality disabled
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={downloadOutline} style={{ marginRight: "8px" }} />
          PWA Features Demo
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {/* Connection Status */}
        <IonItem>
          <IonIcon
            icon={isOnline ? wifiOutline : cloudOfflineOutline}
            slot="start"
            color={isOnline ? "success" : "warning"}
          />
          <IonLabel>
            <h2>Connection Status</h2>
            <p>{isOnline ? "Online" : "Offline"}</p>
          </IonLabel>
          <IonBadge color={isOnline ? "success" : "warning"}>
            {isOnline ? "Connected" : "Offline"}
          </IonBadge>
        </IonItem>

        {/* Installation Status */}
        <IonItem>
          <IonIcon
            icon={downloadOutline}
            slot="start"
            color={
              isInstalled ? "success" : isInstallable ? "primary" : "medium"
            }
          />
          <IonLabel>
            <h2>App Installation</h2>
            <p>
              {isInstalled
                ? "App is installed"
                : isInstallable
                ? "Ready to install"
                : "Already installed or not supported"}
            </p>
          </IonLabel>
          {isInstallable && !isInstalled && (
            <IonButton fill="outline" size="small" onClick={installApp}>
              Install
            </IonButton>
          )}
        </IonItem>

        {/* Offline Storage Demo */}
        <IonItem>
          <IonIcon icon={cloudDoneOutline} slot="start" color="success" />
          <IonLabel>
            <h2>Offline Storage</h2>
            <p>{offlineData.length} items stored locally</p>
          </IonLabel>
          <IonButton fill="outline" size="small" onClick={testOfflineStorage}>
            Test Save
          </IonButton>
        </IonItem>

        {/* Notifications Demo */}
        <IonItem>
          <IonIcon icon={notifications} slot="start" color="primary" />
          <IonLabel>
            <h2>Push Notifications</h2>
            <p>Test notification system</p>
          </IonLabel>
          <IonButton fill="outline" size="small" onClick={testNotification}>
            Test Notify
          </IonButton>
        </IonItem>

        {/* Instructions */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3>🧪 Test PWA Features:</h3>
          <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>
            <li>
              <strong>Go Offline:</strong> Disconnect internet to see offline
              mode
            </li>
            <li>
              <strong>Install App:</strong> Click install button (if available)
            </li>
            <li>
              <strong>Test Storage:</strong> Click "Test Save" to save data
              offline
            </li>
            <li>
              <strong>Test Notifications:</strong> Click "Test Notify" for push
              notifications
            </li>
          </ol>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonCardContent>
    </IonCard>
  );
};

export default PWADemo;
