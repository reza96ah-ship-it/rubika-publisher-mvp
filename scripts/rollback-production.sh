#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=production-common.sh
source "${SCRIPT_DIR}/production-common.sh"

require_production_environment

target_tag="${1:-}"
if [[ -z "${target_tag}" && -f "${STATE_DIR}/previous-tag" ]]; then
  target_tag="$(cat "${STATE_DIR}/previous-tag")"
fi

if [[ -z "${target_tag}" ]]; then
  echo "Usage: bash scripts/rollback-production.sh <existing-image-tag>" >&2
  exit 1
fi

if [[ ! "${target_tag}" =~ ^[A-Za-z0-9_.-]+$ ]]; then
  echo "Invalid release tag: ${target_tag}" >&2
  exit 1
fi

docker image inspect "nashrino-backend:${target_tag}" >/dev/null
docker image inspect "nashrino-frontend:${target_tag}" >/dev/null

current_tag="$(current_backend_tag)"
export APP_IMAGE_TAG="${target_tag}"

production_compose config --quiet
production_compose rm --stop --force migrate >/dev/null 2>&1 || true
production_compose up -d --no-build --remove-orphans

PRODUCTION_ENV_FILE="${ENV_FILE}" bash "${SCRIPT_DIR}/smoke-check-production.sh"
record_release_state "${target_tag}" "${current_tag}"

echo "Rollback completed with image tag: ${target_tag}"
