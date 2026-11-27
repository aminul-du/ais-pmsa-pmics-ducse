import { NextResponse } from "next/server"; import { status } from "@/lib/ledger";
export const dynamic = "force-dynamic";
async function probe(url: string, timeoutMs=1500){const c=new AbortController();const t=setTimeout(()=>c.abort(),timeoutMs);const t0=Date.now();
  try{const r=await fetch(url,{signal:c.signal,cache:"no-store"});const txt=await r.text();let p:unknown=null;try{p=JSON.parse(txt)}catch{p=txt.slice(0,200)}
    return{connected:r.ok,status:r.ok?"CONNECTED":"UNHEALTHY",httpStatus:r.status,latencyMs:Date.now()-t0,payload:p}}
  catch{return{connected:false,status:"NOT CONNECTED",httpStatus:0,latencyMs:Date.now()-t0,payload:null}}finally{clearTimeout(t)}}
export async function GET(){
  const [trustApi,digitalTwin,quicSpoke]=await Promise.all([probe("http://127.0.0.1:18411/health"),probe("http://127.0.0.1:8090/health"),probe("http://127.0.0.1:18413/health")]);
  const twinState=digitalTwin.connected?{connected:true,status:"CONNECTED",httpStatus:200,latencyMs:digitalTwin.latencyMs,payload:digitalTwin.payload}:{connected:false,status:"NOT CONNECTED",httpStatus:0,latencyMs:0,payload:null};
  return NextResponse.json({timestamp:new Date().toISOString(),service:"ais-pmsa-lab",backends:{trustApi,digitalTwin,twinState,quicSpoke},ledger:status()});}
