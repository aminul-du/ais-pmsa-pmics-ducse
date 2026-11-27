import React from "react";

interface WorkspaceBannerProps {
  activeZoneLabel?: string;
  docsUrl?: string;
  voiceUrl?: string;
}

export function WorkspaceBanner({
  activeZoneLabel = "ShorbornoAI Isolated Zone (shorbornoai.com)",
  docsUrl = "https://interactive-docs.shorbornoai.com",
  voiceUrl = "https://voice.shorbornoai.com/"
}: WorkspaceBannerProps) {
  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/95 px-4 py-2.5 text-xs text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-semibold tracking-wide text-white">{activeZoneLabel}</span>
          <span className="hidden text-slate-400 sm:inline">
            · Turborepo 2.0 + Next.js + FAISS Baseline + :18411 Trust Engine
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 font-medium text-sky-300 transition hover:bg-sky-500/20"
          >
            Interactive Docs →
          </a>
          <a
            href={voiceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-300 transition hover:bg-amber-500/20"
          >
            Voice Workspace (voice.shorbornoai.com) →
          </a>
        </div>
      </div>
    </div>
  );
}
