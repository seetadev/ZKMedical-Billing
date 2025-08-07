import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonIcon,
  IonLabel,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { documentText, folder, menu, settings, home } from "ionicons/icons";
import Home from "./pages/Home";
import FilesPage from "./pages/FilesPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import WalletTestPage from "./pages/WalletTestPage";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import { usePWA } from "./hooks/usePWA";

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

  return (
    <IonApp className={isDarkMode ? "dark-theme" : "light-theme"}>
      <InvoiceProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/">
              <LandingPage />
            </Route>
            <Route exact path="/wallet-test">
              <WalletTestPage />
            </Route>
            <Route path="/app">
              <IonTabs>
                <IonRouterOutlet>
                  <Route exact path="/app/editor">
                    {!isOnline && <OfflineIndicator />}
                    <Home />
                  </Route>
                  <Route exact path="/app/files">
                    {!isOnline && <OfflineIndicator />}
                    <FilesPage />
                  </Route>
                  <Route exact path="/app/settings">
                    {!isOnline && <OfflineIndicator />}
                    <SettingsPage />
                  </Route>
                  <Route exact path="/app">
                    <Redirect to="/app/editor" />
                  </Route>
                </IonRouterOutlet>

                <IonTabBar slot="bottom">
                  <IonTabButton tab="editor" href="/app/editor">
                    <IonIcon icon={documentText} />
                    <IonLabel>Editor</IonLabel>
                  </IonTabButton>

                  <IonTabButton tab="files" href="/app/files">
                    <IonIcon icon={folder} />
                    <IonLabel>Files</IonLabel>
                  </IonTabButton>

                  <IonTabButton tab="settings" href="/app/settings">
                    <IonIcon icon={settings} />
                    <IonLabel>Settings</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
        <PWAUpdatePrompt />
      </InvoiceProvider>
    </IonApp>
  );
};

const App: React.FC = () => (
  <StarknetProviders>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </StarknetProviders>
);

export default App;
