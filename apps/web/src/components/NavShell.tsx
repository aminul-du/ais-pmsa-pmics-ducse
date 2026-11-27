"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ThemeMode = "light" | "dark" | "contrast";

const NAV_GROUPS = [
  {
    heading: "Enterprise Studios",
    items: [
      { href: "/", label: "Executive Command", code: "CMD" },
      { href: "/chat", label: "Enterprise Chat", code: "RTE" },
      { href: "/voice-studio", label: "Voice Studio", code: "VOX" },
      { href: "/workflow-studio", label: "Workflow Studio", code: "FLW" },
      { href: "/agent-studio", label: "Agent Studio", code: "AGT" },
      { href: "/knowledge-hub", label: "Knowledge Hub", code: "KB" },
    ],
  },
  {
    heading: "Security & Research",
    items: [
      { href: "/sandbox", label: "Research Sandbox", code: "LAB" },
      { href: "/security", label: "Memory Security & Enclave", code: "ENC" },
      { href: "/twin", label: "Digital Twin 3D", code: "3D" },
      { href: "/trust", label: "Trust Score & Ledger", code: "LED" },
    ],
  },
  {
    heading: "Observability & Governance",
    items: [
      { href: "/observability", label: "Telemetry & Integrations", code: "OBS" },
      { href: "/visualizations", label: "Telemetry Charts & Mesh", code: "VIZ" },
      { href: "/reports", label: "Audit & Blue-Green Reports", code: "RPT" },
    ],
  },
];

export default function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem("pmsa-theme")) as ThemeMode | null;
    const initial: ThemeMode = saved === "dark" || saved === "contrast" || saved === "light" ? saved : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const applyTheme = (next: ThemeMode) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pmsa-theme", next);
    }
  };

  return (
    <div className="ent-shell">
      <aside className={`ent-rail ${collapsed ? "collapsed" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.35rem 0.5rem 0.85rem", borderBottom: "1px solid var(--border-hairline)", marginBottom: "0.4rem" }}>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>ShorbornoAI Enterprise</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>AIS-PMSA Research Suite</div>
            </div>
          )}
          <button
            type="button"
            className="ent-btn"
            style={{ padding: "0.3rem 0.55rem", fontSize: "0.75rem" }}
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? ">>" : "||"}
          </button>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.heading} style={{ marginBottom: "0.65rem" }}>
            {!collapsed && (
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", padding: "0.35rem 0.75rem" }}>
                {group.heading}
              </div>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`ent-link ${active ? "active" : ""}`} title={item.label}>
                  <span>{collapsed ? item.code : item.label}</span>
                  {!collapsed && (
                    <span style={{ fontSize: "0.66rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      {item.code}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {!collapsed && (
          <div style={{ marginTop: "auto", paddingTop: "0.85rem", borderTop: "1px solid var(--border-hairline)", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            <div>Repo: <code>ais-pmsa-pmics-ducse</code></div>
            <div>Mode: <code>LOCAL RESEARCH UI</code></div>
          </div>
        )}
      </aside>

      <div className="ent-main">
        <header className="ent-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
            <span className="ent-pill pill-info">RESEARCH WORKSPACE</span>
            <span className="ent-pill pill-warn">EXTERNAL APIS: NOT CONNECTED</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginRight: "0.25rem" }}>Theme:</span>
            <button type="button" className={`ent-btn ${theme === "light" ? "ent-btn-primary" : ""}`} style={{ padding: "0.3rem 0.65rem", fontSize: "0.76rem" }} onClick={() => applyTheme("light")}>
              Light
            </button>
            <button type="button" className={`ent-btn ${theme === "dark" ? "ent-btn-primary" : ""}`} style={{ padding: "0.3rem 0.65rem", fontSize: "0.76rem" }} onClick={() => applyTheme("dark")}>
              Dark
            </button>
            <button type="button" className={`ent-btn ${theme === "contrast" ? "ent-btn-primary" : ""}`} style={{ padding: "0.3rem 0.65rem", fontSize: "0.76rem" }} onClick={() => applyTheme("contrast")}>
              High Contrast
            </button>
          </div>
        </header>

        <main className="ent-content">{children}</main>
      </div>
    </div>
  );
}
