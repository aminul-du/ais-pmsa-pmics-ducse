"use client";

import React, { useState } from "react";

const ARTIFACTS = [
  { name: "AIS-PMSA Dual-Path Formula Specification", store: "NOT CONNECTED", provenance: "Local Spec" },
  { name: "Banglish Orthographic Variant Set (Amar / Aamar / Amr)", store: "NOT CONNECTED", provenance: "Local Spec" },
  { name: "SHA-256 Telemetry Ledger Schema", store: "NOT CONNECTED", provenance: "Local Spec" },
];

export default function KnowledgeHubPage() {
  const [filter, setFilter] = useState("");
  const list = ARTIFACTS.filter((a) => a.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <div className="ent-card">
        <span className="ent-pill pill-warn">VECTOR / CORPUS STORE: NOT CONNECTED</span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Knowledge Hub</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
          Research artifact index. Live corpus retrieval is NOT CONNECTED.
        </p>
      </div>

      <div className="ent-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input className="ent-input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter research artifacts..." />
        <table className="ent-table">
          <thead>
            <tr><th>Artifact</th><th>Provenance</th><th>Backend Store</th></tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.name}>
                <td><strong>{row.name}</strong></td>
                <td>{row.provenance}</td>
                <td><span className="ent-pill pill-warn">{row.store}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
