#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=production-common.sh
source "${SCRIPT_DIR}/production-common.sh"

require_production_environment
require_command curl

backend_address="$(production_compose port backend 8000)"
frontend_address="$(production_compose port frontend 3000)"

if [[ -z "${backend_address}" || -z "${frontend_address}" ]]; then
  echo "Backend or frontend port mapping is unavailable." >&2
  production_compose ps
  exit 1
fi

check_url() {
  local name="$1" url="$2" attempts="${3:-30}"
  local attempt

  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if curl --fail --silent --show-error --max-time 8 "${url}" >/dev/null; then
      echo "OK: ${name} (${url})"
      return 0
    fi
    sleep 2
  done

  echo "FAILED: ${name} (${url})" >&2
  return 1
}

check_url "backend health" "http://${backend_address}/health"
check_url "database health" "http://${backend_address}/health/db"
check_url "frontend" "http://${frontend_address}/login"

production_compose ps

echo "Production smoke checks passed."
