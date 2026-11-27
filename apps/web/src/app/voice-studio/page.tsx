"use client";

import React, { useState } from "react";

export default function VoiceStudioPage() {
  const [text, setText] = useState("ShorbornoAI Voice Studio — বাংলা ও English প্রিভিউ।");
  const [lang, setLang] = useState("bn-BD");
  const [statusPayload, setStatusPayload] = useState<string>(
    JSON.stringify({ voiceBackend: "NOT CONNECTED", browserSpeechSynthesis: "READY" }, null, 2)
  );

  const testVoice = async () => {
    const res = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang }),
    });
    const data = await res.json();
    setStatusPayload(JSON.stringify(data, null, 2));
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore if browser has no audio output in headless mode
      }
    }
  };

  return (
    <>
      <div className="ent-card">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className="ent-pill pill-ok">VOICE STUDIO ROUTE ACTIVE</span>
          <span className="ent-pill pill-warn">VOICE BACKEND: NOT CONNECTED</span>
        </div>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Voice Studio</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
          Bilingual voice studio interface supporting Bengali (bn-BD) and English (en-US) text input and local browser speech synthesis.
        </p>
      </div>

      <div className="ent-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <select className="ent-select" style={{ maxWidth: "220px" }} value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="bn-BD">Bengali (bn-BD)</option>
            <option value="en-US">English (en-US)</option>
          </select>
        </div>
        <textarea className="ent-textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
        <div>
          <button type="button" className="ent-btn ent-btn-primary" onClick={testVoice}>Preview Voice & Check Status</button>
        </div>
        <pre className="ent-pre">{statusPayload}</pre>
      </div>
    </>
  );
}
