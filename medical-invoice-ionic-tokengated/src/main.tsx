import React from "react";
import { createRoot } from "react-dom/client";
import { MetaMaskProvider } from "@metamask/sdk-react";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Medical Invoice Suite",
          url: window.location.href,
        },
        infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY,
      }}
    >
      <App />
    </MetaMaskProvider>
  </React.StrictMode>
);
