import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  for (const path of ["/api/recover", "/recover"]) {
    try {
      const res = await fetch(`http://127.0.0.1:18411${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "shorbornoai-lab-ui", timestamp: new Date().toISOString() }),
      });
      if (res.ok) {
        const payload = await res.json().catch(() => ({ ok: true }));
        return NextResponse.json({ connected: true, endpoint: path, payload });
      }
    } catch {
      // try next path
    }
  }
  return NextResponse.json({ connected: false, status: "NOT CONNECTED" }, { status: 503 });
}
