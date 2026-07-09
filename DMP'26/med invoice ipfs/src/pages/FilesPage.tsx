import React from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonIcon } from '@ionic/react';
import { folderOpenOutline } from 'ionicons/icons';
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
                <IonToolbar className="settings-toolbar">
                    <IonTitle className="settings-title">
                        <div className="title-content">
                            <IonIcon icon={folderOpenOutline} className="header-icon" />
                            <span>Saved Invoices</span>
                        </div>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="settings-content" style={{ "--background": "#f8fafc" }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 8px' }}>
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
