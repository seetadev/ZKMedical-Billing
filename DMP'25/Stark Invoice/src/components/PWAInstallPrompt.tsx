import React from 'react';
import {
  IonAlert,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonToast
} from '@ionic/react';
import { downloadOutline, closeOutline } from 'ionicons/icons';
import { usePWA } from '../hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA();
  const [showInstallAlert, setShowInstallAlert] = React.useState(false);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowSuccessToast(true);
    }
    setShowInstallAlert(false);
  };

  if (!isInstallable) return null;

  return (
    <>
      <IonItem button onClick={() => setShowInstallAlert(true)}>
        <IonIcon icon={downloadOutline} slot="start" />
        <IonLabel>
          <h2>Install App</h2>
          <p>Add to home screen for quick access</p>
        </IonLabel>
      </IonItem>

      <IonAlert
        isOpen={showInstallAlert}
        onDidDismiss={() => setShowInstallAlert(false)}
        header="Install App"
        message="Would you like to install this app to your home screen for easy access?"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Install',
            handler: handleInstall
          }
        ]}
      />

      <IonToast
        isOpen={showSuccessToast}
        onDidDismiss={() => setShowSuccessToast(false)}
        message="App installed successfully!"
        duration={2000}
        color="success"
      />
    </>
  );
};

export default PWAInstallPrompt;