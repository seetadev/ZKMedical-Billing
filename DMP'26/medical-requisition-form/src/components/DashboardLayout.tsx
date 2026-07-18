import React, { useState } from 'react';
import { IonIcon, IonButton, IonSpinner, useIonAlert, isPlatform } from '@ionic/react';
import { App as CapacitorApp } from '@capacitor/app';
import { add, cloudOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';

import { IpfsCloudModal } from './IpfsCloudModal';
import { localTemplateService } from '../services/local-template-service';
import './DashboardLayout.css';
import { useStatusBar, StatusBarPresets } from '../hooks/useStatusBar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [showCloudModal, setShowCloudModal] = useState(false);
    const history = useHistory();
    const location = useLocation();
    const [presentAlert] = useIonAlert();

    // Configure status bar for dashboard pages
    useStatusBar(StatusBarPresets.light);

    // Handle Hardware Back Button
    React.useEffect(() => {
        const handleBackButton = (ev: any) => {
            ev.detail.register(10, () => {
                if (location.pathname === '/app/tabs/home') {
                    presentAlert({
                        header: 'Exit App',
                        message: 'Are you sure you want to exit?',
                        buttons: [
                            { text: 'Cancel', role: 'cancel' },
                            { text: 'Exit', handler: () => CapacitorApp.exitApp() }
                        ]
                    });
                }
            });
        };

        document.addEventListener('ionBackButton', handleBackButton);
        return () => {
            document.removeEventListener('ionBackButton', handleBackButton);
        };
    }, [location.pathname, presentAlert]);

    const handleCreateInvoice = async () => {
        if (isCreating) return;
        setIsCreating(true);

        try {
            // Check 8-file limit
            const canCreate = await localTemplateService.canCreateInvoice();
            if (!canCreate) {
                presentAlert({
                    header: 'File Limit Reached',
                    message: `You can save a maximum of ${localTemplateService.maxInvoices} cash receipt files. Please delete some files before creating a new one.`,
                    buttons: ['OK']
                });
                return;
            }

            // Always determine template based on current platform for new invoices
            let templateId: number | string | null = null;

            const templates = await localTemplateService.fetchStoreTemplates(1, 100);
            if (templates.items.length > 0) {
                const mobile = templates.items.find(t => t.device === 'mobile');
                const tablet = templates.items.find(t => t.device === 'tablet');

                // Platform detection logic
                const isTabletDevice = isPlatform('tablet') || isPlatform('ipad') || (window.innerWidth >= 768);

                if (isTabletDevice && tablet) {
                    templateId = tablet.id;
                } else if (mobile) {
                    // Default to mobile for phones or fallback
                    templateId = mobile.id;
                } else {
                    // Fallback to first available if specific platform template missing
                    templateId = templates.items[0].id;
                }
            }

            if (templateId) {
                await localTemplateService.setActiveTemplateId(templateId);
                window.location.href = `/app/tabs/home/new-template-${templateId}`;
            } else {
                console.error('No suitable template found for platform');
            }
        } catch (error) {
            console.error('Error creating budget:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleImportSuccess = (importedFileName: string) => {
        setShowCloudModal(false);
        window.location.reload();
    };

    return (
        <div className="dashboard-container">
            {/* Header at top level */}
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Medical Requisition Form</h1>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonButton
                        fill="clear"
                        color="primary"
                        onClick={() => setShowCloudModal(true)}
                        style={{
                            height: '36px',
                            marginRight: '8px',
                            '--padding-start': '8px',
                            '--padding-end': '8px',
                        }}
                        title="IPFS Cloud Manager"
                    >
                        <IonIcon icon={cloudOutline} style={{ fontSize: '22px' }} />
                    </IonButton>
                    <IonButton
                        fill="solid"
                        color="primary"
                        onClick={handleCreateInvoice}
                        disabled={isCreating}
                        style={{
                            height: '36px',
                            fontSize: '14px',
                            textTransform: 'none',
                            '--padding-start': '12px',
                            '--padding-end': '16px',
                            '--border-radius': '8px',
                            fontWeight: 500
                        }}
                    >
                        {isCreating ? (
                            <IonSpinner name="crescent" style={{ width: '20px', height: '20px' }} />
                        ) : (
                            <>
                                <IonIcon icon={add} slot="start" style={{ fontSize: '18px', marginRight: '4px' }} />
                                Create
                            </>
                        )}
                    </IonButton>
                </div>
            </header>

            {/* Main body area below header */}
            <div className="dashboard-body">
                <main className="dashboard-content">
                    {children}
                </main>
            </div>

            <IpfsCloudModal
                isOpen={showCloudModal}
                onClose={() => setShowCloudModal(false)}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default DashboardLayout;
