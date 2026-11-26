# Appendix A: Empirical Verification & Cryptographic Integrity Attestation
**Project:** Predictive Memory Security Assessment (PMSA) for AI Systems (ShorbornoAI)
**Researchers:** Md. Aminul Islam (Roll: 70002), Alvee Talukder (Roll: 70062)
**Supervisor:** Prof. Dr. Md. Rezaul Karim (Coordinator, PMICS, Dept. of CSE, University of Dhaka)
**Canonical Repository:** https://github.com (Branch: main | Tag: v1.0.0 | Baseline SHA: 6c93461)

## A.1 System Architecture & Boundary Isolation
- **Runtime Isolation:** Dedicated non-privileged POSIX principal ais-pmsa-pmics-ducse with strict 0700 directory permissions (isolated-shorborno).
- **Bounded Risk Digital Twin (apps/digital-twin):** Rust engine (shorborno-digital-twin, port 8090) enforcing bounded predictive risk P(B_t), BGE-M3 cosine distance thresholds (<= 2.0), WebRTC RTT budget (<= 250 ms), and tiered risk thresholds (0.25 / 0.50 / 0.75).
- **Zero-Leak & Secret Guardrails:** Automated pre-commit and E2E verification blocking private keys, tokens, and external domain identifiers.

## A.2 Automated Verification & Benchmark Summary (EXP-01)
| Verification Layer | Execution Target | Status | Evidence Artifact |
| :--- | :--- | :---: | :--- |
| Governance & Isolation | POSIX 0700 Sandbox & Zero-Leak Audit | PASS | docs/COMPLIANCE_EVIDENCE.md |
| GW Charter Alignment | Methodology & Risk Bounds Check | PASS | docs/research/04-methodology.md |
| Rust Predictive Engine | cargo test --quiet (apps/digital-twin) | PASS | evidence/gov/verification-report.txt |
| Telemetry Benchmarks | Empirical Evaluation (EXP-01) | READY | results/BENCHMARK_REPORT.md |
| Cryptographic Integrity | Full-Repository SHA-256 Attestation | VERIFIED | evidence/gov/INTEGRITY_MANIFEST.sha256 |
