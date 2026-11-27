import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const EVIDENCE_FILE = "/opt/workspace/ais-pmsa-pmics-ducse/research/evidence/lab-evidence.jsonl";

export async function GET() {
  fs.mkdirSync(path.dirname(EVIDENCE_FILE), { recursive: true });
  if (!fs.existsSync(EVIDENCE_FILE)) {
    return NextResponse.json({ count: 0, records: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  const lines = fs.readFileSync(EVIDENCE_FILE, "utf-8").split("\n").map((l) => l.trim()).filter(Boolean);
  const records = lines.slice(-25).reverse().map((l) => {
    try { return JSON.parse(l); } catch { return { raw: l }; }
  });
  return NextResponse.json({ count: lines.length, records }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  fs.mkdirSync(path.dirname(EVIDENCE_FILE), { recursive: true });
  const entry = {
    recordedAt: new Date().toISOString(),
    label: String(body.label ?? "research_run"),
    summary: body.summary ?? {},
  };
  fs.appendFileSync(EVIDENCE_FILE, JSON.stringify(entry) + "\n", "utf-8");
  return NextResponse.json({ ok: true, entry }, { headers: { "Cache-Control": "no-store" } });
}
