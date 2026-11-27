import { NextResponse } from "next/server";
import fs from "node:fs";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

async function probeEndpoint(url: string, timeoutMs = 1500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = performance.now();
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    const latencyMs = Math.round((performance.now() - t0) * 100) / 100;
    const text = await res.text();
    let payload: unknown = null;
    try { payload = JSON.parse(text); } catch { payload = text.slice(0, 200); }
    return { connected: res.ok, status: res.ok ? "CONNECTED" : "NOT CONNECTED", httpStatus: res.status, latencyMs, payload };
  } catch {
    const latencyMs = Math.round((performance.now() - t0) * 100) / 100;
    return { connected: false, status: "NOT CONNECTED", httpStatus: 0, latencyMs, payload: null };
  } finally {
    clearTimeout(timer);
  }
}

function readLedger(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return { connected: false, status: "NOT CONNECTED", entries: 0, chainValid: false, quarantined: 0, records: [] as Record<string, unknown>[] };
  }
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").map((l) => l.trim()).filter(Boolean);
  let chainValid = true;
  let expectedPrev: string | null = null;
  let quarantined = 0;
  const records: Record<string, unknown>[] = [];

  lines.forEach((line, idx) => {
    try {
      const item = JSON.parse(line) as Record<string, unknown>;
      records.push(item);
      const tier = String(item.tier ?? item.decision ?? "").toUpperCase();
      if (tier.includes("QUARANTINE") || Number(item.mrs ?? 0) >= 0.6) quarantined += 1;
      if (idx > 0 && expectedPrev && typeof item.prev_hash === "string" && item.prev_hash !== expectedPrev) {
        chainValid = false;
      }
      expectedPrev = typeof item.curr_hash === "string"
        ? item.curr_hash
        : crypto.createHash("sha256").update(line).digest("hex");
    } catch {
      chainValid = false;
    }
  });

  return {
    connected: true,
    status: "CONNECTED",
    entries: records.length,
    chainValid,
    quarantined,
    records: records.slice(-20).reverse(),
  };
}

export async function GET() {
  const [trustApi, digitalTwin, quicSpoke] = await Promise.all([
    probeEndpoint("http://127.0.0.1:18411/health"),
    probeEndpoint("http://127.0.0.1:8090/health"),
    probeEndpoint("http://127.0.0.1:18413/health"),
  ]);

  const ledger = readLedger("/opt/workspace/ais-pmsa-pmics-ducse/telemetry_ledger.jsonl");

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      service: "ais-pmsa-lab",
      backends: { trustApi, digitalTwin, quicSpoke },
      ledger,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
