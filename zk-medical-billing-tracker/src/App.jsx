import {
  IonApp,
  IonContent,
  IonRouterOutlet,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import HomePage from "./pages/HomePage";

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

import { NextUIProvider } from "@nextui-org/react";
import Invoices from "./pages/Invoices";
import Calendar from "./pages/Calendar.jsx";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { initializeFirebase } from "./Firebase/index";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import useUser from "./hooks/useUser";
import NewInvoice from "./pages/NewInvoice";
import ViewInvoice from "./pages/ViewInvoice";
import UpdateInvoice from "./pages/UpdateInvoice";

setupIonicReact();

const routes = [
  { path: "/", components: [<Navbar />, <HomePage />] },
  {
    path: "/invoices",
    components: [<Navbar />, <Invoices />],
  },
  {
    path: "/calendar",
    components: [<Navbar />, <Calendar />],
  },
  {
    path: "/settings",
    components: [<Navbar />, <Settings />],
  },
  {
    path: "/invoices/new",
    components: [<Navbar />, <NewInvoice />],
  },
  {
    path: "/invoices/view/:uid",
    components: [<Navbar />, <ViewInvoice />],
  },
  {
    path: "/invoices/update/:uid",
    components: [<Navbar />, <UpdateInvoice />],
  },
];

const App = () => {
  const user = useUser();
  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <NextUIProvider>
      <IonApp className="dark">
        <IonReactRouter>
          <IonRouterOutlet id="main">
            {routes.map((route) => (
              <Route key={route.path} path={route.path} exact={true}>
                {!user ? (
                  <Route render={() => <Redirect to="/auth" />} />
                ) : (
                  <IonContent>
                    <div className="w-full h-full flex">
                      {...route.components}
                    </div>
                  </IonContent>
                )}
              </Route>
            ))}
            <Route path="/auth" exact={true}>
              {user ? (
                <Route render={() => <Redirect to="/" />} />
              ) : (
                <IonContent>
                  <div className="w-full h-full flex">
                    <Auth />
                  </div>
                </IonContent>
              )}
            </Route>
            <Route>
              <IonContent>
                <div className="w-full h-full flex">
                  <Navbar />
                  <div className="underline underline-offset-2 text-xl grid place-items-center mx-auto">
                    404 Page Not Found
                  </div>
                </div>
              </IonContent>
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </NextUIProvider>
  );
};

export default App;
