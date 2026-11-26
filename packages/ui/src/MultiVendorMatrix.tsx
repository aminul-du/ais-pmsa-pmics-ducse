import React from "react";
import { MULTI_VENDOR_ENGINES } from "@repo/trust-contracts";

export function MultiVendorMatrix() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Multi-Vendor Architecture Layout</h2>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          3 Engines Mapped
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {MULTI_VENDOR_ENGINES.map((engine) => (
          <div
            key={engine.id}
            className="rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-white">{engine.browser}</p>
              <span className="text-[11px] font-medium text-sky-300">{engine.status}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-indigo-300">{engine.core}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{engine.pathway}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
