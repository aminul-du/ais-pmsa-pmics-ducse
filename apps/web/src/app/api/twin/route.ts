import { NextResponse } from "next/server"; export const dynamic = "force-dynamic";
async function probe(url:string,timeoutMs=1500){const c=new AbortController();const t=setTimeout(()=>c.abort(),timeoutMs);
  try{const r=await fetch(url,{signal:c.signal,cache:"no-store"});const txt=await r.text();let p:unknown=null;try{p=JSON.parse(txt)}catch{p=txt.slice(0,200)}return{connected:r.ok,status:r.status,payload:p}}
  catch{return{connected:false,status:0,payload:null}}finally{clearTimeout(t)}}
export async function GET(){const h=await probe("http://127.0.0.1:8090/health");
  return NextResponse.json({timestamp:new Date().toISOString(),connected:h.connected,status:h.connected?"CONNECTED":"NOT CONNECTED",endpoints:{"/health":h.payload}});}
