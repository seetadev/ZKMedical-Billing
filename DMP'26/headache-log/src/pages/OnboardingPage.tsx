import React, { useEffect } from "react";
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    useIonAlert,
} from "@ionic/react";
import { App as CapacitorApp } from '@capacitor/app';
import {
    checkmarkCircle,
} from "ionicons/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useStatusBar, StatusBarPresets } from "../hooks/useStatusBar";
import { WelcomeIcon } from "../components/OnboardingIcons";
import "./OnboardingPage.css";

const OnboardingPage: React.FC = () => {
    const [presentAlert] = useIonAlert();

    // Use StatusBar
    useStatusBar(StatusBarPresets.light);

    // Handle Hardware Back Button
    useEffect(() => {
        const handleBackButton = (ev: any) => {
            ev.detail.register(10, () => {
                presentAlert({
                    header: 'Exit App',
                    message: 'Are you sure you want to exit?',
                    buttons: [
                        { text: 'Cancel', role: 'cancel' },
                        { text: 'Exit', handler: () => CapacitorApp.exitApp() }
                    ]
                });
            });
        };

        document.addEventListener('ionBackButton', handleBackButton);
        return () => {
            document.removeEventListener('ionBackButton', handleBackButton);
        };
    }, [presentAlert]);

    return (
        <IonPage className="onboarding-page light">
            <IonContent fullscreen className="onboarding-content">
                <div className="onboarding-main">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="step-container"
                        >
                            {/* Step Header */}
                            <div className="step-header">
                                <div
                                    className="step-icon"
                                    style={{ backgroundColor: `var(--ion-color-primary-rgb)` }}
                                >
                                    <WelcomeIcon color="var(--ion-color-primary)" size={40} />
                                </div>
                                 <h1 className="step-title">Welcome to Headache Log</h1>
                                <p className="step-subtitle">Track headache episodes, triggers, and medications — all offline.</p>
                            </div>

                            {/* Step Content */}
                            <div className="step-content">
                                <div className="onboarding-welcome">
                                    <div className="welcome-features">
                                        <div className="feature-item">
                                            <IonIcon icon={checkmarkCircle} color="success" />
                                            <span>Log daily headache episodes with date, time, duration, pain scale, and symptoms</span>
                                        </div>
                                        <div className="feature-item">
                                            <IonIcon icon={checkmarkCircle} color="success" />
                                            <span>Record activity and food/water triggers linked to each headache episode</span>
                                        </div>
                                        <div className="feature-item">
                                            <IonIcon icon={checkmarkCircle} color="success" />
                                            <span>Manage your full medication history, dosage schedule, and pharmacy contacts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Onboarding Footer */}
                <div className="onboarding-footer">
                    {/* Navigation Buttons */}
                    <div className="nav-buttons">
                        <IonButton
                            expand="block"
                            className="action-btn"
                            href="/app/tabs/home"
                            onClick={() => localStorage.setItem("onboarding_completed", "true")}
                            style={{
                                "--background": "var(--ion-color-primary)",
                            }}
                        >
                            Get Started
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default OnboardingPage;
