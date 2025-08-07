import React, { useEffect } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonText,
  IonChip,
} from "@ionic/react";
import {
  documentTextOutline,
  calculatorOutline,
  cloudOutline,
  analyticsOutline,
  printOutline,
  shieldCheckmarkOutline,
  arrowForward,
  checkmarkCircle,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { cloudService } from "../services/cloud-service";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const history = useHistory();

  // Check authentication status on component mount
  useEffect(() => {
    if (cloudService.isAuthenticated()) {
      history.replace("/app/editor");
    }
  }, [history]);

  const handleGetStarted = () => {
    history.push("/app/editor");
  };

  const features = [
    {
      icon: documentTextOutline,
      title: "Invoice Management",
      description:
        "Create, edit, and manage government invoices with ease and precision",
    },
    {
      icon: calculatorOutline,
      title: "Tax Calculations",
      description:
        "Automated tax calculations with government compliance standards",
    },
    {
      icon: analyticsOutline,
      title: "Financial Analytics",
      description:
        "Comprehensive reporting and analytics for better financial insights",
    },
    {
      icon: cloudOutline,
      title: "Cloud Storage",
      description:
        "Secure cloud-based storage with automatic backup and synchronization",
    },
    {
      icon: shieldCheckmarkOutline,
      title: "Government Compliant",
      description:
        "Fully compliant with government billing standards and regulations",
    },
    {
      icon: printOutline,
      title: "Professional Templates",
      description:
        "Government-approved invoice templates ready for official use",
    },
  ];

  const benefits = [
    "Streamline government billing processes by 90%",
    "Ensure 100% compliance with regulations",
    "Generate detailed financial reports",
    "Manage multiple departments and projects",
    "Integrate with existing government systems",
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Government Invoice Billing Solution</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={`landing-page ${isDarkMode ? "dark" : "light"}`}>
        {/* Hero Section */}
        <div className="hero-section">
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="8" sizeLg="6">
                <div className="hero-content">
                  <div className="hero-icon">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <h1 className="hero-title">
                    Streamline Your
                    <span className="highlight"> Government Billing</span>
                  </h1>
                  <p className="hero-subtitle">
                    A comprehensive government-compliant billing solution
                    designed for public sector organizations. Create, manage,
                    and track invoices with complete regulatory compliance.
                  </p>
                  <div className="cta-buttons">
                    <IonButton
                      expand="block"
                      size="large"
                      className="primary-cta"
                      onClick={handleGetStarted}
                    >
                      Start Creating Invoices
                      <IonIcon icon={arrowForward} slot="end" />
                    </IonButton>
                    <IonText className="trial-text">
                      <small>Government-approved • Secure • Compliant</small>
                    </IonText>
                  </div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <div className="section-header">
                  <h2>Comprehensive Government Billing Features</h2>
                  <p>
                    Everything you need for efficient and compliant government
                    invoice management
                  </p>
                </div>
              </IonCol>
            </IonRow>
            <IonRow>
              {features.map((feature, index) => (
                <IonCol key={index} size="12" sizeMd="6" sizeLg="4">
                  <IonCard className="feature-card">
                    <IonCardContent>
                      <div className="feature-icon">
                        <IonIcon icon={feature.icon} />
                      </div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section">
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="12" sizeLg="6">
                <div className="benefits-content">
                  <h2>Why Choose Our Government Billing Solution?</h2>
                  <p className="benefits-intro">
                    Join government organizations across the country that have
                    modernized their billing processes with our secure,
                    compliant platform.
                  </p>
                  <div className="benefits-list">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="benefit-item">
                        <IonIcon icon={checkmarkCircle} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </IonCol>
              <IonCol size="12" sizeLg="6">
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>500+</h3>
                    <p>Government Agencies</p>
                  </div>
                  <div className="stat-card">
                    <h3>99.9%</h3>
                    <p>Compliance Rate</p>
                  </div>
                  <div className="stat-card">
                    <h3>24/7</h3>
                    <p>Support</p>
                  </div>
                  <div className="stat-card">
                    <h3>100%</h3>
                    <p>Secure</p>
                  </div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="8">
                <IonCard className="cta-card">
                  <IonCardContent>
                    <h2>Ready to Modernize Your Government Billing?</h2>
                    <p>
                      Start creating professional, compliant invoices today with
                      our government-approved billing solution.
                    </p>
                    <IonButton
                      expand="block"
                      size="large"
                      className="cta-button"
                      onClick={handleGetStarted}
                    >
                      Access Invoice Editor
                      <IonIcon icon={arrowForward} slot="end" />
                    </IonButton>
                    <div className="feature-chips">
                      <IonChip>Government Approved</IonChip>
                      <IonChip>Secure & Compliant</IonChip>
                      <IonChip>Multi-Department Support</IonChip>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LandingPage;
