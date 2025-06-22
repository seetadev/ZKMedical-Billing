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
import { documentText, folder, menu, settings } from "ionicons/icons";
import Home from "./pages/Home";
import FilesPage from "./pages/FilesPage";
import SettingsPage from "./pages/SettingsPage";
import { StarknetProviders } from "./providers/StarknetProviders";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";

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

setupIonicReact();

const AppContent: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <IonApp className={isDarkMode ? "dark-theme" : "light-theme"}>
      <StarknetProviders>
        <InvoiceProvider>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/home">
                  <Home />
                </Route>
                <Route exact path="/files">
                  <FilesPage />
                </Route>
                <Route exact path="/settings">
                  <SettingsPage />
                </Route>
                <Route exact path="/">
                  <Redirect to="/home" />
                </Route>
              </IonRouterOutlet>

              <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/home">
                  <IonIcon icon={documentText} />
                  <IonLabel>Home</IonLabel>
                </IonTabButton>

                <IonTabButton tab="files" href="/files">
                  <IonIcon icon={folder} />
                  <IonLabel>Files</IonLabel>
                </IonTabButton>

                <IonTabButton tab="settings" href="/settings">
                  <IonIcon icon={settings} />
                  <IonLabel>settings</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        </InvoiceProvider>
      </StarknetProviders>
    </IonApp>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
