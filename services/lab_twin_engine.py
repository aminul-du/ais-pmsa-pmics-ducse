#!/usr/bin/env python3
import json
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

LEDGER_PATH = os.environ.get("PMSA_LEDGER_PATH", "/opt/workspace/ais-pmsa-pmics-ducse/telemetry_ledger.jsonl")


def current_twin_state() -> dict:
    entries = 0
    latest_mrs = 0.0
    quarantined = 0
    if os.path.exists(LEDGER_PATH):
        lines = [l.strip() for l in open(LEDGER_PATH, "r", encoding="utf-8").read().splitlines() if l.strip()]
        entries = len(lines)
        for line in lines:
            try:
                obj = json.loads(line)
                mrs = float(obj.get("mrs", 0.0))
                latest_mrs = mrs
                if "QUARANTINE" in str(obj.get("tier", "")).upper() or mrs >= 0.6:
                    quarantined += 1
            except Exception:
                pass
    return {
        "ts": datetime.now(timezone.utc).isoformat(),
        "engine": "pmsa-digital-twin",
        "ledgerEntries": entries,
        "latestMrs": latest_mrs,
        "quarantinedCount": quarantined,
        "latticeNodes": 18,
    }


class TwinHandler(BaseHTTPRequestHandler):
    def _send_json(self, code: int, data: dict):
        raw = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path == "/health":
            self._send_json(200, {"status": "ok", "service": "pmsa-digital-twin"})
        elif self.path in ("/state", "/metrics"):
            self._send_json(200, current_twin_state())
        else:
            self._send_json(404, {"error": "not found"})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8090), TwinHandler)
    server.serve_forever()
