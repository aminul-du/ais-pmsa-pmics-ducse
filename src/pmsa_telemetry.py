import os
import json
import time
import math
import logging
from collections import deque
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(asctime)s [PMSA-ENGINE] %(levelname)s: %(message)s")

POLICY_PATH = os.path.join(os.path.dirname(__file__), "..", "configs", "pmsa_policy.json")

def load_policy():
    with open(POLICY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def read_system_memory():
    meminfo = {}
    with open("/proc/meminfo", "r", encoding="utf-8") as f:
        for line in f:
            parts = line.split(":")
            if len(parts) == 2:
                meminfo[parts[0].strip()] = int(parts[1].strip().split()[0])
    total_kb = meminfo.get("MemTotal", 1)
    avail_kb = meminfo.get("MemAvailable", 0)
    used_pct = round(((total_kb - avail_kb) / total_kb) * 100.0, 2)
    return {"total_kb": total_kb, "available_kb": avail_kb, "used_pct": used_pct}

def scan_top_rss_processes(limit=5):
    procs = []
    for pid in os.listdir("/proc"):
        if not pid.isdigit():
            continue
        try:
            with open(f"/proc/{pid}/status", "r", encoding="utf-8") as f:
                name, rss_kb = "unknown", 0
                for line in f:
                    if line.startswith("Name:"):
                        name = line.split(":", 1)[1].strip()
                    elif line.startswith("VmRSS:"):
                        rss_kb = int(line.split(":", 1)[1].strip().split()[0])
                procs.append({"pid": int(pid), "name": name, "rss_mb": round(rss_kb / 1024.0, 2)})
        except (FileNotFoundError, PermissionError, ProcessLookupError):
            continue
    procs.sort(key=lambda x: x["rss_mb"], reverse=True)
    return procs[:limit]

def emit_alert(alert_path, severity, reason, telemetry):
    record = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "severity": severity,
        "reason": reason,
        "telemetry": telemetry
    }
    os.makedirs(os.path.dirname(alert_path), exist_ok=True)
    with open(alert_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
    logging.warning(f"ALERT [{severity}] {reason} | MemUsed={telemetry[\"used_pct\"]}%")

def run_engine():
    policy = load_policy()
    window = deque(maxlen=policy["window_size"])
    logging.info("Starting AIS-PMSA-PMICS-DUCSE Predictive Memory Security Engine...")

    while True:
        mem = read_system_memory()
        top_procs = scan_top_rss_processes(limit=3)
        current_pct = mem["used_pct"]

        if len(window) >= 10:
            mean = sum(window) / len(window)
            variance = sum((x - mean) ** 2 for x in window) / len(window)
            std_dev = math.sqrt(variance) or 0.01
            z_score = (current_pct - mean) / std_dev

            if z_score >= policy["z_score_threshold"]:
                emit_alert(
                    policy["alert_log_path"],
                    "HIGH",
                    f"Predictive memory pressure spike detected (Z-Score={z_score:.2f})",
                    {"used_pct": current_pct, "baseline_mean": round(mean, 2), "top_processes": top_procs}
                )

        if top_procs and top_procs[0]["rss_mb"] > policy["rss_spike_mb_limit"]:
            logging.info(f"Top RSS Process: {top_procs[0][\"name\"]} (PID {top_procs[0][\"pid\"]}) = {top_procs[0][\"rss_mb\"]} MB")

        window.append(current_pct)
        time.sleep(policy["sampling_interval_sec"])

if __name__ == "__main__":
    run_engine()
