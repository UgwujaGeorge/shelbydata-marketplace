"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, User, LayoutGrid, Wallet, LogOut, ChevronDown, Hexagon, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { href: "/", label: "Marketplace", icon: LayoutGrid },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/my-datasets", label: "My Datasets", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { connected, account, wallets, connect, disconnect, isLoading } = useWallet();
  const [showWallets, setShowWallets] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const address = account?.address?.toString() ?? "";
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowWallets(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 border-b border-white/5 bg-[oklch(0.075_0.018_230/0.85)] backdrop-blur-2xl" />

      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-400/20 to-cyan-500/10 border border-teal-500/30 group-hover:border-teal-400/50 transition-colors" />
            <Hexagon className="h-5 w-5 text-teal-400 relative z-10" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-white">ShelbyData</span>
            <span className="text-[10px] text-teal-400/70 font-medium tracking-widest uppercase">Marketplace</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "text-teal-300"
                  : "text-[oklch(0.52_0.025_220)] hover:text-white"
              )}
            >
              {pathname === href && (
                <span className="absolute inset-0 rounded-xl bg-teal-500/8 border border-teal-500/15" />
              )}
              <Icon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <div className="relative" ref={dropdownRef}>
          {connected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-teal-500/20 bg-teal-500/5 px-3.5 py-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                <span className="font-mono text-teal-300 text-xs tracking-wide">{shortAddress}</span>
              </div>
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs text-[oklch(0.52_0.025_220)] hover:text-white hover:bg-white/8 transition-all"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowWallets(!showWallets)}
                disabled={isLoading}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
              >
                {/* Button background */}
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-white/10 to-teal-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Wallet className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10">Connect Wallet</span>
                <ChevronDown className={cn("h-3 w-3 relative z-10 transition-transform duration-200", showWallets && "rotate-180")} />
              </button>

              {showWallets && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-white/8 bg-[oklch(0.11_0.02_225/0.95)] backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-teal-400" />
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Select Wallet</p>
                    </div>
                  </div>
                  <div className="p-2">
                    {wallets.filter(w => w.readyState === "Installed").length === 0 ? (
                      <div className="px-3 py-5 text-center">
                        <p className="text-sm text-white/40 mb-3">No Aptos wallet detected</p>
                        <a href="https://petra.app" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 text-xs font-medium text-teal-300 hover:bg-teal-500/15 transition-colors">
                          Install Petra →
                        </a>
                      </div>
                    ) : (
                      wallets.filter(w => w.readyState === "Installed").map((wallet) => (
                        <button
                          key={wallet.name}
                          onClick={() => { connect(wallet.name); setShowWallets(false); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                        >
                          {wallet.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={wallet.icon} alt={wallet.name} className="h-7 w-7 rounded-lg" />
                          )}
                          <span className="font-medium text-white/90">{wallet.name}</span>
                          <span className="ml-auto text-[10px] font-medium text-teal-400 bg-teal-400/10 rounded-md px-1.5 py-0.5">Ready</span>
                        </button>
                      ))
                    )}
                    {wallets.filter(w => w.readyState !== "Installed").map((wallet) => (
                      <a
                        key={wallet.name}
                        href={(wallet as { url?: string }).url ?? "https://petra.app"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30 hover:bg-white/3 transition-colors"
                      >
                        {wallet.icon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={wallet.icon} alt={wallet.name} className="h-7 w-7 rounded-lg opacity-30" />
                        )}
                        <span>{wallet.name}</span>
                        <span className="ml-auto text-[10px] text-white/30 border border-white/10 rounded-md px-1.5 py-0.5">Install</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
