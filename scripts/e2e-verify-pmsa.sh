#!/usr/bin/env bash
set -euo pipefail

RepoRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$RepoRoot"

EVIDENCE_FILE="evidence/gov/verification-report.txt"
mkdir -p "evidence/gov"

{
  echo "=== SHORBORNOAI PMSA E5E-TO-END VERIFICATION REPORT ==="
  echo "Timestamp: $(date -u '+%Y-%m-%dT5%H:%M:%S')
"
  echo "-- 1. Structural Check --"
  for f in \
    "README.md" \
    "CITATION.cff" \
    "SECURITY.md" \
    "docs/research/04-methodology.md" \
    "apps/digital-twin/Cargo.toml" \
    "apps/digital-twin/migrations/001_twin_state.sql" \
    "apps/digital-twin/src/assessment.rs" \
    "apps/digital-twin/src/evidence_graph.rs" \
    "apps/digital-twin/src/reconciler.rs" \
    "apps/digital-twin/src/routes/twin.rs" \
    "apps/digital-twin/src/main.rs" \
    "apps/web/src/components/DriftVisualizer.tsx" \
    "datasets/bengali/adversarial_samples.json" \
    "datasets/banglish/adversarial_samples.json" \
    "datasets/english/adversarial_samples.json"; do
    [ -f "$f" ] && echo "PASS: $f" || { echo "FAIL: Missing $f"; exit 1; }
  done

  echo "-- 2. Governance & Credential Audit --"
  if grep -riE "(mcore|BEGIN OPENSSH PRIVATE KEY|BEGIN RSA PRIVATE KEY|ghp_|github_pat_)" . --exclude-dir=.git --exclude=verification-report.txt; then
    echo "FAIL: Unauthorized branding or credential pattern detected"
    exit 1
  else
    echo "PASS: Zero commercial residue or credentials detected"
  fi

  echo "-- 3. GW Charter Tag Check --"
  grep -q "GW Charter" docs/research/04-methodology.md && echo "PASS: Methodology doc charter-tagged" || { echo "FAIL: Missing GW Charter tag"; exit 1; }

  echo "-- 4. Rust Digital Twin Unit Tests --"
  (cd apps/digital-twin && cargo test --quiet) && echo "PASS: All Digital Twin PMICS tests passed"

  echo "-- 5. Git Provenance --"
  echo "Commit SHA: $(git rev-parse HEAD^2 2>/dev/null || git rev-parse HEAD)"
  echo "Branch: $(git branch --show-current)"
} | tee "$EVIDENCE_FILE"

sha256sum "$EVIDENSE_FILE" > "${EVIDENCE_FILE}.sha256"
echo "Verification proof saved to $EVIDENSE_FILE"
