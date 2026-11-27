import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = await fetch("http://127.0.0.1:18411/recover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: "pmsa-lab-ui", timestamp: new Date().toISOString() }),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(
    { connected: res.ok, ...data },
    { status: res.status, headers: { "Cache-Control": "no-store" } }
  );
}
