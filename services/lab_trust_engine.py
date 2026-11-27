#!/usr/bin/env python3
import hashlib
import json
import os
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

LEDGER_PATH = os.environ.get("PMSA_LEDGER_PATH", "/opt/workspace/ais-pmsa-pmics-ducse/telemetry_ledger.jsonl")
LOCK = threading.Lock()
QUARANTINE_COUNT = 0
LAST_RECOVERY = None


def ensure_ledger():
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    if not os.path.exists(LEDGER_PATH) or os.path.getsize(LEDGER_PATH) == 0:
        genesis = {
            "seq": 0,
            "ts": datetime.now(timezone.utc).isoformat(),
            "event": "GENESIS_BLOCK",
            "mrs": 0.0,
            "tier": "ACTIVE_STORE",
            "prev_hash": "0" * 64,
        }
        canonical = json.dumps(genesis, sort_keys=True, separators=(",", ":")).encode("utf-8")
        genesis["curr_hash"] = hashlib.sha256(canonical).hexdigest()
        with open(LEDGER_PATH, "w", encoding="utf-8") as f:
            f.write(json.dumps(genesis) + "\n")


def append_ledger(event: str, mrs: float, tier: str, detail: dict) -> dict:
    with LOCK:
        ensure_ledger()
        lines = [l.strip() for l in open(LEDGER_PATH, "r", encoding="utf-8").read().splitlines() if l.strip()]
        prev_hash = "0" * 64
        seq = len(lines)
        if lines:
            try:
                last = json.loads(lines[-1])
                prev_hash = last.get("curr_hash") or hashlib.sha256(lines[-1].encode("utf-8")).hexdigest()
            except Exception:
                prev_hash = hashlib.sha256(lines[-1].encode("utf-8")).hexdigest()

        entry = {
            "seq": seq,
            "ts": datetime.now(timezone.utc).isoformat(),
            "event": event,
            "mrs": round(float(mrs), 4),
            "tier": tier,
            "detail": detail,
            "prev_hash": prev_hash,
        }
        canonical = json.dumps(entry, sort_keys=True, separators=(",", ":")).encode("utf-8")
        entry["curr_hash"] = hashlib.sha256(canonical).hexdigest()
        with open(LEDGER_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
        return entry


def verify_ledger() -> dict:
    ensure_ledger()
    lines = [l.strip() for l in open(LEDGER_PATH, "r", encoding="utf-8").read().splitlines() if l.strip()]
    chain_valid = True
    expected_prev = None
    q_count = 0
    for idx, line in enumerate(lines):
        try:
            obj = json.loads(line)
        except Exception:
            chain_valid = False
            continue
        tier = str(obj.get("tier", "")).upper()
        if "QUARANTINE" in tier or float(obj.get("mrs", 0.0)) >= 0.6:
            q_count += 1
        if idx > 0 and expected_prev is not None and obj.get("prev_hash") != expected_prev:
            chain_valid = False
        expected_prev = obj.get("curr_hash")
    return {"entries": len(lines), "chainValid": chain_valid, "quarantined": q_count}


def score_payload(content: str, modality: str, persistence: float, mode: str) -> dict:
    lower = content.lower()
    cues = ["ignore previous", "system override", "exfiltrate", "backdoor", "sleeper", "poison", "bypass"]
    hits = sum(1 for c in cues if c in lower)
    P = 0.85 if modality == "unverified_external" else 0.18
    S = min(1.0, max(0.1, float(persistence)))
    I = min(1.0, 0.45 + hits * 0.25) if hits > 0 else 0.12
    B = 0.72 if hits > 0 else 0.14
    L = 0.16 if (any(ord(ch) > 127 for ch in content) or any(w in lower for w in ["amar", "aamar", "amr"])) else 0.10
    mrs = round(0.25 * P + 0.15 * S + 0.30 * I + 0.20 * B + 0.10 * L, 4)
    if mode == "unprotected":
        tier = "UNPROTECTED_COMMIT"
    elif mrs >= 0.60:
        tier = "QUARANTINE (1440m)"
    elif mrs >= 0.30:
        tier = "STAGING (60m)"
    else:
        tier = "ACTIVE_STORE"
    return {
        "mrs": mrs,
        "tier": tier,
        "mode": mode,
        "factors": {"P": round(P, 4), "S": round(S, 4), "I": round(I, 4), "B": round(B, 4), "L": round(L, 4)},
        "weights": {"P": 0.25, "S": 0.15, "I": 0.30, "B": 0.20, "L": 0.10},
    }


class TrustHandler(BaseHTTPRequestHandler):
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
            self._send_json(200, {"status": "ok", "service": "pmsa-trust-engine", "ledger": verify_ledger()})
        elif self.path == "/openapi.json":
            self._send_json(200, {
                "openapi": "3.0.0",
                "info": {"title": "AIS-PMSA Trust Engine", "version": "1.0.0"},
                "paths": {
                    "/health": {"get": {"summary": "Health"}},
                    "/analyze": {"post": {"summary": "Evaluate memory write"}},
                    "/recover": {"post": {"summary": "Recover and append ledger event"}},
                },
            })
        else:
            self._send_json(404, {"error": "not found"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = json.loads(self.rfile.read(length).decode("utf-8") or "{}") if length > 0 else {}
        if self.path in ("/analyze", "/score", "/evaluate"):
            res = score_payload(
                str(body.get("content", "")),
                str(body.get("modality", "bn-EN")),
                float(body.get("persistence", 0.2)),
                str(body.get("mode", "protected")),
            )
            entry = append_ledger("MEMORY_EVALUATION", res["mrs"], res["tier"], {"mode": res["mode"], "modality": body.get("modality", "bn-EN")})
            self._send_json(200, {"ok": True, "evaluation": res, "ledgerEntry": entry})
        elif self.path in ("/recover", "/api/recover"):
            global LAST_RECOVERY
            LAST_RECOVERY = datetime.now(timezone.utc).isoformat()
            entry = append_ledger("RECOVERY_EVENT", 0.0, "ACTIVE_STORE", {"recoveredAt": LAST_RECOVERY})
            self._send_json(200, {"ok": True, "recoveredAt": LAST_RECOVERY, "ledgerEntry": entry})
        else:
            self._send_json(404, {"error": "not found"})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    ensure_ledger()
    server = ThreadingHTTPServer(("127.0.0.1", 18411), TrustHandler)
    server.serve_forever()
