# Experimental Lab Report — EXP-01: Live Host Memory Risk Baseline

- **Institution:** University of Dhaka | Dept. of CSE | PMICS
- **Host Environment:** `MCORE-FDR-AIS-001` (`/home/ais-pmsa-pmics-ducse/NativeSbox/ais-pmsa-pmics-ducse`)
- **Execution Status:** `EXECUTED_VERIFIED`
- **Computed Risk Score:** `0.6916` (Tier: `HIGH`)
- **Telemetry SHA-256 Digest:** `50d7a31ef51e7cc4226344379061bcc1a3f014f1bf3788777d9cf93aa859e455`

## Empirical Telemetry Payload
```json
{
  "experiment_id": "EXP-01-BASELINE-TELEMETRY",
  "timestamp_utc": "2026-11-25T11:41:31.949019+00:00",
  "host": "MCORE-FDR-AIS-001",
  "kernel": "6.18.58.1-microsoft-standard-WSL2",
  "samples": 20,
  "elapsed_ms": 5009.2,
  "mean_mem_used_pct": 35.3175,
  "std_dev_pct": 0.050319,
  "max_z_score": 2.7662,
  "computed_risk_score": 0.6916,
  "assigned_risk_tier": "HIGH",
  "latest_snapshot": {
    "total_mb": 7790.76,
    "avail_mb": 5038.14,
    "used_pct": 35.3318
  },
  "sha256_integrity": "50d7a31ef51e7cc4226344379061bcc1a3f014f1bf3788777d9cf93aa859e455"
}
```
