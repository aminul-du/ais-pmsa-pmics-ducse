#!/usr/bin/env python3
import glob, json, subprocess, time, urllib.request, datetime

srv = subprocess.Popen(["cargo", "run", "--quiet"], cwd="apps/digital-twin", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(30):
        try:
            if urllib.request.urlopen("http://127.0.0", timeout=1).status == 200:
                break
        except Exception:
            time.sleep(0.5)

    rows, passed = [], 0
    for path in sorted(glob.glob("datasets/*/*.json")):
        doc = json.load(open(path))
        for s in doc.get("samples", []):
            payload = json.dumps({
                "agent_id": s["id"], "modality": s["modality"], "language_code": s["lang"],
                "quarantined_attempts": s["q"], "total_attempts": s["tot"],
                "delta_semantic": s["ds"], "dwell_hours": s["t"], "max_horizon_hours": s["tmax"]
            }).encode()
            t0 = time.perf_counter()
            req = urllib.request.Request("http://127.0.0", data=payload, headers={"Content-Type": "application/json"})
            res = json.loads(urllib.request.urlopen(req, timeout=5).read().decode())
            ms = (time.perf_counter() - t0) * 1000.0
            ok = res["severity"] == s["expected"]
            passed += int(ok)
            rows.append({**s, "prob": round(res["breach_probability"], 4), "actual": res["severity"], "ms": round(ms, 2), "ok": ok})

    summary = {"timestamp_utc": datetime.datetime.utcnow().isoformat() + "Z", "total": len(rows), "passed": passed, "results": rows}
    open("results/benchmark_summary.json", "w").write(json.dumps(summary, indent=2))
    md = ["# PMSA Multilingual Benchmark Report\n", f"- **Executed:** {summary['timestamp_utc']}\n- **Accuracy:** {passed}/{len(rows)}\n\n",
          "| Sample ID | Lang | Modality | $P(B_t)$ | Expected | Actual | Latency (ms) |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"]
    for r in rows:
        md.append(f"| `{r['id']}` | `{r['lang']}` | `{r['modality']}` | `{r['prob']:.4f}` | **{r['expected']}** | **{r['actual']}** | `{r['ms']}` |\n")
    open("results/BENCHMARK_REPORT.md", "w").write("".join(md))
    print("".join(md))
finally:
    srv.terminate()
    srv.wait()
