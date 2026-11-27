"use client";

import React, { useState } from "react";
import Twin3DCanvas from "../../components/Twin3DCanvas";

export default function TwinPage() {
  const [previewRisk, setPreviewRisk] = useState(0.18);
  const [previewQuarantined, setPreviewQuarantined] = useState(0);

  return (
    <>
      <div className="ent-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className="ent-pill pill-info">3D CANVAS READY</span>
            <span className="ent-pill pill-warn">TWIN TELEMETRY: NOT CONNECTED</span>
          </div>
          <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Digital Twin 3D</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="ent-btn" onClick={() => { setPreviewRisk(0.65); setPreviewQuarantined(3); }}>
            UI State Preview: High Risk
          </button>
          <button type="button" className="ent-btn" onClick={() => { setPreviewRisk(0.18); setPreviewQuarantined(0); }}>
            UI State Preview: Low Risk
          </button>
        </div>
      </div>

      <div className="ent-grid-2">
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>3D Mesh Visualization (UI Preview)</h2>
          <Twin3DCanvas riskScore={previewRisk} quarantinedCount={previewQuarantined} />
        </div>
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Digital Twin Connection Status</h2>
          <pre className="ent-pre">{JSON.stringify({ engine: "Digital Twin", status: "NOT CONNECTED" }, null, 2)}</pre>
        </div>
      </div>
    </>
  );
}
