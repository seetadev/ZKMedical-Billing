import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import FilesPage from "./pages/FilesPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import { usePWA } from "./hooks/usePWA";
import { isNewUser } from "./utils/helper";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./App.css";
import { StarknetProviders } from "./providers/StarknetProviders";

setupIonicReact();

const AppContent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { isOnline } = usePWA();
  const [showLandingPage, setShowLandingPage] = useState(isNewUser());

  // Listen for storage changes to update landing page visibility
  useEffect(() => {
    const handleStorageChange = () => {
      setShowLandingPage(isNewUser());
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for changes made in the same tab
    const interval = setInterval(() => {
      setShowLandingPage(isNewUser());
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <IonApp className={isDarkMode ? "dark-theme" : "light-theme"}>
      <InvoiceProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/">
              {showLandingPage ? <LandingPage /> : <Redirect to="/app/files" />}
            </Route>
            <Route path="/app">
              {!isOnline && <OfflineIndicator />}
              <IonRouterOutlet>
                <Route exact path="/app/editor/:fileName">
                  <Home />
                </Route>
                <Route exact path="/app/editor">
                  <Home />
                </Route>
                <Route exact path="/app/files">
                  <FilesPage />
                </Route>
                <Route exact path="/app/settings">
                  <SettingsPage />
                </Route>
                <Route exact path="/app">
                  <Redirect to="/app/files" />
                </Route>
              </IonRouterOutlet>
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
        <PWAUpdatePrompt />
      </InvoiceProvider>
    </IonApp>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <StarknetProviders>
    <AppContent />
  </StarknetProviders>
  </ThemeProvider>
);

export default App;
