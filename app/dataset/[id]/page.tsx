"use client";

import { use, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataset, useHasAccess, useDatasetBlob } from "@/hooks/useAptosDatasets";
import { aptos, MARKETPLACE_ADDRESS, MODULE_NAME, formatApt, formatFileSize } from "@/lib/aptos";
import {
  Download, HardDrive, Clock, User, Tag, CheckCircle2,
  Loader2, ArrowLeft, Lock, Unlock, Copy,
  Terminal, Code2, ExternalLink, ShieldCheck, AlertCircle,
} from "lucide-react";

function timeAgo(sec: number): string {
  const diff = Math.floor(Date.now() / 1000) - sec;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg border border-white/8 bg-white/4 text-[oklch(0.42_0.02_225)] hover:text-teal-300 hover:border-teal-500/25 transition-all"
    >
      {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function DatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const datasetId = parseInt(id);

  const { connected, account, signAndSubmitTransaction } = useWallet();
  const address = account?.address?.toString() ?? null;

  const { dataset, isLoading, error: datasetError } = useDataset(datasetId);
  const { hasAccess, refetch: refetchAccess } = useHasAccess(datasetId, address);
  const blobData = useDatasetBlob(datasetId, hasAccess ? address : null);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  async function handlePurchase() {
    if (!connected || !dataset) return;
    setIsPurchasing(true);
    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::purchase`,
          typeArguments: [],
          functionArguments: [datasetId.toString(), MARKETPLACE_ADDRESS],
        },
      });
      setTxHash(response.hash);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      toast.success("Purchase confirmed! Access granted.");
      await refetchAccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      toast.error(msg.slice(0, 120));
    } finally {
      setIsPurchasing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-7 w-40 rounded-2xl bg-white/4" />
        <Skeleton className="h-72 rounded-3xl bg-white/4" />
        <Skeleton className="h-48 rounded-3xl bg-white/4" />
      </div>
    );
  }

  if (datasetError || !dataset) {
    return (
      <div className="flex flex-col items-center py-32 text-center gap-5">
        {datasetError ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 max-w-md text-left">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{datasetError}</p>
            </div>
          </>
        ) : (
          <p className="text-xl font-bold text-white">Dataset not found</p>
        )}
        <Link href="/" className={buttonVariants({ variant: "outline", className: "border-white/8 bg-white/4 rounded-2xl" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Marketplace
        </Link>
      </div>
    );
  }

  const isFree = dataset.price === 0n;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.42_0.02_225)] hover:text-teal-300 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Marketplace
      </Link>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[oklch(0.11_0.02_225/0.9)]">
        {/* Top gradient stripe */}
        <div className="h-[2px] w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500" />

        {/* Orb */}
        <div className="orb w-64 h-64 bg-[oklch(0.72_0.17_192/0.07)] -top-10 -right-10" />

        <div className="relative p-7 space-y-6">
          {/* Title + price */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center rounded-xl border border-teal-500/20 bg-teal-500/8 px-3 py-1 text-xs font-semibold text-teal-300">
                  {dataset.category}
                </span>
                {!dataset.active && (
                  <span className="inline-flex items-center rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-1 text-xs font-semibold text-red-400">
                    Inactive
                  </span>
                )}
                {hasAccess && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <Unlock className="h-3 w-3" />Access Granted
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white leading-snug">{dataset.name}</h1>
            </div>
            <div className="shrink-0 text-right">
              {isFree ? (
                <span className="text-2xl font-bold text-emerald-400">Free</span>
              ) : (
                <span className="text-2xl font-bold gradient-text-gold">{formatApt(dataset.price)}</span>
              )}
              <p className="text-xs text-[oklch(0.42_0.02_225)] mt-0.5">per access</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[oklch(0.62_0.02_225)] leading-relaxed">
            {dataset.description || <span className="italic text-[oklch(0.38_0.02_225)]">No description provided.</span>}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: HardDrive, label: "File Size",  value: formatFileSize(dataset.fileSize) },
              { icon: Download,  label: "Downloads",  value: `${dataset.downloadCount}` },
              { icon: Tag,       label: "Price",      value: formatApt(dataset.price) },
              { icon: Clock,     label: "Listed",     value: timeAgo(dataset.createdAt) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/6 bg-white/3 p-3">
                <p className="text-[10px] font-semibold text-[oklch(0.42_0.02_225)] uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <Icon className="h-3 w-3" />{label}
                </p>
                <p className="text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Creator */}
          <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
            <p className="text-[10px] font-semibold text-[oklch(0.42_0.02_225)] uppercase tracking-wider flex items-center gap-1 mb-2">
              <User className="h-3 w-3" />Creator
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-[oklch(0.62_0.02_225)] break-all">{dataset.creator}</code>
              <CopyButton text={dataset.creator} label="Address" />
            </div>
          </div>
        </div>
      </div>

      {/* Access card */}
      <div className="rounded-3xl border border-white/7 bg-[oklch(0.11_0.02_225/0.9)] overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-white/5 px-6 py-4">
          {hasAccess
            ? <><ShieldCheck className="h-4 w-4 text-emerald-400" /><span className="text-sm font-bold text-white">Download Dataset</span></>
            : <><Lock className="h-4 w-4 text-[oklch(0.42_0.02_225)]" /><span className="text-sm font-bold text-white">Get Access</span></>
          }
        </div>

        <div className="p-6 space-y-4">
          {hasAccess ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-300 font-medium">You have full access to this dataset.</p>
              </div>

              {blobData && (
                <div className="space-y-3">
                  {/* Blob name */}
                  <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
                    <p className="text-[10px] font-semibold text-[oklch(0.42_0.02_225)] uppercase tracking-wider mb-2">Shelby Blob Name</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-teal-300 break-all">{blobData.blobName || "—"}</code>
                      {blobData.blobName && <CopyButton text={blobData.blobName} label="Blob name" />}
                    </div>
                  </div>

                  {/* CLI */}
                  <div className="rounded-2xl border border-white/6 bg-[oklch(0.08_0.015_230)] p-4">
                    <p className="text-[10px] font-semibold text-[oklch(0.42_0.02_225)] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Terminal className="h-3 w-3" />Shelby CLI
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-teal-300 break-all">
                        shelby download {blobData.blobName} ./dataset
                      </code>
                      <CopyButton text={`shelby download ${blobData.blobName} ./dataset`} label="Command" />
                    </div>
                  </div>

                  {/* Python */}
                  <div className="rounded-2xl border border-white/6 bg-[oklch(0.08_0.015_230)] p-4">
                    <p className="text-[10px] font-semibold text-[oklch(0.42_0.02_225)] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Code2 className="h-3 w-3" />Python / boto3
                    </p>
                    <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">{`import boto3
s3 = boto3.client('s3',
  endpoint_url='http://localhost:9000',
  aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
  aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  region_name='shelbyland'
)
s3.download_file('${blobData.shelbyAccount}', '${blobData.blobName}', 'dataset')`}</pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-[oklch(0.52_0.025_220)] leading-relaxed">
                {isFree
                  ? "This dataset is free. Connect your wallet to get instant access."
                  : `Pay ${formatApt(dataset.price)} APT to unlock permanent access to this dataset.`}
              </p>

              {!connected ? (
                <div className="flex flex-col items-center gap-4 py-8 rounded-2xl border border-dashed border-white/8">
                  <p className="text-sm text-[oklch(0.52_0.025_220)]">Connect your Petra wallet to continue</p>
                  <a
                    href="https://petra.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 underline underline-offset-4 transition-colors"
                  >
                    Get Petra Wallet <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || !dataset.active}
                  className="group relative w-full h-14 overflow-hidden rounded-2xl border-0 text-base font-bold text-[oklch(0.08_0.015_230)] shadow-xl shadow-teal-500/20 disabled:opacity-40 transition-all hover:shadow-teal-500/35 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500" />
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isPurchasing ? (
                      <><Loader2 className="h-5 w-5 animate-spin" />Confirming on Aptos…</>
                    ) : isFree ? (
                      <><Unlock className="h-5 w-5" />Get Free Access</>
                    ) : (
                      <><Download className="h-5 w-5" />Buy for {formatApt(dataset.price)}</>
                    )}
                  </span>
                </Button>
              )}

              {txHash && (
                <p className="text-[10px] text-[oklch(0.42_0.02_225)] font-mono break-all text-center pt-1">
                  tx: {txHash}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
