"use client";

import React from "react";
import Twin3DCanvas from "../../components/Twin3DCanvas";

const WEIGHTS = [
  { factor: "Integrity (I)", pct: 30 },
  { factor: "Provenance (P)", pct: 25 },
  { factor: "Behavioral (B)", pct: 20 },
  { factor: "Persistence (S)", pct: 15 },
  { factor: "Language (L)", pct: 10 },
];

export default function VisualizationsPage() {
  return (
    <>
      <div className="ent-card">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className="ent-pill pill-info">CHARTS & 3D MESH</span>
          <span className="ent-pill pill-warn">LIVE TELEMETRY STREAM: NOT CONNECTED</span>
        </div>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Telemetry Charts & Mesh</h1>
      </div>

      <div className="ent-grid-2">
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Configured Model Weights</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {WEIGHTS.map((w) => (
              <div key={w.factor}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "0.25rem" }}>
                  <span>{w.factor}</span>
                  <strong>{w.pct}%</strong>
                </div>
                <div style={{ width: "100%", height: "10px", background: "var(--bg-subtle)", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: `${w.pct * 2.5}%`, maxWidth: "100%", height: "100%", background: "var(--accent-primary)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>3D Mesh View</h2>
          <Twin3DCanvas riskScore={0.18} quarantinedCount={0} />
        </div>
      </div>
    </>
  );
}
