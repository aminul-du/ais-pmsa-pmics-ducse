import { NextResponse } from "next/server";
import fs from "node:fs";

export const dynamic = "force-dynamic";

export async function GET() {
  let health: unknown = null;
  let connected = false;
  try {
    const r = await fetch("http://127.0.0.1:8090/health", { cache: "no-store" });
    connected = r.ok;
    const txt = await r.text();
    try { health = JSON.parse(txt); } catch { health = txt; }
  } catch {
    connected = false;
  }

  const ledgerPath = "/opt/workspace/ais-pmsa-pmics-ducse/telemetry_ledger.jsonl";
  let entries = 0;
  let latestMrs = 0;
  let quarantinedCount = 0;
  if (fs.existsSync(ledgerPath)) {
    const lines = fs.readFileSync(ledgerPath, "utf-8").split("\n").map((l) => l.trim()).filter(Boolean);
    entries = lines.length;
    for (const line of lines) {
      try {
        const obj = JSON.parse(line) as Record<string, unknown>;
        const mrs = Number(obj.mrs ?? 0);
        latestMrs = mrs;
        if (String(obj.tier ?? "").toUpperCase().includes("QUARANTINE") || mrs >= 0.6) {
          quarantinedCount += 1;
        }
      } catch {
        // skip malformed line
      }
    }
  }

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      connected,
      status: connected ? "CONNECTED" : "NOT CONNECTED",
      health,
      state: {
        engine: "shorborno-digital-twin",
        ledgerEntries: entries,
        latestMrs,
        quarantinedCount,
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
