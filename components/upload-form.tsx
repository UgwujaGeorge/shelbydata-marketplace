"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAptosUpload } from "@/hooks/useAptosUpload";
import { CATEGORIES, formatFileSize } from "@/lib/aptos";
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, CloudUpload, Wallet, X } from "lucide-react";

const STEPS = [
  { id: 1, label: "Uploading to Shelby", desc: "Storing file on decentralized network" },
  { id: 2, label: "Awaiting Signature", desc: "Approve listing transaction in Petra" },
  { id: 3, label: "Confirming on Aptos", desc: "Waiting for blockchain confirmation" },
];

export default function UploadForm() {
  const { connected } = useWallet();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priceApt, setPriceApt] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDataset, state, error, txHash } = useAptosUpload();

  useEffect(() => {
    if (state === "done") {
      toast.success("Dataset published to marketplace!");
      router.push("/my-datasets");
    }
  }, [state, router]);

  function handleFile(f: File) {
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name || !category) {
      toast.error("Please fill all required fields and select a file.");
      return;
    }
    await uploadDataset({ file, name, description, category, priceApt });
  }

  const isUploading = ["uploading-shelby", "waiting-wallet", "confirming"].includes(state);
  const currentStep = state === "uploading-shelby" ? 1 : state === "waiting-wallet" ? 2 : state === "confirming" ? 3 : 0;

  if (!connected) {
    return (
      <div className="relative flex flex-col items-center justify-center py-36 gap-7">
        <div className="orb w-80 h-80 bg-[oklch(0.72_0.17_192/0.06)] top-0 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-teal-500/25 bg-teal-500/8">
          <Wallet className="h-9 w-9 text-teal-400" />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-white">Wallet Required</h2>
          <p className="mt-2 text-[oklch(0.52_0.025_220)] max-w-sm leading-relaxed">
            Connect a Petra wallet on Aptos Devnet to publish datasets.
          </p>
        </div>
        <a
          href="https://petra.app"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-bold text-[oklch(0.08_0.015_230)] shadow-xl shadow-teal-500/20 hover:shadow-teal-500/35 hover:-translate-y-0.5 transition-all"
        >
          Get Petra Wallet →
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-teal-400/70 uppercase mb-1">Publish Dataset</p>
        <h1 className="text-3xl font-bold text-white">Upload to Marketplace</h1>
        <p className="mt-1.5 text-sm text-[oklch(0.52_0.025_220)]">
          Stored permanently on Shelby · Listed on Aptos Devnet · Earn APT per download
        </p>
      </div>

      {/* Progress tracker */}
      {isUploading && (
        <div className="relative overflow-hidden rounded-3xl border border-teal-500/15 bg-[oklch(0.11_0.02_225/0.9)] p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/4 to-transparent" />
          <p className="relative text-xs font-semibold tracking-widest text-teal-400/70 uppercase mb-5">Publishing…</p>
          <div className="relative space-y-4">
            {STEPS.map((step) => {
              const done = currentStep > step.id;
              const active = currentStep === step.id;
              const pending = currentStep < step.id;
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 transition-all ${
                    done ? "border-teal-500/40 bg-teal-500/10" :
                    active ? "border-cyan-400/50 bg-cyan-400/8" :
                    "border-white/8 bg-white/3"
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4 text-teal-400" /> :
                     active ? <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" /> :
                     <span className="text-xs font-bold text-white/25">{step.id}</span>}
                    {active && <span className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-ping" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${done ? "text-teal-400" : active ? "text-white" : "text-white/25"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-[oklch(0.42_0.02_225)]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {txHash && (
            <p className="relative mt-4 pt-4 border-t border-white/5 text-[10px] text-[oklch(0.42_0.02_225)] font-mono break-all">
              tx: {txHash}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
            file ? "border-teal-500/40 bg-teal-500/4" :
            isDragging ? "border-teal-400/60 bg-teal-500/6 scale-[1.01]" :
            "border-white/8 bg-[oklch(0.10_0.02_225/0.5)] hover:border-teal-500/25 hover:bg-teal-500/3"
          }`}
        >
          {isDragging && <div className="absolute inset-0 bg-teal-500/5 animate-pulse" />}
          <div className="relative flex flex-col items-center justify-center py-14 text-center px-8">
            {file ? (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/25 bg-teal-500/8">
                  <FileText className="h-8 w-8 text-teal-400" />
                </div>
                <p className="font-bold text-white text-base">{file.name}</p>
                <p className="mt-1 text-sm text-[oklch(0.52_0.025_220)]">{formatFileSize(file.size)}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl border border-white/8 bg-white/5 px-3 py-1 text-xs text-[oklch(0.52_0.025_220)] hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />Remove
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/4">
                  <Upload className="h-8 w-8 text-[oklch(0.42_0.02_225)]" />
                </div>
                <p className="font-bold text-white">Drop your file here</p>
                <p className="mt-1.5 text-sm text-[oklch(0.45_0.02_225)]">or click to browse</p>
                <p className="mt-4 text-xs text-[oklch(0.35_0.02_225)]">CSV · JSON · ZIP · Parquet · HDF5 · any format</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Details panel */}
        <div className="rounded-3xl border border-white/7 bg-[oklch(0.11_0.02_225/0.9)] overflow-hidden">
          <div className="border-b border-white/5 px-6 py-4">
            <p className="text-sm font-bold text-white">Dataset Details</p>
            <p className="text-xs text-[oklch(0.42_0.02_225)] mt-0.5">Help buyers understand what they're getting</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Name <span className="text-red-400 normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Twitter Sentiment 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-2xl border-white/8 bg-white/4 focus:border-teal-500/40 focus:ring-0 placeholder:text-white/20 transition-colors h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold text-white/60 uppercase tracking-wider">Description</Label>
              <Textarea
                id="desc"
                placeholder="What's in this dataset? How was it collected? What tasks is it suited for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="rounded-2xl border-white/8 bg-white/4 focus:border-teal-500/40 focus:ring-0 placeholder:text-white/20 resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat" className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Category <span className="text-red-400 normal-case tracking-normal">*</span>
                </Label>
                <Select value={category} onValueChange={(v) => setCategory(v ?? "")} required>
                  <SelectTrigger id="cat" className="rounded-2xl border-white/8 bg-white/4 focus:border-teal-500/40 focus:ring-0 h-11">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/8 bg-[oklch(0.12_0.02_225/0.97)] backdrop-blur-xl">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded-xl">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold text-white/60 uppercase tracking-wider">Price (APT)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.00 = free"
                  value={priceApt}
                  onChange={(e) => setPriceApt(e.target.value)}
                  className="rounded-2xl border-white/8 bg-white/4 focus:border-teal-500/40 focus:ring-0 placeholder:text-white/20 h-11 transition-colors"
                />
                <p className="text-[10px] text-[oklch(0.42_0.02_225)]">You keep 97.5% · 2.5% platform fee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isUploading || !file || !name || !category}
          className="group relative w-full h-14 overflow-hidden rounded-2xl border-0 text-base font-bold text-[oklch(0.08_0.015_230)] shadow-xl shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-teal-500/35 hover:-translate-y-0.5"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500" />
          <span className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-white/15 to-teal-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {state === "uploading-shelby" && "Uploading to Shelby…"}
                {state === "waiting-wallet" && "Waiting for signature…"}
                {state === "confirming" && "Confirming on Aptos…"}
              </>
            ) : (
              <>
                <CloudUpload className="h-5 w-5" />
                Publish Dataset
              </>
            )}
          </span>
        </Button>
      </form>
    </div>
  );
}
