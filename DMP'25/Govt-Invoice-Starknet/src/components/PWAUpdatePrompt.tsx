import React from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon
} from '@ionic/react';
import { refreshOutline, closeOutline } from 'ionicons/icons';
import { usePWA } from '../hooks/usePWA';

const PWAUpdatePrompt: React.FC = () => {
  const { updateAvailable, reloadApp } = usePWA();
  const [showUpdate, setShowUpdate] = React.useState(updateAvailable);

  React.useEffect(() => {
    setShowUpdate(updateAvailable);
  }, [updateAvailable]);

  if (!showUpdate) return null;

  return (
    <IonCard style={{ 
      position: 'fixed', 
      bottom: '20px', 
      left: '20px', 
      right: '20px', 
      zIndex: 1000,
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <IonCardHeader>
        <IonCardTitle>Update Available</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p>A new version of the app is available. Restart to get the latest features.</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <IonButton 
            fill="solid" 
            onClick={reloadApp}
            expand="block"
          >
            <IonIcon icon={refreshOutline} slot="start" />
            Update Now
          </IonButton>
          <IonButton 
            fill="clear" 
            onClick={() => setShowUpdate(false)}
          >
            <IonIcon icon={closeOutline} slot="icon-only" />
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default PWAUpdatePrompt;