import { NextResponse } from "next/server"; import fs from "node:fs"; import path from "node:path";
export const dynamic = "force-dynamic"; const REPO=process.env.PMSA_REPO_ROOT||"/opt/workspace/ais-pmsa-pmics-ducse";
function rj(p:string):unknown[]{if(!fs.existsSync(p))return[];return fs.readFileSync(p,"utf8").split("\n").filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return{_corrupt:l.slice(0,100)}}});}
export async function GET(){const ledger=rj(path.join(REPO,"telemetry_ledger.jsonl")).slice(-50);const evidence=rj(path.join(REPO,"research/evidence/lab-evidence.jsonl")).slice(-50);
  return NextResponse.json({timestamp:new Date().toISOString(),ledger_events:ledger,evidence_events:evidence,events:[...ledger,...evidence]});}
