import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";

export const dynamic = "force-dynamic";

const EVENTS_FILE = "/tmp/pmsa-lab-events.jsonl";

export async function GET() {
  let events: unknown[] = [];
  if (fs.existsSync(EVENTS_FILE)) {
    events = fs.readFileSync(EVENTS_FILE, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(-25)
      .reverse()
      .map((l) => {
        try { return JSON.parse(l); } catch { return { raw: l }; }
      });
  }
  return NextResponse.json({ timestamp: new Date().toISOString(), events }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const record = {
    ts: new Date().toISOString(),
    event: String(body.event ?? "telemetry_probe"),
    module: String(body.module ?? "lab"),
    mrs: Number(body.mrs ?? 0.14),
  };
  fs.appendFileSync(EVENTS_FILE, JSON.stringify(record) + "\n", "utf-8");
  return NextResponse.json({ ok: true, record }, { headers: { "Cache-Control": "no-store" } });
}
