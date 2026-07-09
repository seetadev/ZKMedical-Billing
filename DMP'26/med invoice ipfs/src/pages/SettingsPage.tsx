import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonAlert,
    IonIcon
} from '@ionic/react';
import {
    settingsOutline,
    cashOutline,
    shieldCheckmarkOutline,
    informationCircleOutline,
    trashOutline,
    walletOutline,
    helpCircleOutline
} from 'ionicons/icons';
import { useInvoice } from '../contexts/InvoiceContext';
import { useStatusBar, StatusBarPresets } from '../hooks/useStatusBar';
import './SettingsPage.css';

const CURRENCIES = [
    { label: 'INR - Indian Rupee (₹)', value: 'INR' },
    { label: 'USD - US Dollar ($)', value: 'USD' },
    { label: 'EUR - Euro (€)', value: 'EUR' },
    { label: 'GBP - British Pound (£)', value: 'GBP' },
    { label: 'JPY - Japanese Yen (¥)', value: 'JPY' },
    { label: 'AUD - Australian Dollar (A$)', value: 'AUD' },
    { label: 'CAD - Canadian Dollar (C$)', value: 'CAD' }
];

const SettingsPage: React.FC = () => {
    const { currency, updateCurrency } = useInvoice();
    const [showResetAlert, setShowResetAlert] = useState(false);

    // Initialize status bar
    useStatusBar(StatusBarPresets.light);

    // Enforce light theme on mount
    useEffect(() => {
        document.body.classList.remove('dark');
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }, []);

    const handleResetAllData = () => {
        // Clear all local storage
        localStorage.clear();
        // Force complete page reload to redirect to onboarding welcome step
        window.location.href = '/';
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="settings-toolbar">
                    <IonTitle className="settings-title">
                        <div className="title-content">
                            <IonIcon icon={settingsOutline} className="header-icon" />
                            <span>Settings</span>
                        </div>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="settings-content" style={{ "--background": "#f8fafc" }}>
                <div className="settings-hero">
                    <div className="hero-accent-circle-1" />
                    <div className="hero-accent-circle-2" />
                    <div className="hero-content">
                        <h2>Medical Invoice</h2>
                        <p>Configure default billing settings and database controls.</p>
                    </div>
                </div>

                <div className="settings-container">
                    {/* General Settings */}
                    <div className="settings-group">
                        <div className="settings-group-title">
                            <IonIcon icon={cashOutline} />
                            <span>Preferences</span>
                        </div>
                        
                        {/* Currency selector */}
                        <div className="settings-card">
                            <div className="settings-row">
                                <div className="settings-icon-wrapper">
                                    <IonIcon icon={walletOutline} className="card-icon" />
                                </div>
                                <div className="settings-info">
                                    <h4 className="settings-card-title">Default Currency</h4>
                                    <p className="settings-card-desc">Set default currency prefix for medical fees & receipts.</p>
                                </div>
                                <div className="settings-action">
                                    <IonSelect
                                        value={currency || 'INR'}
                                        interface="popover"
                                        className="settings-select"
                                        onIonChange={(e) => updateCurrency(e.detail.value)}
                                    >
                                        {CURRENCIES.map((c) => (
                                            <IonSelectOption key={c.value} value={c.value}>
                                                {c.value}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data management */}
                    <div className="settings-group">
                        <div className="settings-group-title">
                            <IonIcon icon={shieldCheckmarkOutline} />
                            <span>Database & Security</span>
                        </div>
                        <div className="settings-card reset-card">
                            <div className="settings-row">
                                <div className="settings-icon-wrapper danger">
                                    <IonIcon icon={trashOutline} className="card-icon danger" />
                                </div>
                                <div className="settings-info">
                                    <h4 className="settings-card-title">Reset App Database</h4>
                                    <p className="settings-card-desc">Permanently wipe all local invoices and restore defaults.</p>
                                </div>
                                <div className="settings-action">
                                    <IonButton
                                        className="reset-btn"
                                        color="danger"
                                        onClick={() => setShowResetAlert(true)}
                                    >
                                        Wipe Data
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App info */}
                    <div className="settings-group">
                        <div className="settings-group-title">
                            <IonIcon icon={informationCircleOutline} />
                            <span>Application Metadata</span>
                        </div>
                        <div className="settings-card info-card">
                            <div className="info-row">
                                <div className="info-item-left">
                                    <span className="info-label">App Identifier</span>
                                </div>
                                <span className="info-value text-primary">Medical Invoice</span>
                            </div>
                            <div className="info-row">
                                <div className="info-item-left">
                                    <span className="info-label">Current Version</span>
                                </div>
                                <span className="info-value">v5.0</span>
                            </div>
                            <div className="info-row">
                                <div className="info-item-left">
                                    <span className="info-label">Build Configuration</span>
                                </div>
                                <span className="info-value mono">2</span>
                            </div>
                            <div className="info-row">
                                <div className="info-item-left">
                                    <span className="info-label">Data Privacy</span>
                                </div>
                                <span className="info-value text-success">100% Offline / Private</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reset Warning Dialog */}
                <IonAlert
                    isOpen={showResetAlert}
                    onDidDismiss={() => setShowResetAlert(false)}
                    header="Reset All Data?"
                    message="Are you absolutely sure you want to delete all saved receipts and settings? This operation is permanent and cannot be undone."
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel'
                        },
                        {
                            text: 'Delete Everything',
                            role: 'destructive',
                            handler: handleResetAllData
                        }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default SettingsPage;
