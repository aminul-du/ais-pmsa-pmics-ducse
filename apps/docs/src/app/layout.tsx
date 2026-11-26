import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { WorkspaceBanner } from "@repo/ui/WorkspaceBanner";

export const metadata: Metadata = {
  title: "Interactive Docs — ShorbornoAI Architecture & Benchmarks",
  description:
    "Interactive documentation for ShorbornoAI, Turborepo 2.0 monorepo, FAISS benchmarking baseline, and multi-vendor execution engines."
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <WorkspaceBanner
          activeZoneLabel="Interactive Docs · interactive-docs.shorbornoai.com"
          docsUrl="https://interactive-docs.shorbornoai.com"
          voiceUrl="https://voice.sorbornoai.com/"
        />
        {children}
      </body>
    </html>
  );
}
