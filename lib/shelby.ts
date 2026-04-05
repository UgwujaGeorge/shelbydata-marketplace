import { Network } from "@aptos-labs/ts-sdk";

export const SHELBY_NETWORK = Network.SHELBYNET;
export const SHELBY_API_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY || "";

// Expiration: 90 days from now in microseconds
export function getExpirationMicros(days = 90): number {
  return Date.now() * 1000 + days * 86400 * 1_000_000;
}

// Generate a unique blob name for a dataset file
export function generateBlobName(fileName: string, address: string): string {
  const timestamp = Date.now();
  const clean = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `dataset_${address.slice(2, 8)}_${timestamp}_${clean}`;
}
