"use client";

import React, { useEffect, useState } from "react";

export default function TrustLedgerLabPage() {
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [evidence, setEvidence] = useState<Record<string, unknown> | null>(null);
  const [recoverStatus, setRecoverStatus] = useState<string>("");

  const refresh = async () => {
    const [s, e] = await Promise.all([
      fetch("/api/state", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/evidence", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);
    setState(s);
    setEvidence(e);
  };

  useEffect(() => {
    refresh();
  }, []);

  const triggerRecover = async () => {
    const r = await fetch("/api/recover", { method: "POST" });
    const d = await r.json().catch(() => ({ status: "NOT CONNECTED" }));
    setRecoverStatus(JSON.stringify(d));
    refresh();
  };

  return (
    <>
      <div className="ent-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <span className="ent-pill pill-info">TRUST LEDGER & RECOVERY</span>
          <h1 style={{ margin: "0.4rem 0 0", fontSize: "1.5rem" }}>Memory Trust Ledger, Integrity & Quarantine Recovery</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="ent-btn" onClick={refresh}>Refresh Integrity</button>
          <button type="button" className="ent-btn ent-btn-alert" onClick={triggerRecover}>Recover / Quarantine Reset</button>
        </div>
      </div>

      {recoverStatus && (
        <div className="ent-card">
          <pre className="ent-pre">{recoverStatus}</pre>
        </div>
      )}

      <div className="ent-grid-2">
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Ledger & Backend Status</h2>
          <pre className="ent-pre">{JSON.stringify(state ?? { status: "loading" }, null, 2)}</pre>
        </div>
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Collected Research Evidence</h2>
          <pre className="ent-pre">{JSON.stringify(evidence ?? { status: "loading" }, null, 2)}</pre>
        </div>
      </div>
    </>
  );
}
