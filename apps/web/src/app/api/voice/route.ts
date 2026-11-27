import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  return NextResponse.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
      lang: String(body.lang ?? "bn-BD"),
      text: String(body.text ?? ""),
      synthesisMode: "client-or-lab-ready",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
