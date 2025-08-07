import React from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonPage
} from '@ionic/react';
import { cloudOfflineOutline, refreshOutline, homeOutline } from 'ionicons/icons';

interface OfflineFallbackProps {
  onRetry?: () => void;
  onHome?: () => void;
}

const OfflineFallback: React.FC<OfflineFallbackProps> = ({ onRetry, onHome }) => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          textAlign: 'center'
        }}>
          <IonIcon
            icon={cloudOfflineOutline} 
            style={{ fontSize: '4rem', color: '#666', marginBottom: '1rem' }}
          />
          
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>You're Offline</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                This content isn't available offline. Please check your internet 
                connection and try again.
              </p>
              
              <div style={{ marginTop: '1rem' }}>
                {onRetry && (
                  <IonButton 
                    fill="solid" 
                    onClick={onRetry}
                    style={{ marginRight: '10px' }}
                  >
                    <IonIcon icon={refreshOutline} slot="start" />
                    Try Again
                  </IonButton>
                )}
                
                {onHome && (
                  <IonButton 
                    fill="outline" 
                    onClick={onHome}
                  >
                    <IonIcon icon={homeOutline} slot="start" />
                    Go Home
                  </IonButton>
                )}
              </div>
            </IonCardContent>
          </IonCard>
          
          <div style={{ marginTop: '2rem', color: '#666' }}>
            <p>
              <strong>Tip:</strong> Install this app to your home screen for better offline access!
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OfflineFallback;