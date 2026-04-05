"use client";

import { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={false}
        dappConfig={{ network: Network.DEVNET }}
        optInWallets={["Petra", "Nightly"]}
        onError={(error) => console.error("Wallet error:", error)}
      >
        {children}
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
