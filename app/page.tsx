"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DatasetCard } from "@/components/dataset-card";
import { CATEGORIES } from "@/lib/aptos";
import { useDatasets } from "@/hooks/useAptosDatasets";
import { Search, Sparkles, AlertCircle, Database, ShieldCheck, Coins, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { datasets, isLoading, error } = useDatasets();

  const filtered = useMemo(() => {
    return datasets.filter((d) => {
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || d.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [datasets, search, selectedCategory]);

  return (
    <div className="space-y-12">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl mesh-bg border border-white/6 p-8 md:p-14">
        {/* Orbs */}
        <div className="orb w-[500px] h-[500px] bg-[oklch(0.72_0.17_192/0.08)] -top-32 -right-32" />
        <div className="orb w-[350px] h-[350px] bg-[oklch(0.65_0.2_280/0.06)] -bottom-24 -left-24" />
        <div className="orb w-[200px] h-[200px] bg-[oklch(0.75_0.18_160/0.06)] top-1/2 left-1/3" />

        {/* Badge */}
        <div className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/8 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse-glow" />
          <span className="text-xs font-semibold text-teal-300 tracking-wider uppercase">Live on Aptos Devnet</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
            <span className="text-white">The Open</span>
            <br />
            <span className="gradient-text-hero">AI Dataset</span>
            <br />
            <span className="text-white">Marketplace</span>
          </h1>
          <p className="text-lg text-[oklch(0.52_0.025_220)] leading-relaxed mb-8 max-w-xl">
            Buy and sell AI training datasets with trustless on-chain payments. Files stored on Shelby Protocol — permanent, decentralized, yours.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/upload"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-bold text-[oklch(0.08_0.015_230)] shadow-xl shadow-teal-500/20 hover:shadow-teal-500/35 transition-all hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <Sparkles className="h-4 w-4 relative z-10" />
              <span className="relative z-10">List Your Dataset</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            {datasets.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-teal-400" />
                <span className="text-white font-bold">{datasets.length}</span>
                <span className="text-[oklch(0.52_0.025_220)]">datasets available</span>
              </div>
            )}
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 mt-10 flex flex-wrap gap-3">
          {[
            { icon: Database, text: "Shelby Decentralized Storage" },
            { icon: ShieldCheck, text: "On-chain Ownership" },
            { icon: Coins, text: "97.5% Revenue to Creators" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 backdrop-blur">
              <Icon className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-xs font-medium text-white/70">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Search + Filters ── */}
      <section className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[oklch(0.52_0.025_220)] group-focus-within:text-teal-400 transition-colors" />
          <Input
            placeholder="Search datasets by name, description, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-white/8 bg-[oklch(0.11_0.02_225/0.8)] backdrop-blur text-sm placeholder:text-[oklch(0.35_0.02_225)] focus:border-teal-500/40 focus:ring-0 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[{ label: "All", value: null }, ...CATEGORIES.map(c => ({ label: c, value: c }))].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setSelectedCategory(value)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === value
                  ? "bg-teal-500 text-[oklch(0.08_0.015_230)] shadow-lg shadow-teal-500/25"
                  : "border border-white/8 bg-white/4 text-[oklch(0.52_0.025_220)] hover:border-teal-500/25 hover:text-white hover:bg-teal-500/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-60 rounded-3xl bg-white/4" />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/6 bg-[oklch(0.10_0.02_225/0.6)] py-28 text-center">
          <div className="orb w-64 h-64 bg-[oklch(0.72_0.17_192/0.06)] top-0 left-1/2 -translate-x-1/2" />
          <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/8">
            <Sparkles className="h-8 w-8 text-teal-400" />
          </div>
          <h3 className="relative z-10 text-xl font-bold text-white">
            {datasets.length === 0 ? "No datasets yet" : "No results found"}
          </h3>
          <p className="relative z-10 mt-2 text-sm text-[oklch(0.52_0.025_220)] max-w-xs">
            {datasets.length === 0
              ? "Be the first to upload an AI training dataset to the marketplace."
              : "Try a different search term or browse all categories."}
          </p>
          {datasets.length === 0 && (
            <Link href="/upload" className={buttonVariants({ className: "relative z-10 mt-7 bg-gradient-to-r from-teal-500 to-cyan-500 text-[oklch(0.08_0.015_230)] font-bold border-0 shadow-lg shadow-teal-500/20 rounded-xl hover:shadow-teal-500/35 hover:-translate-y-0.5 transition-all" })}>
              Upload First Dataset
            </Link>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          {filtered.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      )}
    </div>
  );
}
