import { NextResponse } from "next/server"; export const dynamic = "force-dynamic";
export async function GET(){return NextResponse.json({timestamp:new Date().toISOString(),voiceBackend:"NOT CONNECTED",browserSpeechSynthesis:"READY",languages:["bn-BD","en-US"]});}
