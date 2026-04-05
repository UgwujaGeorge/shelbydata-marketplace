"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS, DatasetPublic } from "@/lib/contract";

export function useDatasetCount() {
  return useReadContract({
    abi: MARKETPLACE_ABI,
    address: MARKETPLACE_ADDRESS,
    functionName: "datasetCount",
  });
}

export function useDataset(id: bigint) {
  return useReadContract({
    abi: MARKETPLACE_ABI,
    address: MARKETPLACE_ADDRESS,
    functionName: "getDatasetPublic",
    args: [id],
    query: { enabled: id >= BigInt(0) },
  });
}

export function useDatasetFull(id: bigint) {
  return useReadContract({
    abi: MARKETPLACE_ABI,
    address: MARKETPLACE_ADDRESS,
    functionName: "getDataset",
    args: [id],
    query: { enabled: id >= BigInt(0) },
  });
}

export function useHasAccess(id: bigint, user: `0x${string}` | undefined) {
  return useReadContract({
    abi: MARKETPLACE_ABI,
    address: MARKETPLACE_ADDRESS,
    functionName: "hasAccess",
    args: [id, user as `0x${string}`],
    query: { enabled: !!user },
  });
}

export function useCreatorDatasets(creator: `0x${string}` | undefined) {
  return useReadContract({
    abi: MARKETPLACE_ABI,
    address: MARKETPLACE_ADDRESS,
    functionName: "getCreatorDatasets",
    args: [creator as `0x${string}`],
    query: { enabled: !!creator },
  });
}

// Fetch multiple datasets at once given an array of IDs
export function useMultipleDatasets(ids: bigint[]) {
  return useReadContracts({
    contracts: ids.map((id) => ({
      abi: MARKETPLACE_ABI,
      address: MARKETPLACE_ADDRESS,
      functionName: "getDatasetPublic" as const,
      args: [id] as const,
    })),
    query: { enabled: ids.length > 0 },
  });
}

// Parse the tuple returned by getDatasetPublic into a typed object
export function parseDatasetPublic(
  raw: readonly [bigint, `0x${string}`, string, string, string, bigint, bigint, bigint, bigint, boolean]
): DatasetPublic {
  return {
    id: raw[0],
    creator: raw[1],
    name: raw[2],
    description: raw[3],
    category: raw[4],
    price: raw[5],
    fileSize: raw[6],
    downloadCount: raw[7],
    createdAt: raw[8],
    active: raw[9],
  };
}
