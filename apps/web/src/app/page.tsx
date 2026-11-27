"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Twin3DCanvas from "../components/Twin3DCanvas";

interface BackendProbe {
  connected?: boolean;
  status?: string;
  latencyMs?: number;
}

interface StatePayload {
  timestamp?: string;
  backends?: Record<string, BackendProbe>;
  ledger?: {
    connected?: boolean;
    status?: string;
    entries?: number;
    chainValid?: boolean;
    quarantined?: number;
    records?: Array<Record<string, unknown>>;
  };
}

export default function ExecutiveCommandPage() {
  const [state, setState] = useState<StatePayload | null>(null);
  const [twinData, setTwinData] = useState<Record<string, unknown> | null>(null);
  const [obsEvents, setObsEvents] = useState<Array<Record<string, unknown>>>([]);
  const [evidenceCount, setEvidenceCount] = useState<number>(0);

  const hydrateAll = async () => {
    const [st, tw, ob, ev] = await Promise.all([
      fetch("/api/state", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/twin", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/observability", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/evidence", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);
    if (st) setState(st);
    if (tw) setTwinData(tw);
    if (ob && Array.isArray(ob.events)) setObsEvents(ob.events);
    if (ev && typeof ev.count === "number") setEvidenceCount(ev.count);
  };

  useEffect(() => {
    hydrateAll();
    const id = setInterval(hydrateAll, 5000);
    return () => clearInterval(id);
  }, []);

  const backends = state?.backends ?? {};
  const connectedCount = Object.values(backends).filter((b) => b?.connected).length;
  const totalBackends = Object.keys(backends).length || 4;
  const ledgerRecords = state?.ledger?.records ?? [];
  const latestMrs = ledgerRecords.length > 0 ? Number(ledgerRecords[0]?.mrs ?? 0) : 0;
  const quarantined = state?.ledger?.quarantined ?? 0;

  return (
    <>
      <div className="ent-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", gap: "0.45rem", marginBottom: "0.45rem", flexWrap: "wrap" }}>
            <span className="ent-pill pill-info">SHORBORNOAI • AIS-PMSA</span>
            <span className={`ent-pill ${connectedCount > 0 ? "pill-ok" : "pill-warn"}`}>
              BACKENDS: {connectedCount}/{totalBackends} CONNECTED
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>
            ShorbornoAI & AIS-PMSA Research Dashboard
          </h1>
          <p style={{ margin: "0.4rem 0 0", color: "var(--text-secondary)", maxWidth: "820px" }}>
            Live hydration from /api/state, /api/twin, /api/observability, and /api/evidence with real ledger and risk trend views.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="ent-btn" onClick={hydrateAll}>Refresh Now</button>
          <Link href="/sandbox" className="ent-btn ent-btn-primary">Research Sandbox</Link>
        </div>
      </div>

      <div className="ent-grid-4">
        <div className="ent-card">
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>Connected Backends</div>
          <div style={{ marginTop: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "1.2rem" }}>{connectedCount} / {totalBackends}</strong>
            <span className={`ent-pill ${connectedCount > 0 ? "pill-ok" : "pill-warn"}`}>
              {connectedCount > 0 ? "LIVE" : "NOT CONNECTED"}
            </span>
          </div>
        </div>

        <div className="ent-card">
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>Ledger Entries</div>
          <div style={{ marginTop: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "1.2rem" }}>{state?.ledger?.entries ?? 0}</strong>
            <span className={`ent-pill ${state?.ledger?.chainValid ? "pill-ok" : "pill-warn"}`}>
              {state?.ledger?.chainValid ? "CHAIN VALID" : "CHECK"}
            </span>
          </div>
        </div>

        <div className="ent-card">
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>Latest Ledger MRS</div>
          <div style={{ marginTop: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "1.2rem" }}>{latestMrs.toFixed(3)}</strong>
            <span className="ent-pill pill-info">QUARANTINED: {quarantined}</span>
          </div>
        </div>

        <div className="ent-card">
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>Evidence Records</div>
          <div style={{ marginTop: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: "1.2rem" }}>{evidenceCount}</strong>
            <span className="ent-pill pill-info">EVENTS: {obsEvents.length}</span>
          </div>
        </div>
      </div>

      <div className="ent-grid-2">
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>MRS Risk Trend (Recent Ledger Entries)</h2>
          {ledgerRecords.length === 0 ? (
            <div style={{ color: "var(--text-secondary)", fontSize: "0.86rem" }}>No ledger entries recorded yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {ledgerRecords.slice(0, 8).map((rec, idx) => {
                const score = Math.min(1, Math.max(0, Number(rec.mrs ?? 0)));
                const pct = Math.round(score * 100);
                return (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                      <span><code>{String(rec.tier ?? rec.event ?? `entry-${idx + 1}`)}</code></span>
                      <strong>MRS {score.toFixed(3)}</strong>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--bg-subtle)", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: score >= 0.6 ? "#be123c" : score >= 0.3 ? "#d97706" : "var(--accent-primary)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Digital Twin State ({String(twinData?.status ?? "PROBING")})</h2>
          <Twin3DCanvas riskScore={latestMrs} quarantinedCount={quarantined} />
        </div>
      </div>

      <div className="ent-grid-2">
        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Backend Probes (/api/state)</h2>
          <table className="ent-table">
            <thead>
              <tr><th>Service</th><th>Status</th><th>Latency</th></tr>
            </thead>
            <tbody>
              {Object.entries(backends).map(([name, info]) => (
                <tr key={name}>
                  <td><code>{name}</code></td>
                  <td>
                    <span className={`ent-pill ${info?.connected ? "pill-ok" : "pill-warn"}`}>
                      {info?.connected ? "CONNECTED" : "NOT CONNECTED"}
                    </span>
                  </td>
                  <td><code>{info?.latencyMs ?? "-"} ms</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ent-card">
          <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Dashboard Routes</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.4rem" }}>
            <Link href="/chat" className="ent-link">/chat</Link>
            <Link href="/voice-studio" className="ent-link">/voice-studio</Link>
            <Link href="/workflow-studio" className="ent-link">/workflow-studio</Link>
            <Link href="/agent-studio" className="ent-link">/agent-studio</Link>
            <Link href="/knowledge-hub" className="ent-link">/knowledge-hub</Link>
            <Link href="/sandbox" className="ent-link">/sandbox</Link>
            <Link href="/security" className="ent-link">/security</Link>
            <Link href="/twin" className="ent-link">/twin</Link>
            <Link href="/trust" className="ent-link">/trust</Link>
            <Link href="/observability" className="ent-link">/observability</Link>
            <Link href="/visualizations" className="ent-link">/visualizations</Link>
            <Link href="/reports" className="ent-link">/reports</Link>
          </div>
        </div>
      </div>
    </>
  );
}
