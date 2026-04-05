import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These Aptos/Shelby packages include Node.js-specific code (aptos-client
  // uses `got` for HTTP). Marking them as server-external means they run as
  // real Node.js modules (not bundled by Turbopack), which lets `got` resolve
  // correctly. On the client side they load the browser build automatically.
  serverExternalPackages: [
    "@aptos-labs/aptos-client",
    "@aptos-labs/ts-sdk",
    "@aptos-labs/wallet-standard",
    "@aptos-labs/derived-wallet-base",
    "@aptos-labs/derived-wallet-ethereum",
    "@shelby-protocol/sdk",
    "@shelby-protocol/ethereum-kit",
    "@shelby-protocol/react",
    "@shelby-protocol/clay-codes",
  ],
  turbopack: {},
};

export default nextConfig;
