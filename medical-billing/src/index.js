import React from "react";
import App from "./App/App";
import "./index.css";
import { createRoot } from "react-dom/client";
import { Web3Provider } from "./utils/Web3Provider";

const domNode = document.getElementById("root");
const root = createRoot(domNode);
root.render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
