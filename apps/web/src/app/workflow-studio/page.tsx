"use client";

import React, { useState } from "react";

const STAGES = [
  { stage: "1. Write Screening", status: "NOT CONNECTED" },
  { stage: "2. Consensus Validation", status: "NOT CONNECTED" },
  { stage: "3. Behavioral Shadow", status: "NOT CONNECTED" },
  { stage: "4. HMAC Integrity", status: "NOT CONNECTED" },
  { stage: "5. Three-Tier Remediation", status: "NOT CONNECTED" },
];

export default function WorkflowStudioPage() {
  const [selected, setSelected] = useState(STAGES[0]);

  return (
    <>
      <div className="ent-card">
        <span className="ent-pill pill-warn">PIPELINE RUNTIME: NOT CONNECTED</span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Workflow Studio</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
          5-stage memory security pipeline topology. Live execution requires connecting the backend worker.
        </p>
      </div>

      <div className="ent-grid-2">
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Pipeline Stages</h2>
          <table className="ent-table">
            <thead>
              <tr><th>Stage</th><th>Status</th></tr>
            </thead>
            <tbody>
              {STAGES.map((s) => (
                <tr key={s.stage} onClick={() => setSelected(s)} style={{ cursor: "pointer" }}>
                  <td><strong>{s.stage}</strong></td>
                  <td><span className="ent-pill pill-warn">{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Stage Details</h2>
          <pre className="ent-pre">{JSON.stringify(selected, null, 2)}</pre>
        </div>
      </div>
    </>
  );
}
