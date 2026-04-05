"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Download, Clock, HardDrive, ArrowUpRight } from "lucide-react";
import { DatasetPublic, formatFileSize, formatApt } from "@/lib/aptos";

interface DatasetCardProps {
  dataset: DatasetPublic;
}

const CATEGORY_CONFIG: Record<string, {
  dot: string; pill: string; glow: string; bar: string;
}> = {
  "NLP / Text":             { dot: "bg-sky-400",     pill: "bg-sky-400/10 text-sky-300 border-sky-400/20",      glow: "hover:shadow-sky-500/8",   bar: "from-sky-400 to-cyan-400" },
  "Computer Vision":        { dot: "bg-violet-400",  pill: "bg-violet-400/10 text-violet-300 border-violet-400/20", glow: "hover:shadow-violet-500/8", bar: "from-violet-400 to-purple-400" },
  "Tabular / Structured":   { dot: "bg-emerald-400", pill: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", glow: "hover:shadow-emerald-500/8", bar: "from-emerald-400 to-teal-400" },
  "Audio / Speech":         { dot: "bg-amber-400",   pill: "bg-amber-400/10 text-amber-300 border-amber-400/20",  glow: "hover:shadow-amber-500/8",  bar: "from-amber-400 to-orange-400" },
  "Multimodal":             { dot: "bg-rose-400",    pill: "bg-rose-400/10 text-rose-300 border-rose-400/20",    glow: "hover:shadow-rose-500/8",   bar: "from-rose-400 to-pink-400" },
  "Time Series":            { dot: "bg-orange-400",  pill: "bg-orange-400/10 text-orange-300 border-orange-400/20", glow: "hover:shadow-orange-500/8", bar: "from-orange-400 to-amber-400" },
  "Reinforcement Learning": { dot: "bg-red-400",     pill: "bg-red-400/10 text-red-300 border-red-400/20",      glow: "hover:shadow-red-500/8",    bar: "from-red-400 to-rose-400" },
  "Other":                  { dot: "bg-slate-400",   pill: "bg-slate-400/10 text-slate-300 border-slate-400/20",  glow: "hover:shadow-slate-500/8",  bar: "from-slate-400 to-slate-300" },
};

function timeAgo(sec: number): string {
  const diff = Math.floor(Date.now() / 1000) - sec;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  const cfg = CATEGORY_CONFIG[dataset.category] ?? CATEGORY_CONFIG["Other"];
  const isFree = dataset.price === 0n;

  return (
    <div className={`group relative flex flex-col rounded-3xl border border-white/7 bg-[oklch(0.11_0.02_225/0.9)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/12 hover:shadow-2xl ${cfg.glow} backdrop-blur`}>
      {/* Colored bar at top */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${cfg.bar} opacity-70`} />

      {/* Subtle inner glow at top */}
      <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${cfg.bar.replace('from-', 'from-').split(' ')[0]}/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex flex-col flex-1 p-5">
        {/* Category + Price row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold ${cfg.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {dataset.category}
          </div>
          <div className="shrink-0">
            {isFree ? (
              <span className="inline-flex items-center rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                Free
              </span>
            ) : (
              <span className="text-base font-bold gradient-text-gold">
                {formatApt(dataset.price)}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/dataset/${dataset.id}`}
          className="block text-[15px] font-bold text-white/90 hover:text-teal-300 transition-colors line-clamp-2 leading-snug mb-2.5"
        >
          {dataset.name}
        </Link>

        {/* Description */}
        <p className="text-sm text-[oklch(0.45_0.02_225)] line-clamp-2 leading-relaxed flex-1">
          {dataset.description || "No description provided."}
        </p>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-[oklch(0.42_0.02_225)] mb-4">
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(dataset.fileSize)}
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="h-3 w-3" />
              {dataset.downloadCount} dl
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(dataset.createdAt)}
          </span>
        </div>

        {/* Creator + CTA */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-[oklch(0.38_0.02_225)] truncate">
            {dataset.creator.slice(0, 8)}…{dataset.creator.slice(-4)}
          </span>
          <Link
            href={`/dataset/${dataset.id}`}
            className="group/btn relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
          >
            {isFree ? (
              <>
                <span className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group-hover/btn:bg-emerald-500/15 transition-colors" />
                <span className="relative text-emerald-300">Get Free</span>
              </>
            ) : (
              <>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl opacity-90 group-hover/btn:opacity-100 transition-opacity" />
                <span className="relative text-[oklch(0.08_0.015_230)]">Buy Access</span>
                <ArrowUpRight className="relative h-3 w-3 text-[oklch(0.08_0.015_230)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
