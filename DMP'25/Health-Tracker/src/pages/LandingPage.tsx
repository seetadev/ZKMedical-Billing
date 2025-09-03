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
  nutritionOutline,
  fitnessOutline,
  scaleOutline,
  barChartOutline,
  calendarOutline,
  heartOutline,
  arrowForward,
  checkmarkCircle,
  restaurantOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { markUserAsExisting } from "../utils/helper";
// import { cloudService } from "../services/cloud-service";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const history = useHistory();

  // Check authentication status on component mount
  useEffect(() => {
    // if (cloudService.isAuthenticated()) {
    //   history.push("/app/files");
    // }
  }, [history]);

  const handleGetStarted = () => {
    try {
      // Mark user as existing (no longer new)
      markUserAsExisting();

      // Navigate to the files page - use replace to avoid back button issues

      history.replace("/app/files");
    } catch (error) {
      console.error("Error in handleGetStarted:", error);
    }
  };

  const features = [
    {
      icon: nutritionOutline,
      title: "Diet Logging",
      description:
        "Track your daily meals, calories, and nutritional intake with ease",
    },
    {
      icon: restaurantOutline,
      title: "Nutrition Tracking",
      description:
        "Monitor macros, vitamins, and minerals to optimize your health",
    },
    {
      icon: scaleOutline,
      title: "Weight Tracking",
      description:
        "Monitor your weight progress with detailed charts and trends",
    },
    {
      icon: fitnessOutline,
      title: "Exercise Tracking",
      description:
        "Log workouts, track progress, and achieve your fitness goals",
    },
    {
      icon: barChartOutline,
      title: "Health Analytics",
      description:
        "Comprehensive reports and insights about your health journey",
    },
    {
      icon: heartOutline,
      title: "Wellness Templates",
      description: "Pre-built templates for common health and fitness goals",
    },
  ];

  const benefits = [
    "Track nutrition and calories with 95% accuracy",
    "Monitor weight trends and health progress",
    "Log workouts and exercise routines effortlessly",
    "Generate detailed health and fitness reports",
    "Set and achieve personalized wellness goals",
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Health Tracker - Your Wellness Journey</IonTitle>
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
                    <IonIcon icon={heartOutline} />
                  </div>
                  <h1 className="hero-title">
                    Transform Your
                    <span className="highlight"> Health Journey</span>
                  </h1>
                  <p className="hero-subtitle">
                    A comprehensive health tracking application designed to help
                    you monitor nutrition, weight, exercise, and overall
                    wellness. Track your progress and achieve your health goals.
                  </p>
                  <div className="cta-buttons">
                    <IonButton
                      expand="block"
                      size="large"
                      className="primary-cta"
                      onClick={handleGetStarted}
                    >
                      Start Your Health Journey
                      <IonIcon icon={arrowForward} slot="end" />
                    </IonButton>
                    <IonText className="trial-text">
                      <small>
                        Science-based • Privacy-first • Goal-oriented
                      </small>
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
                  <h2>Comprehensive Health Tracking Features</h2>
                  <p>
                    Everything you need for effective health monitoring and
                    wellness management
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
                  <h2>Why Choose Our Health Tracking Solution?</h2>
                  <p className="benefits-intro">
                    Join thousands of users who have transformed their health
                    journey with our comprehensive, science-based tracking
                    platform.
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
                    <h3>10k+</h3>
                    <p>Active Users</p>
                  </div>
                  <div className="stat-card">
                    <h3>95%</h3>
                    <p>Goal Achievement</p>
                  </div>
                  <div className="stat-card">
                    <h3>24/7</h3>
                    <p>Tracking</p>
                  </div>
                  <div className="stat-card">
                    <h3>100%</h3>
                    <p>Privacy Protected</p>
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
                    <h2>Ready to Start Your Health Journey?</h2>
                    <p>
                      Begin tracking your nutrition, weight, exercise, and
                      wellness goals today with our comprehensive health
                      monitoring platform.
                    </p>
                    <IonButton
                      expand="block"
                      size="large"
                      className="cta-button"
                      onClick={handleGetStarted}
                    >
                      Access Health Dashboard
                      <IonIcon icon={arrowForward} slot="end" />
                    </IonButton>
                    <div className="feature-chips">
                      <IonChip>Science-Based</IonChip>
                      <IonChip>Privacy Protected</IonChip>
                      <IonChip>Goal-Oriented</IonChip>
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
