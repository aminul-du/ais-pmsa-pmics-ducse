import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const REPO=process.env.PMSA_REPO_ROOT||"/opt/workspace/ais-pmsa-pmics-ducse";
const FILE=path.join(REPO,"telemetry_ledger.jsonl");
export interface Entry{timestamp:string;prevHash:string;hash:string;data:Record<string,unknown>}
function sha(p:string,d:Record<string,unknown>){return crypto.createHash("sha256").update(p+JSON.stringify(d)).digest("hex")}
export function readAll():Entry[]{if(!fs.existsSync(FILE))return[];return fs.readFileSync(FILE,"utf8").split("\n").filter(Boolean).map(l=>{try{return JSON.parse(l) as Entry}catch{return null}}).filter((e):e is Entry=>e!==null)}
export function validate(es:Entry[]){if(!es.length)return false;let p="genesis";for(const e of es){if(e.prevHash!==p)return false;if(e.hash!==sha(p,e.data))return false;p=e.hash}return true}
export function append(d:Record<string,unknown>){const a=readAll();const p=a.length?a[a.length-1].hash:"genesis";const e:Entry={timestamp:new Date().toISOString(),prevHash:p,hash:sha(p,d),data:d};fs.appendFileSync(FILE,JSON.stringify(e)+"\n","utf8");return e}
export function status(){const a=readAll();return{connected:fs.existsSync(FILE),entries:a.length,chainValid:validate(a),quarantined:a.filter(e=>String((e.data as any)?.evaluation?.tier??"").includes("QUARANTINE")).length,records:a.slice(-10)}}
