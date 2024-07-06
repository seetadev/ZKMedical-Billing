import { WagmiProvider, createConfig, http } from "wagmi";
import { optimismSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [optimismSepolia],
    transports: {
      [optimismSepolia.id]: http(
        `https://opt-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_ID}`
      ),
    },

    walletConnectProjectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,

    appName: "Web3 Medical Invoice Dapp",

    appDescription: "A Dapp to create and manage medical invoices.",
    appUrl: "https://family.co",
    appIcon: "https://family.co/logo.png",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            "--ck-accent-color": "#9b4dca",
            "--ck-accent-text-color": "#ffffff",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
