import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import App from "./App";

const filecoinCalibration = {
    id:             314159,
    name:           "Filecoin Calibration",
    nativeCurrency: { name: "tFIL", symbol: "tFIL", decimals: 18 },
    rpcUrls:        { default: { http: ["https://api.calibration.node.glif.io/rpc/v1"] } },
    blockExplorers: { default: { name: "Filfox", url: "https://calibration.filfox.info" } },
} as const;

const optimismSepolia = {
    id:             11155420,
    name:           "Optimism Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls:        { default: { http: ["https://sepolia.optimism.io"] } },
    blockExplorers: { default: { name: "Blockscout", url: "https://optimism-sepolia.blockscout.com" } },
} as const;

const config = getDefaultConfig({
    appName:    "OP Medicine ZK Billing",
    projectId:  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "",
    chains:     [filecoinCalibration, optimismSepolia],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <App />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    </React.StrictMode>
);
