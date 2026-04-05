"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// Load all Web3/Shelby providers only on the client side.
// These SDKs depend on browser-only APIs and Node.js-specific
// submodules that break during static generation.
const Providers = dynamic(
  () => import("./providers").then((m) => m.Providers),
  { ssr: false }
);

export function DynamicProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
