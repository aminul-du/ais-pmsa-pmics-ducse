import { NextResponse } from "next/server"; import fs from "node:fs"; import path from "node:path";
export const dynamic = "force-dynamic"; const REPO=process.env.PMSA_REPO_ROOT||"/opt/workspace/ais-pmsa-pmics-ducse";
const FILE=path.join(REPO,"research/evidence/lab-evidence.jsonl");
function readAll(){if(!fs.existsSync(FILE))return[];return fs.readFileSync(FILE,"utf8").split("\n").filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return{_corrupt:l.slice(0,100)}}});}
export async function GET(){const records=readAll();return NextResponse.json({count:records.length,records});}
export async function POST(req:Request){const b=await req.json().catch(()=>({}));const entry={recordedAt:new Date().toISOString(),...b};
  fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.appendFileSync(FILE,JSON.stringify(entry)+"\n","utf8");return NextResponse.json({ok:true,entry});}
