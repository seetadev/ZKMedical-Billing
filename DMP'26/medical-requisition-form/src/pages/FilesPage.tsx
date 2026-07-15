import React from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import Files from '../components/Files/Files';
import { useInvoice } from '../contexts/InvoiceContext';
import { useStatusBar, StatusBarPresets } from '../hooks/useStatusBar';

const FilesPage: React.FC = () => {
    const { selectedFile, updateSelectedFile, updateBillType } = useInvoice();

    // Use light status bar for files listing page
    useStatusBar(StatusBarPresets.light);

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar style={{ paddingTop: `max(env(safe-area-inset-top, 0px), 24px)`, minHeight: '56px' }}>
                    <IonTitle style={{ fontWeight: 600 }}>My Saved Forms</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding" style={{ "--background": "#f8fafc" }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Files
                        file={selectedFile}
                        updateSelectedFile={updateSelectedFile}
                        updateBillType={updateBillType}
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default FilesPage;
