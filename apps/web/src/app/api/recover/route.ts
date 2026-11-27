import { NextResponse } from "next/server"; import { readAll, append } from "@/lib/ledger";
export const dynamic = "force-dynamic";
export async function POST(req:Request){const b=await req.json().catch(()=>({}));const hash=String(b.hash||"");const all=readAll();
  const target=all.find(e=>e.hash===hash);if(!target)return NextResponse.json({ok:false,error:"hash not found"},{status:404});
  const recovery={event:"recovery",recoveredHash:hash,recoveredAt:new Date().toISOString()};const entry=append(recovery);
  return NextResponse.json({ok:true,recovered:target,recoveryLedgerHash:entry.hash});}
export async function GET(){const all=readAll();const quarantined=all.filter(e=>String((e.data as any)?.tier??"").includes("QUARANTINE"));
  return NextResponse.json({quarantinedCount:quarantined.length,quarantined});}
