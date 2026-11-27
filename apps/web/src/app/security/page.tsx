"use client";

import React, { useState } from "react";

export default function SecurityEnclavePage() {
  const [notice, setNotice] = useState<string>("Backend security & recovery service: NOT CONNECTED");

  const triggerRecover = async () => {
    const r = await fetch("/api/recover", { method: "POST" });
    const d = await r.json().catch(() => ({ status: "NOT CONNECTED" }));
    setNotice(JSON.stringify(d, null, 2));
  };

  return (
    <>
      <div className="ent-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="ent-pill pill-warn">ENCLAVE BACKEND: NOT CONNECTED</span>
          <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Memory Security & Enclave</h1>
          <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
            Shows connection status for memory quarantine and recovery endpoints without fabricating live telemetry.
          </p>
        </div>
        <button type="button" className="ent-btn" onClick={triggerRecover}>Check Recovery Endpoint</button>
      </div>

      <div className="ent-card">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Endpoint Status</h2>
        <pre className="ent-pre">{notice}</pre>
      </div>
    </>
  );
}
