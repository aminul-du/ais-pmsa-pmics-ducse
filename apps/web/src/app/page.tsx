import React from "react";
import { MultiVendorMatrix } from "@repo/ui/MultiVendorMatrix";

const PIPELINE_MODULES = [
  {
    name: "PMSA Trust Engine (:18411)",
    detail: "SHA-256 hash-chained ledger, 4 defense scenarios, and POST /api/recover baseline rollback."
  },
  {
    name: "Cloud-Spoke Bridge (:18413)",
    detail: "Links local WSL2 trust state to GCP Cloud Run over Cloudflare QUIC tunnel."
  },
  {
    name: "FAISS Search Benchmark Baseline",
    detail: "Independent FlatIP exact baseline vs HNSWFlat & IVFFlat recall@k and p50/p95 latency suite."
  },
  {
    name: "Interactive Docs Portal",
    detail: "Dedicated Next.js docs app at interactive-docs.shorbornoai.com."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          Turborepo 2.0 · Next.js (TS + Tailwind) · FAISS Baseline
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          ShorbornoAI Autonomous Trust &amp; Multi-Vendor Workspace
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Isolated production interface for <span className="font-mono text-emerald-300">shorbornoai.com</span>,
          pairing tamper-evident SHA-256 memory trust checks and FAISS search benchmarking with cross-engine
          verification across Chrome/Chromium, Firefox, and Microsoft Edge.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="https://interactive-docs.shorbornoai.com"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Open Interactive Docs
          </a>
          <a
            href="https://voice.sorbornoai.com/"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Launch Voice Studio (voice.sorbornoai.com)
          </a>
        </div>
      </header>

      <MultiVendorMatrix />

      <section className="grid gap-4 sm:grid-cols-2">
        {PIPELINE_MODULES.map((mod) => (
          <div
            key={mod.name}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <h2 className="text-sm font-semibold text-white">{mod.name}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{mod.detail}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
