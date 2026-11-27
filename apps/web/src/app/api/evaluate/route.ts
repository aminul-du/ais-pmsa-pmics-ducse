import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function scoreInput(payload: string, modality: string, persistence: number) {
  const lower = payload.toLowerCase();
  const riskTokens = ["ignore previous", "system override", "exfiltrate", "backdoor", "sleeper", "poison", "bypass"];
  const hits = riskTokens.filter((t) => lower.includes(t)).length;
  const P = modality === "unverified_external" ? 0.85 : 0.18;
  const S = Math.min(1, Math.max(0.1, persistence));
  const I = hits > 0 ? Math.min(1, 0.45 + hits * 0.25) : 0.12;
  const B = hits > 0 ? 0.72 : 0.14;
  const L = /[^\x00-\x7F]/.test(payload) || /\b(amar|aamar|amr)\b/i.test(payload) ? 0.16 : 0.10;
  const mrs = Math.round((0.25 * P + 0.15 * S + 0.30 * I + 0.20 * B + 0.10 * L) * 1000) / 1000;
  const tier = mrs >= 0.6 ? "QUARANTINE (1440m)" : mrs >= 0.3 ? "STAGING (60m)" : "ACTIVE_STORE";
  return { mrs, tier, factors: { P, S, I, B, L }, weights: { P: 0.25, S: 0.15, I: 0.30, B: 0.20, L: 0.10 } };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const content = String(body.content ?? body.prompt ?? "");
  const modality = String(body.modality ?? "bn-EN");
  const persistence = Number(body.persistence ?? 0.2);
  const mode = String(body.mode ?? "protected");

  let remoteResponse: unknown = null;
  let remoteConnected = false;

  try {
    const specRes = await fetch("http://127.0.0.1:18411/openapi.json", { cache: "no-store" });
    if (specRes.ok) {
      const spec = (await specRes.json()) as { paths?: Record<string, Record<string, unknown>> };
      const paths = spec.paths ?? {};
      const ep = ["/analyze", "/score", "/api/score", "/api/analyze", "/evaluate"].find((p) => paths[p] && "post" in paths[p]);
      if (ep) {
        const r = await fetch(`http://127.0.0.1:18411${ep}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, modality, persistence, mode }),
        });
        if (r.ok) {
          remoteConnected = true;
          remoteResponse = await r.json().catch(() => null);
        }
      }
    }
  } catch {
    remoteConnected = false;
  }

  const evaluation = scoreInput(content, modality, persistence);
  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      mode,
      modality,
      backendConnected: remoteConnected,
      remoteResponse,
      evaluation,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
