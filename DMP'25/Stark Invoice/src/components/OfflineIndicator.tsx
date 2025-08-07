import React from 'react';
import {
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote
} from '@ionic/react';
import { cloudOfflineOutline, cloudDoneOutline, wifiOutline } from 'ionicons/icons';
import { usePWA } from '../hooks/usePWA';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  return (
    <IonItem lines="none" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 999,
      backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
      borderBottom: `2px solid ${isOnline ? '#c3e6cb' : '#f5c6cb'}`
    }}>
      <IonIcon 
        icon={isOnline ? cloudDoneOutline : cloudOfflineOutline} 
        slot="start"
        color={isOnline ? 'success' : 'danger'}
      />
      <IonLabel>
        <h3>{isOnline ? 'Online' : 'Offline'}</h3>
        <p>
          {isOnline 
            ? 'All features available' 
            : 'Some features may be limited'
          }
        </p>
      </IonLabel>
      <IonBadge 
        color={isOnline ? 'success' : 'danger'} 
        slot="end"
      >
        {isOnline ? 'Connected' : 'No Connection'}
      </IonBadge>
    </IonItem>
  );
};

export default OfflineIndicator;