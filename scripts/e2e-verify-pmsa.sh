#!/usr/bin/env bash
set -euo pipefail
export CARGO_HOME=/usr/local/cargo
export RUSTUP_HOME=/usr/local/rustup
mkdir -p evidence/gov
! grep -riE "(BEGIN OPENSSH PRIVATE KEY|ghp_)" . --exclude-dir=.git --exclude-dir=target --exclude="verification-report.txt"
grep -q "GW Charter" docs/research/04-methodology.md
(cd apps/digital-twin && cargo test --quiet)
echo "PASS $(date -u +%Y-%m-%dT%H:%M:%SZ) SHA=$(git rev-parse HEAD)" | tee evidence/gov/verification-report.txt
