"use client";
import { ReactNode } from "react";

import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  argent,
  braavos,
  useInjectedConnectors,
  jsonRpcProvider,
  voyager,
} from "@starknet-react/core";

export function StarknetProviders({ children }: { children: ReactNode }) {
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [argent(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: "onlyIfNoConnectors",
    // Randomize the order of the connectors.
    order: "random",
  });

  const rpcUrl =
    import.meta.env.VITE_STARKNET_RPC_URL ||
    "https://starknet-sepolia.infura.io/v3/1fb9f9af8b8f457a918ca9697c57f1ad";

  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={jsonRpcProvider({
        rpc: (chain) => ({
          nodeUrl:
            chain.id === mainnet.id
              ? "https://starknet-sepolia.infura.io/v3/1fb9f9af8b8f457a918ca9697c57f1ad"
              : rpcUrl,
        }),
      })}
      connectors={connectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}
