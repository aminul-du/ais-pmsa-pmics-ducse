"use client";

import React, { useEffect, useState } from "react";

export default function ReportsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/state", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  return (
    <>
      <div className="ent-card">
        <span className="ent-pill pill-info">UI & INTEGRATION REPORT</span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Audit & Blue-Green Reports</h1>
      </div>

      <div className="ent-card">
        <table className="ent-table">
          <thead>
            <tr><th>Component</th><th>State</th></tr>
          </thead>
          <tbody>
            <tr><td>Multi-Page Research UI</td><td><span className="ent-pill pill-ok">BUILT & SERVING</span></td></tr>
            <tr><td>/voice-studio Route</td><td><span className="ent-pill pill-ok">RESOLVED</span></td></tr>
            <tr><td>External APIs / GCP Billing / DNS</td><td><span className="ent-pill pill-warn">NOT CONNECTED</span></td></tr>
          </tbody>
        </table>
        <pre className="ent-pre" style={{ marginTop: "0.85rem" }}>{JSON.stringify(data ?? { status: "NOT CONNECTED" }, null, 2)}</pre>
      </div>
    </>
  );
}
