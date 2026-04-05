import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const APTOS_NETWORK = Network.DEVNET;
export const MARKETPLACE_ADDRESS = "0xce6d9b08677578e07199626a0bc4e3f94cafa740f896706c337811bc0ffb27f6";
export const MODULE_NAME = "dataset_marketplace";

export const aptos = new Aptos(new AptosConfig({ network: APTOS_NETWORK }));

// 1 APT = 1e8 octa
export function octaToApt(octa: bigint | number): number {
  return Number(octa) / 1e8;
}
export function aptToOcta(apt: number): bigint {
  return BigInt(Math.round(apt * 1e8));
}
export function formatApt(octa: bigint | number): string {
  const n = octaToApt(octa);
  if (n === 0) return "Free";
  if (n < 0.001) return `${(n * 1000).toFixed(4)} mAPT`;
  return `${n.toFixed(4)} APT`;
}
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export const CATEGORIES = [
  "NLP / Text",
  "Computer Vision",
  "Tabular / Structured",
  "Audio / Speech",
  "Multimodal",
  "Time Series",
  "Reinforcement Learning",
  "Other",
];

export type DatasetPublic = {
  id: number;
  creator: string;
  name: string;
  description: string;
  category: string;
  price: bigint;      // in octa
  fileSize: number;
  downloadCount: number;
  createdAt: number;
  active: boolean;
};

export type DatasetFull = DatasetPublic & {
  shelbyBlobName: string;
  shelbyAccount: string;
};

// Parse the tuple returned by get_dataset_public view function
export function parseDatasetPublic(raw: unknown[]): DatasetPublic {
  return {
    id: Number(raw[0]),
    creator: raw[1] as string,
    name: raw[2] as string,
    description: raw[3] as string,
    category: raw[4] as string,
    price: BigInt(raw[5] as string),
    fileSize: Number(raw[6]),
    downloadCount: Number(raw[7]),
    createdAt: Number(raw[8]),
    active: raw[9] as boolean,
  };
}
