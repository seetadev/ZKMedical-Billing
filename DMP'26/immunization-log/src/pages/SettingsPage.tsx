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
    isPlatform
} from '@ionic/react';
import { useInvoice } from '../contexts/InvoiceContext';
import { useStatusBar, StatusBarPresets } from '../hooks/useStatusBar';
import './SettingsPage.css';
import settingsData from './settings.json';

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
    const { currency, updateCurrency, theme, updateTheme } = useInvoice();
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
                <IonToolbar style={{ paddingTop: `max(env(safe-area-inset-top, 0px), 24px)`, minHeight: '56px' }}>
                    <IonTitle style={{ fontWeight: 600 }}>App Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding" style={{ "--background": "#f8fafc" }}>
                <div className="settings-container">
                    
                    {/* General Settings */}
                    <div className="settings-group">
                        <div className="settings-group-title">Preferences</div>
                        
                        {/* Currency selector */}
                        <div className="settings-card">
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h4 className="settings-card-title">Default Currency</h4>
                                    <p className="settings-card-desc">Change display currency.</p>
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

                        {/* Theme selector */}
                        <div className="settings-card">
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h4 className="settings-card-title">Color Palette Theme</h4>
                                    <p className="settings-card-desc">Choose your app color theme.</p>
                                </div>
                                <div className="settings-action">
                                    <IonSelect
                                        value={theme || 'ocean'}
                                        interface="popover"
                                        className="settings-select"
                                        onIonChange={(e) => updateTheme(e.detail.value)}
                                    >
                                        {settingsData.themes.map((t) => (
                                            <IonSelectOption key={t.id} value={t.id}>
                                                {t.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data management */}
                    <div className="settings-group">
                        <div className="settings-group-title">Data Protection</div>
                        <div className="settings-card">
                            <div className="settings-row">
                                <div className="settings-info">
                                    <h4 className="settings-card-title">Reset App Data</h4>
                                    <p className="settings-card-desc">Wipe all local data.</p>
                                </div>
                                <div className="settings-action">
                                    <IonButton
                                        className="reset-btn"
                                        color="danger"
                                        onClick={() => setShowResetAlert(true)}
                                    >
                                        Reset
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App info */}
                    <div className="settings-group">
                        <div className="settings-group-title">Application Info</div>
                        <div className="settings-card" style={{ padding: '16px 20px' }}>
                            <div className="info-row">
                                <span className="info-label">App Name</span>
                                <span className="info-value">Immunization Log</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Marketing Version</span>
                                <span className="info-value">4.0</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Build Number</span>
                                <span className="info-value">1</span>
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
