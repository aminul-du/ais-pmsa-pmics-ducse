import os
import time
import json
import math
import hashlib
import platform
from datetime import datetime, timezone

def sample_meminfo():
    data = {}
    with open("/proc/meminfo", "r", encoding="utf-8") as f:
        for line in f:
            k, v = line.split(":", 1)
            data[k.strip()] = int(v.strip().split()[0])
    total = data.get("MemTotal", 1)
    avail = data.get("MemAvailable", 0)
    used_pct = ((total - avail) / total) * 100.0
    return {"total_mb": round(total / 1024, 2), "avail_mb": round(avail / 1024, 2), "used_pct": round(used_pct, 4)}

def run_experiment(samples=20, interval=0.25):
    readings = []
    t0 = time.perf_counter()
    for _ in range(samples):
        s = sample_meminfo()
        readings.append(s["used_pct"])
        time.sleep(interval)
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

    mean = sum(readings) / len(readings)
    std_dev = math.sqrt(sum((x - mean) ** 2 for x in readings) / len(readings)) or 0.0001
    max_z = max(abs(x - mean) / std_dev for x in readings)
    risk_score = min(1.0, round(max_z / 4.0, 4))
    tier = "CRITICAL" if risk_score >= 0.75 else "HIGH" if risk_score >= 0.50 else "MEDIUM" if risk_score >= 0.25 else "LOW"

    result = {
        "experiment_id": "EXP-01-BASELINE-TELEMETRY",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "host": platform.node(),
        "kernel": platform.release(),
        "samples": samples,
        "elapsed_ms": elapsed_ms,
        "mean_mem_used_pct": round(mean, 4),
        "std_dev_pct": round(std_dev, 6),
        "max_z_score": round(max_z, 4),
        "computed_risk_score": risk_score,
        "assigned_risk_tier": tier,
        "latest_snapshot": sample_meminfo()
    }
    raw = json.dumps(result, sort_keys=True).encode("utf-8")
    result["sha256_integrity"] = hashlib.sha256(raw).hexdigest()
    return result

if __name__ == "__main__":
    res = run_experiment()
    print(json.dumps(res, indent=2))
