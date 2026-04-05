export const MARKETPLACE_ABI = [
  // Read
  {
    inputs: [],
    name: "datasetCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "datasetId", type: "uint256" }],
    name: "getDatasetPublic",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "fileSize", type: "uint256" },
      { internalType: "uint256", name: "downloadCount", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "datasetId", type: "uint256" }],
    name: "getDataset",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "string", name: "shelbyBlobName", type: "string" },
      { internalType: "string", name: "shelbyAccount", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "fileSize", type: "uint256" },
      { internalType: "uint256", name: "downloadCount", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "datasetId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "hasAccess",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "creator", type: "address" }],
    name: "getCreatorDatasets",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeeBps",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "string", name: "shelbyBlobName", type: "string" },
      { internalType: "string", name: "shelbyAccount", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "fileSize", type: "uint256" },
    ],
    name: "listDataset",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "datasetId", type: "uint256" }],
    name: "purchase",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "datasetId", type: "uint256" }],
    name: "deactivateDataset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "category", type: "string" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "fileSize", type: "uint256" },
    ],
    name: "DatasetListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "DatasetPurchased",
    type: "event",
  },
] as const;

export const MARKETPLACE_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000";

export const SEPOLIA_CHAIN_ID = 11155111;

export type DatasetPublic = {
  id: bigint;
  creator: `0x${string}`;
  name: string;
  description: string;
  category: string;
  price: bigint;
  fileSize: bigint;
  downloadCount: bigint;
  createdAt: bigint;
  active: boolean;
};

export type DatasetFull = DatasetPublic & {
  shelbyBlobName: string;
  shelbyAccount: string;
};

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

export function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  if (eth === 0) return "Free";
  if (eth < 0.001) return `${(eth * 1000).toFixed(3)} mETH`;
  return `${eth.toFixed(4)} ETH`;
}
