import { IonApp, IonRouterOutlet, IonContent, IonPage, setupIonicReact, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect, useHistory, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { homeOutline, folderOutline, settingsOutline } from "ionicons/icons";
import SocialCalcPage from "./pages/SocialCalcPage";
import OnboardingPage from "./pages/OnboardingPage";
import FilesPage from "./pages/FilesPage";
import SettingsPage from "./pages/SettingsPage";

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

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--ion-color-primary, #3880ff)', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
          >
            Try Again
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
}

const HomeRedirect: React.FC = () => {
  const savedFile = localStorage.getItem("home-maintenance-selected-file");
  let isSaved = false;
  if (savedFile && savedFile !== "default" && savedFile !== "budget" && savedFile !== "" && savedFile !== "file_not_found") {
    try {
      const rawInvoices = localStorage.getItem("home_maintenance_invoices");
      const invoices = rawInvoices ? JSON.parse(rawInvoices) : [];
      isSaved = invoices.some((i: any) => i.id === savedFile);
    } catch (e) {
      // ignore
    }
  }
  if (isSaved) {
    return <Redirect to={`/app/tabs/home/${savedFile}`} />;
  } else {
    let templateId = localStorage.getItem('home-maintenance-active-template-id');
    if (!templateId) {
      const isTabletDevice = (window.innerWidth >= 768);
      templateId = isTabletDevice ? "100002" : "100001";
    }
    return <Redirect to={`/app/tabs/home/new-template-${templateId}`} />;
  }
};

const MainTabs: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  // Determine current active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/app/tabs/home")) return "home";
    if (path.startsWith("/app/tabs/files")) return "files";
    if (path.startsWith("/app/tabs/settings")) return "settings";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/tabs/home/:fileName" component={SocialCalcPage} />
        <Route exact path="/app/tabs/home" component={HomeRedirect} />
        <Route exact path="/app/tabs/files" component={FilesPage} />
        <Route exact path="/app/tabs/settings" component={SettingsPage} />
        <Route exact path="/app/tabs">
          <Redirect to="/app/tabs/home" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom" translucent={false} style={{ borderTop: '1px solid var(--ion-color-step-150, #e2e8f0)' }}>
        <IonTabButton
          tab="home"
          selected={activeTab === "home"}
          className={activeTab === "home" ? "tab-selected" : ""}
          onClick={() => history.push("/app/tabs/home")}
        >
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab="files"
          selected={activeTab === "files"}
          className={activeTab === "files" ? "tab-selected" : ""}
          onClick={() => history.push("/app/tabs/files")}
        >
          <IonIcon icon={folderOutline} />
          <IonLabel>Files</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab="settings"
          selected={activeTab === "settings"}
          className={activeTab === "settings" ? "tab-selected" : ""}
          onClick={() => history.push("/app/tabs/settings")}
        >
          <IonIcon icon={settingsOutline} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const AppContent: React.FC = () => {
  // Check if onboarding is completed
  const isOnboardingCompleted = localStorage.getItem("onboarding_completed") === "true";

  return (
    <IonApp className="light-theme">
      <InvoiceProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            {/* Onboarding / Welcome Page */}
            <Route exact path="/" render={() =>
              isOnboardingCompleted ? <Redirect to="/app/tabs/home" /> : <OnboardingPage />
            } />

            {/* Main Tabs Navigation */}
            <Route path="/app/tabs" component={MainTabs} />

            {/* Editor Legacy Route Redirects */}
            <Route exact path="/app/editor/:fileName" render={(props: any) => (
              <Redirect to={`/app/tabs/home/${props.match.params.fileName}`} />
            )} />
            <Route exact path="/app/editor" render={() => (
              <Redirect to="/app/tabs/home" />
            )} />

            {/* Dashboard Legacy Route Redirects */}
            <Route path="/app/dashboard" render={() => (
              <Redirect to="/app/tabs/home" />
            )} />

            {/* Legacy Redirects */}
            <Route exact path="/app/files">
              <Redirect to="/app/tabs/files" />
            </Route>
            <Route exact path="/app/settings">
              <Redirect to="/app/tabs/settings" />
            </Route>
            <Route exact path="/app/invoice-ai/:templateId">
              <Redirect to="/app/tabs/home" />
            </Route>
            <Route exact path="/app/invoice-ai">
              <Redirect to="/app/tabs/home" />
            </Route>
            <Route exact path="/app/invoice-store">
              <Redirect to="/app/tabs/home" />
            </Route>
            <Route exact path="/app">
              <Redirect to="/app/tabs/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </InvoiceProvider>
    </IonApp>
  );
};

const App: React.FC = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
    <AppContent />
  </ErrorBoundary>
);

export default App;
