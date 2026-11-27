"use client";

import React, { useState } from "react";

export default function EnterpriseChatPage() {
  const [provider, setProvider] = useState("local-preview");
  const [modality, setModality] = useState("bn-EN");
  const [prompt, setPrompt] = useState("Amar research prompt for local UI layout and scoring formula preview.");
  const [entries, setEntries] = useState<string[]>([
    "[NOT CONNECTED] Live backend routing is NOT CONNECTED; local formula preview is active.",
  ]);

  const runPreview = async () => {
    if (!prompt.trim()) return;
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: prompt, modality, persistence: 0.2, provider }),
    });
    const data = await res.json();
    const mrs = data?.evaluation?.mrs ?? 0;
    const tier = data?.evaluation?.tier ?? "ACTIVE_STORE";
    setEntries((prev) => [
      `[${provider} | ${modality} | Backend: NOT CONNECTED] Formula preview MRS=${mrs} (${tier}) -> ${prompt}`,
      ...prev,
    ]);
  };

  return (
    <>
      <div className="ent-card">
        <span className="ent-pill pill-warn">BACKEND: NOT CONNECTED</span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Enterprise Chat</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
          Interactive prompt console with local MRS formula preview. External inference backends are NOT CONNECTED.
        </p>
      </div>

      <div className="ent-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <select className="ent-select" style={{ maxWidth: "240px" }} value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="local-preview">Mode: Local Formula Preview</option>
            <option value="sovereign-dual-path">Target: Sovereign Dual-Path (NOT CONNECTED)</option>
          </select>
          <select className="ent-select" style={{ maxWidth: "180px" }} value={modality} onChange={(e) => setModality(e.target.value)}>
            <option value="bn-EN">bn-EN (Banglish)</option>
            <option value="bn">bn (Bengali)</option>
            <option value="en">en (English)</option>
          </select>
        </div>
        <textarea className="ent-textarea" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div>
          <button type="button" className="ent-btn ent-btn-primary" onClick={runPreview}>Run Local Preview</button>
        </div>
        <pre className="ent-pre">{entries.join("\n")}</pre>
      </div>
    </>
  );
}
