import React, { useState } from "react";
import {
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
} from "@ionic/react";
import {
  cloudOfflineOutline,
  cloudDoneOutline,
  wifiOutline,
  closeOutline,
} from "ionicons/icons";
import { usePWA } from "../hooks/usePWA";

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal when coming back online
  React.useEffect(() => {
    if (isOnline) {
      setIsDismissed(false);
    }
  }, [isOnline]);

  // Don't show if dismissed or if online
  if (isDismissed || isOnline) {
    return null;
  }

  return (
    <IonItem
      lines="none"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        backgroundColor: "#f8d7da",
        borderBottom: "2px solid #f5c6cb",
      }}
    >
      <IonIcon icon={cloudOfflineOutline} slot="start" color="danger" />
      <IonLabel>
        <h3>Offline</h3>
        <p>Some features may be limited</p>
      </IonLabel>
      <IonBadge color="danger" slot="end" style={{ marginRight: "8px" }}>
        No Connection
      </IonBadge>
      <IonButton
        fill="clear"
        size="small"
        color="danger"
        onClick={() => setIsDismissed(true)}
        slot="end"
      >
        <IonIcon icon={closeOutline} />
      </IonButton>
    </IonItem>
  );
};

export default OfflineIndicator;
