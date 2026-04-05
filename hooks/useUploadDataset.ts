"use client";

import { useMemo, useState } from "react";
import { useWalletClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useStorageAccount } from "@shelby-protocol/ethereum-kit/react";
import { useUploadBlobs } from "@shelby-protocol/react";
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { Network } from "@aptos-labs/ts-sdk";
import { parseEther } from "viem";
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/contract";
import { generateBlobName, getExpirationMicros } from "@/lib/shelby";

export type UploadState =
  | "idle"
  | "uploading-shelby"
  | "waiting-wallet"
  | "listing-onchain"
  | "done"
  | "error";

export function useUploadDataset() {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: wallet } = useWalletClient();

  const shelbyClient = useMemo(
    () =>
      new ShelbyClient({
        network: Network.SHELBYNET,
        apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY || "",
      }),
    []
  );

  const { storageAccountAddress, signAndSubmitTransaction } = useStorageAccount({
    client: shelbyClient,
    wallet,
  });

  const { mutateAsync: uploadBlobs } = useUploadBlobs({ client: shelbyClient });

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  async function uploadDataset(params: {
    file: File;
    name: string;
    description: string;
    category: string;
    priceEth: string;
  }) {
    if (!wallet?.account.address) {
      setError("Connect your wallet first");
      return;
    }
    if (!storageAccountAddress) {
      setError("Shelby storage account not ready. Please wait.");
      return;
    }

    setError(null);
    setState("uploading-shelby");

    try {
      // Step 1: Upload file to Shelby
      const buffer = await params.file.arrayBuffer();
      const blobName = generateBlobName(params.file.name, wallet.account.address);

      await uploadBlobs({
        signer: { account: storageAccountAddress, signAndSubmitTransaction },
        blobs: [{ blobName, blobData: new Uint8Array(buffer) }],
        expirationMicros: getExpirationMicros(90),
      });

      // Step 2: List dataset on-chain
      setState("waiting-wallet");
      const priceWei = params.priceEth ? parseEther(params.priceEth) : 0n;

      const hash = await writeContractAsync({
        abi: MARKETPLACE_ABI,
        address: MARKETPLACE_ADDRESS,
        functionName: "listDataset",
        args: [
          params.name,
          params.description,
          params.category,
          blobName,
          storageAccountAddress.toString(),
          priceWei,
          BigInt(params.file.size),
        ],
      });

      setTxHash(hash);
      setState("listing-onchain");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setState("error");
    }
  }

  // Transition to done once tx confirmed
  if (isTxConfirmed && state === "listing-onchain") {
    setState("done");
  }

  return {
    uploadDataset,
    state,
    error,
    txHash,
    isTxConfirming,
    isTxConfirmed,
    isStorageReady: !!storageAccountAddress,
    storageAccountAddress,
  };
}
