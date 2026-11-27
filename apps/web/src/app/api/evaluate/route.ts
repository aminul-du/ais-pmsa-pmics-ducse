import { NextResponse } from "next/server"; import { append } from "@/lib/ledger";
export const dynamic = "force-dynamic";
const W={P:0.25,S:0.15,I:0.3,B:0.2,L:0.1} as const;
const PRESETS:Record<string,Record<keyof typeof W,number>>={"bn-EN":{P:0.18,S:0.20,I:0.12,B:0.14,L:0.16},"unverified_external":{P:0.85,S:0.65,I:0.70,B:0.72,L:0.10},"verified_internal":{P:0.10,S:0.05,I:0.10,B:0.10,L:0.10}};
function score(f:Record<string,number>,mode:"protected"|"unprotected"){
  const mrs=(Object.keys(W) as (keyof typeof W)[]).reduce((s,k)=>s+(f[k]||0)*W[k],0);
  let tier="ACTIVE_STORE";if(mode==="protected"){if(mrs>=0.6)tier="QUARANTINE (1440m)";else if(mrs>=0.4)tier="REVIEW (60m)";else if(mrs>=0.2)tier="MONITOR";}
  return{mrs:Math.round(mrs*1000)/1000,tier,factors:f,weights:W};}
export async function POST(req:Request){const b=await req.json().catch(()=>({}));const mode=(b.mode==="unprotected"?"unprotected":"protected") as "protected"|"unprotected";
  const modality=String(b.modality||"bn-EN");const payload=String(b.payload||"");const persistence=Number(b.persistence??0.2);
  const f=PRESETS[modality]||PRESETS["bn-EN"];const evaluation=score(f,mode);
  const result={timestamp:new Date().toISOString(),mode,modality,payload,persistence,backendConnected:false,remoteResponse:null,evaluation};
  const entry=append(result as unknown as Record<string,unknown>);return NextResponse.json({...result,ledgerHash:entry.hash});}
export async function GET(){return POST(new Request("http://localhost",{method:"POST",body:JSON.stringify({mode:"protected",modality:"bn-EN"})}));}
