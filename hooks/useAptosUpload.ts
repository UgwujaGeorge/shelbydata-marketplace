"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUploadBlobs } from "@shelby-protocol/react";
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { Network } from "@aptos-labs/ts-sdk";
import { aptos, MARKETPLACE_ADDRESS, MODULE_NAME, aptToOcta } from "@/lib/aptos";

export type UploadState =
  | "idle"
  | "uploading-shelby"
  | "waiting-wallet"
  | "confirming"
  | "done"
  | "error";

function generateBlobName(fileName: string, address: string): string {
  const clean = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `dataset_${address.slice(2, 8)}_${Date.now()}_${clean}`;
}

function getExpirationMicros(): number {
  return Date.now() * 1000 + 90 * 86400 * 1_000_000;
}

export function useAptosUpload() {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();

  const { account, signAndSubmitTransaction } = useWallet();

  const shelbyClient = useMemo(
    () =>
      new ShelbyClient({
        network: Network.SHELBYNET,
        apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY || "",
      }),
    []
  );

  const { mutateAsync: uploadBlobs } = useUploadBlobs({ client: shelbyClient });

  async function uploadDataset(params: {
    file: File;
    name: string;
    description: string;
    category: string;
    priceApt: string;
  }) {
    if (!account?.address?.toString()) {
      setError("Connect your Aptos wallet first.");
      return;
    }

    setError(null);
    setState("uploading-shelby");

    try {
      // Step 1: Upload file to Shelby using Aptos wallet as signer
      const buffer = await params.file.arrayBuffer();
      const blobName = generateBlobName(params.file.name, account.address.toString());

      await uploadBlobs({
        signer: {
          account: { address: account.address.toString() },
          signAndSubmitTransaction,
        },
        blobs: [{ blobName, blobData: new Uint8Array(buffer) }],
        expirationMicros: getExpirationMicros(),
      });

      // Step 2: List on-chain via Move entry function
      setState("waiting-wallet");

      // Derive the Shelby storage account address (same as Aptos account since we use native Aptos wallet)
      const shelbyAccount = account.address.toString();
      const priceOcta = params.priceApt ? aptToOcta(parseFloat(params.priceApt)) : BigInt(0);

      const response = await signAndSubmitTransaction({
        data: {
          function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::list_dataset`,
          typeArguments: [],
          functionArguments: [
            params.name,
            params.description,
            params.category,
            blobName,
            shelbyAccount,
            priceOcta.toString(),
            params.file.size.toString(),
            MARKETPLACE_ADDRESS,
          ],
        },
      });

      setTxHash(response.hash);
      setState("confirming");

      await aptos.waitForTransaction({ transactionHash: response.hash });
      setState("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg.slice(0, 200));
      setState("error");
    }
  }

  return { uploadDataset, state, error, txHash };
}
