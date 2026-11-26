#!/usr/bin/env bash
set -euo pipefail

CFG="/opt/workspace/ais-pmsa-pmics-ducse/.cloudflared/config.yml"
if [ ! -f "$CFG" ]; then
  echo "Missing $CFG. Copy infra/tunnel/shorbornoai-quic.yml.template -> $CFG and set <SHORBORNO_TUNNEL_UUID> first."
  exit 1
fi

curl -sf http://127.0.0.1:18411/health >/dev/null || { echo "127.0.0.1:18411 not healthy"; exit 1; }
curl -sf http://127.0.0.1:18413/health >/dev/null || { echo "127.0.0.1:18413 not healthy"; exit 1; }

exec /usr/local/bin/cloudflared tunnel --protocol quic --config "$CFG" run
