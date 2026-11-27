import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const endpoints: Record<string, unknown> = {};
  let anyConnected = false;
  for (const ep of ["/health", "/state", "/metrics"]) {
    try {
      const r = await fetch(`http://127.0.0.1:8090${ep}`, { cache: "no-store" });
      if (r.ok) {
        anyConnected = true;
        const txt = await r.text();
        try { endpoints[ep] = JSON.parse(txt); } catch { endpoints[ep] = txt; }
      }
    } catch {
      // ignore offline probe
    }
  }
  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      connected: anyConnected,
      status: anyConnected ? "CONNECTED" : "NOT CONNECTED",
      endpoints,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
