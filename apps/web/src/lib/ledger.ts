import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const REPO = process.env.PMSA_REPO_ROOT || "/opt/workspace/ais-pmsa-pmics-ducse";
const FILE = path.join(REPO, "telemetry_ledger.jsonl");
export interface Entry { timestamp: string; prevHash: string; hash: string; data: Record<string, unknown>; }
function sha(prev: string, data: Record<string, unknown>) { return crypto.createHash("sha256").update(prev + JSON.stringify(data)).digest("hex"); }
export function readAll(): Entry[] { if (!fs.existsSync(FILE)) return [];
  return fs.readFileSync(FILE,"utf8").split("\n").filter(Boolean).map(l=>{try{return JSON.parse(l) as Entry}catch{return null}}).filter((e): e is Entry => e!==null); }
export function validate(es: Entry[]) { if (!es.length) return false; let p="genesis";
  for (const e of es){ if(e.prevHash!==p) return false; if(e.hash!==sha(p,e.data)) return false; p=e.hash; } return true; }
export function append(data: Record<string, unknown>) { const all=readAll(); const prev=all.length?all[all.length-1].hash:"genesis";
  const entry: Entry={timestamp:new Date().toISOString(),prevHash:prev,hash:sha(prev,data),data};
  fs.appendFileSync(FILE, JSON.stringify(entry)+"\n","utf8"); return entry; }
export function status() { const all=readAll(); return { connected: fs.existsSync(FILE), entries: all.length,
  chainValid: validate(all), quarantined: all.filter(e=>String((e.data as any)?.tier??"").includes("QUARANTINE")).length, records: all.slice(-10) }; }
