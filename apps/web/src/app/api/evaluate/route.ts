import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const LEDGER_PATH = "/opt/workspace/ais-pmsa-pmics-ducse/telemetry_ledger.jsonl";

function appendHashChainEntry(event: string, mrs: number, tier: string, mode: string, modality: string) {
  let prevHash = "0".repeat(64);
  let seq = 0;
  if (fs.existsSync(LEDGER_PATH)) {
    const lines = fs.readFileSync(LEDGER_PATH, "utf-8").split("\n").map((l) => l.trim()).filter(Boolean);
    seq = lines.length;
    if (lines.length > 0) {
      try {
        const last = JSON.parse(lines[lines.length - 1]) as Record<string, unknown>;
        prevHash = typeof last.curr_hash === "string"
          ? last.curr_hash
          : crypto.createHash("sha256").update(lines[lines.length - 1]).digest("hex");
      } catch {
        prevHash = crypto.createHash("sha256").update(lines[lines.length - 1]).digest("hex");
      }
    }
  }
  const entry: Record<string, unknown> = {
    seq,
    ts: new Date().toISOString(),
    event,
    mrs,
    tier,
    mode,
    modality,
    prev_hash: prevHash,
  };
  const canonical = JSON.stringify(entry, Object.keys(entry).sort());
  entry.curr_hash = crypto.createHash("sha256").update(canonical).digest("hex");
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(entry) + "\n", "utf-8");
  return entry;
}

function scorePayload(content: string, modality: string, persistence: number, mode: string) {
  const lower = content.toLowerCase();
  const cues = ["ignore previous", "system override", "exfiltrate", "backdoor", "sleeper", "poison", "bypass"];
  const hits = cues.filter((c) => lower.includes(c)).length;
  const P = modality === "unverified_external" ? 0.85 : 0.18;
  const S = Math.min(1, Math.max(0.1, persistence));
  const I = hits > 0 ? Math.min(1, 0.45 + hits * 0.25) : 0.12;
  const B = hits > 0 ? 0.72 : 0.14;
  const L = /[^\x00-\x7F]/.test(content) || /\b(amar|aamar|amr)\b/i.test(content) ? 0.16 : 0.10;
  const mrs = Math.round((0.25 * P + 0.15 * S + 0.30 * I + 0.20 * B + 0.10 * L) * 1000) / 1000;
  const tier = mode === "unprotected"
    ? "UNPROTECTED_COMMIT"
    : mrs >= 0.6
      ? "QUARANTINE (1440m)"
      : mrs >= 0.3
        ? "STAGING (60m)"
        : "ACTIVE_STORE";
  return { mrs, tier, mode, factors: { P, S, I, B, L }, weights: { P: 0.25, S: 0.15, I: 0.30, B: 0.20, L: 0.10 } };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const content = String(body.content ?? body.prompt ?? "");
  const modality = String(body.modality ?? "bn-EN");
  const persistence = Number(body.persistence ?? 0.2);
  const mode = String(body.mode ?? "protected");

  let trustReachable = false;
  try {
    const h = await fetch("http://127.0.0.1:18411/health", { cache: "no-store" });
    trustReachable = h.ok;
  } catch {
    trustReachable = false;
  }

  const evaluation = scorePayload(content, modality, persistence, mode);
  const ledgerEntry = appendHashChainEntry("MEMORY_EVALUATION", evaluation.mrs, evaluation.tier, mode, modality);

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      mode,
      modality,
      trustEngineReachable: trustReachable,
      evaluation,
      ledgerEntry,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
