import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = String(body.text ?? "");
  const lang = String(body.lang ?? "bn-BD");

  for (const path of ["/voice/synthesize", "/api/voice", "/voice"]) {
    try {
      const r = await fetch(`http://127.0.0.1:18411${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (r.ok) {
        const data = await r.json().catch(() => ({ ok: true }));
        return NextResponse.json({ connected: true, endpoint: path, data }, { headers: { "Cache-Control": "no-store" } });
      }
    } catch {
      // try next path
    }
  }

  return NextResponse.json(
    {
      connected: false,
      voiceBackend: "NOT CONNECTED",
      browserSpeechSynthesis: "AVAILABLE_IN_CLIENT",
      lang,
      text,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
