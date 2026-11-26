import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { WorkspaceBanner } from "@repo/ui/WorkspaceBanner";

export const metadata: Metadata = {
  title: "ShorbornoAI — Sovereign Memory Trust & Multi-Vendor OS",
  description:
    "ShorbornoAI workspace with Turborepo 2.0, Next.js TypeScript + Tailwind CSS, FAISS similarity benchmarking, and multi-vendor engine architecture."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <WorkspaceBanner
          activeZoneLabel="ShorbornoAI · shorbornoai.com"
          docsUrl="https://interactive-docs.shorbornoai.com"
          voiceUrl="https://voice.sorbornoai.com/"
        />
        {children}
      </body>
    </html>
  );
}
