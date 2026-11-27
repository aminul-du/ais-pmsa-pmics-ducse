"use client";

import React, { useState } from "react";

export default function AgentStudioPage() {
  const [policy, setPolicy] = useState("quarantine-ge-0.60");
  const [output, setOutput] = useState("Agent runtime: NOT CONNECTED");

  const checkStatus = async () => {
    const r = await fetch("/api/state", { cache: "no-store" });
    const d = await r.json();
    setOutput(JSON.stringify({ policy, agentService: "NOT CONNECTED", integrations: d.integrations }, null, 2));
  };

  return (
    <>
      <div className="ent-card">
        <span className="ent-pill pill-warn">AGENT SERVICE: NOT CONNECTED</span>
        <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Agent Studio</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)" }}>
          Policy configuration view for research agents. Live agent execution is NOT CONNECTED.
        </p>
      </div>

      <div className="ent-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <select className="ent-select" style={{ maxWidth: "320px" }} value={policy} onChange={(e) => setPolicy(e.target.value)}>
          <option value="quarantine-ge-0.60">Threshold Policy: Quarantine at 0.60+</option>
          <option value="staging-ge-0.30">Threshold Policy: Staging at 0.30+</option>
        </select>
        <div>
          <button type="button" className="ent-btn ent-btn-primary" onClick={checkStatus}>Inspect Integration Status</button>
        </div>
        <pre className="ent-pre">{output}</pre>
      </div>
    </>
  );
}
