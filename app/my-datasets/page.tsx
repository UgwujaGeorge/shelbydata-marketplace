"use client";

import { useMemo } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatorDatasets } from "@/hooks/useAptosDatasets";
import { formatFileSize, formatApt } from "@/lib/aptos";
import { Upload, HardDrive, Download, Tag, LayoutGrid, TrendingUp, Coins, Wallet, ArrowUpRight, AlertCircle } from "lucide-react";

const CATEGORY_DOT: Record<string, string> = {
  "NLP / Text":             "bg-sky-400",
  "Computer Vision":        "bg-violet-400",
  "Tabular / Structured":   "bg-emerald-400",
  "Audio / Speech":         "bg-amber-400",
  "Multimodal":             "bg-rose-400",
  "Time Series":            "bg-orange-400",
  "Reinforcement Learning": "bg-red-400",
  "Other":                  "bg-slate-400",
};

export default function MyDatasetsPage() {
  const { connected, account } = useWallet();
  const address = account?.address?.toString() ?? null;
  const { datasets, isLoading, error } = useCreatorDatasets(address);

  const totalDownloads = useMemo(() => datasets.reduce((s, d) => s + d.downloadCount, 0), [datasets]);
  const totalEarnings = useMemo(() => datasets.reduce((s, d) => s + Number(d.price) * d.downloadCount, 0), [datasets]);

  if (!connected) {
    return (
      <div className="relative flex flex-col items-center justify-center py-36 gap-7">
        <div className="orb w-80 h-80 bg-[oklch(0.72_0.17_192/0.06)] top-0 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-teal-500/25 bg-teal-500/8">
          <Wallet className="h-9 w-9 text-teal-400" />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
          <p className="mt-2 text-[oklch(0.52_0.025_220)]">Connect your Petra wallet to view your datasets.</p>
        </div>
        <a href="https://petra.app" target="_blank" rel="noopener noreferrer"
          className="relative z-10 text-sm text-teal-400 hover:text-teal-300 underline underline-offset-4 transition-colors">
          Get Petra Wallet →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-teal-400/70 uppercase mb-1">Creator Dashboard</p>
          <h1 className="text-3xl font-bold text-white">My Datasets</h1>
          <p className="mt-1 font-mono text-xs text-[oklch(0.42_0.02_225)]">
            {address?.slice(0, 10)}…{address?.slice(-6)}
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-[oklch(0.08_0.015_230)] shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 hover:-translate-y-0.5 transition-all"
        >
          <Upload className="h-4 w-4" />
          Upload New
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && datasets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: LayoutGrid, label: "Datasets",       value: datasets.length.toString(),           color: "text-teal-300",    bg: "bg-teal-500/8 border-teal-500/15" },
            { icon: TrendingUp,  label: "Downloads",      value: totalDownloads.toString(),             color: "text-sky-300",     bg: "bg-sky-500/8 border-sky-500/15" },
            { icon: Coins,       label: "Est. Earnings",  value: formatApt(BigInt(totalEarnings)),      color: "text-amber-300",   bg: "bg-amber-500/8 border-amber-500/15" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`rounded-3xl border p-5 ${bg}`}>
              <Icon className={`h-5 w-5 mb-3 ${color}`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-[oklch(0.42_0.02_225)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-white/4" />
          ))}
        </div>
      )}

      {!isLoading && datasets.length === 0 && (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/8 bg-[oklch(0.10_0.02_225/0.4)] py-28 text-center">
          <div className="orb w-64 h-64 bg-[oklch(0.72_0.17_192/0.05)] top-0 left-1/2 -translate-x-1/2" />
          <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/8">
            <Upload className="h-7 w-7 text-teal-400" />
          </div>
          <h3 className="relative z-10 text-lg font-bold text-white">No datasets yet</h3>
          <p className="relative z-10 mt-2 text-sm text-[oklch(0.52_0.025_220)]">
            Upload your first dataset to start earning APT.
          </p>
          <Link href="/upload" className={buttonVariants({ className: "relative z-10 mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-[oklch(0.08_0.015_230)] font-bold border-0 shadow-lg shadow-teal-500/20 rounded-2xl hover:-translate-y-0.5 transition-all" })}>
            Upload Dataset
          </Link>
        </div>
      )}

      {!isLoading && datasets.length > 0 && (
        <div className="space-y-3">
          {datasets.map((dataset) => {
            const dot = CATEGORY_DOT[dataset.category] ?? CATEGORY_DOT["Other"];
            return (
              <div
                key={dataset.id}
                className="group flex items-center gap-5 rounded-3xl border border-white/7 bg-[oklch(0.11_0.02_225/0.9)] p-5 hover:border-white/12 transition-all"
              >
                {/* Color dot */}
                <div className={`h-10 w-1 rounded-full shrink-0 ${dot}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Link href={`/dataset/${dataset.id}`} className="font-bold text-white hover:text-teal-300 transition-colors">
                      {dataset.name}
                    </Link>
                    {!dataset.active && (
                      <span className="text-[10px] font-semibold text-red-400 border border-red-500/20 bg-red-500/8 rounded-lg px-1.5 py-0.5">Inactive</span>
                    )}
                  </div>
                  {dataset.description && (
                    <p className="text-xs text-[oklch(0.42_0.02_225)] line-clamp-1 mb-2">{dataset.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-[oklch(0.42_0.02_225)]">
                    <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{formatFileSize(dataset.fileSize)}</span>
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" />{dataset.downloadCount} downloads</span>
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <Tag className="h-3 w-3" />
                      {formatApt(dataset.price)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dataset/${dataset.id}`}
                  className="shrink-0 flex items-center justify-center h-9 w-9 rounded-xl border border-white/8 bg-white/4 text-[oklch(0.42_0.02_225)] hover:text-teal-300 hover:border-teal-500/25 transition-all"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
