import os
from urllib import request as urlreq
from urllib.error import URLError
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

LOCAL_TRUST_URL = os.getenv("PMSA_LOCAL_TRUST_URL", "http://127.0.0.1:18411").rstrip("/")
GCP_SPOKE_URL = os.getenv(
    "PMSA_CLOUD_SPOKE_URL",
    "https://shorbornoai-launch-469173990872.us-central1.run.app/",
)

app = FastAPI(title="ShorbornoAI Cloud-Spoke & QUIC Bridge (:18413)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class SpokeEvalPayload(BaseModel):
    identity: str = "pmics-researcher"
    capability: str = "memory:write"
    modality: str = "text"
    language: str = "bn-EN"
    source_trust: float = 0.90
    payload: str


def _http_get(url: str, timeout: float = 4.0) -> dict:
    req = urlreq.Request(url, headers={"User-Agent": "ShorbornoAI-SpokeBridge/1.0"})
    with urlreq.urlopen(req, timeout=timeout) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
        ctype = resp.headers.get("Content-Type", "")
        if "application/json" in ctype:
            return {"http_status": resp.status, "json": json.loads(raw)}
        return {"http_status": resp.status, "title_or_bytes": len(raw.encode("utf-8")), "is_html": "<html" in raw.lower()}


def _http_post_json(url: str, body: dict, timeout: float = 5.0) -> dict:
    data = json.dumps(body).encode("utf-8")
    req = urlreq.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "ShorbornoAI-SpokeBridge/1.0"},
        method="POST",
    )
    with urlreq.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


@app.get("/health")
def bridge_health():
    local_ok = False
    local_info = {}
    try:
        local_info = _http_get(f"{LOCAL_TRUST_URL}/health", timeout=2.0)
        local_ok = local_info.get("http_status") == 200
    except URLError as exc:
        local_info = {"error": str(exc)}

    gcp_reachable = False
    gcp_info = {}
    try:
        gcp_info = _http_get(GCP_SPOKE_URL, timeout=4.0)
        gcp_reachable = gcp_info.get("http_status") == 200
    except URLError as exc:
        gcp_info = {"error": str(exc)}

    return {
        "status": "healthy" if local_ok else "degraded",
        "bind": "127.0.0.1:18413",
        "transport_mode": "cloudflare-quic-ready",
        "local_trust_api": {"url": LOCAL_TRUST_URL, "reachable": local_ok, "detail": local_info},
        "gcp_cloud_spoke": {"url": GCP_SPOKE_URL, "reachable": gcp_reachable, "detail": gcp_info},
    }


@app.get("/api/spoke/status")
def spoke_status():
    try:
        state = _http_get(f"{LOCAL_TRUST_URL}/api/state", timeout=3.0)
    except URLError as exc:
        raise HTTPException(status_code=503, detail=f"Local trust API unreachable: {exc}")
    return {
        "bridge": "127.0.0.1:18413",
        "cloud_spoke_url": GCP_SPOKE_URL,
        "local_state": state.get("json", state),
    }


@app.post("/api/spoke/evaluate")
def spoke_evaluate(item: SpokeEvalPayload):
    try:
        result = _http_post_json(f"{LOCAL_TRUST_URL}/api/memory", item.model_dump())
    except URLError as exc:
        raise HTTPException(status_code=503, detail=f"Local trust API unreachable: {exc}")
    return {
        "cloud_spoke_url": GCP_SPOKE_URL,
        "bridge_bind": "127.0.0.1:18413",
        "evaluation": result,
    }
