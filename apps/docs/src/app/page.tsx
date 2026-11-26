import React from "react";
import { MULTI_VENDOR_ENGINES } from "@repo/trust-contracts";

export default function InteractiveDocsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">
          Interactive Documentation
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          ShorbornoAI Monorepo, FAISS Baseline &amp; Multi-Vendor Guide
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Reference guide for running <code className="text-emerald-300">turbo run build</code>,{" "}
          <code className="text-emerald-300">benchmarks/faiss_bench.py</code>, and multi-vendor browser
          engine verification across Chrome/Chromium, Firefox, and Edge.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
        <h2 className="text-base font-semibold text-white">Multi-Vendor Engine Channels</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          {MULTI_VENDOR_ENGINES.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-3">
              <span className="font-semibold text-white">{item.browser}</span> —{" "}
              <span className="text-indigo-300">{item.core}</span> ({item.pathway})
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
