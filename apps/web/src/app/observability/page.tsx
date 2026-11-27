"use client";

import React, { useEffect, useState } from "react";

export default function ObservabilityPage() {
  const [state, setState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/state", { cache: "no-store" })
      .then((r) => r.json())
      .then(setState)
      .catch(() => null);
  }, []);

  return (
    <>
      <div className="ent-card">
        <span className="ent-pill pill-warn">EXTERNAL TELEMETRY: NOT CONNECTED</span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Telemetry & Integrations</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
          Displays current connection status for external backends, GCP billing, and DNS.
        </p>
      </div>

      <div className="ent-card">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Connection Status Snapshot</h2>
        <pre className="ent-pre">{JSON.stringify(state ?? { status: "NOT CONNECTED" }, null, 2)}</pre>
      </div>
    </>
  );
}
