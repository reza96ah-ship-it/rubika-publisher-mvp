#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=production-common.sh
source "${SCRIPT_DIR}/production-common.sh"

require_production_environment

release_tag="${1:-}"
if [[ -z "${release_tag}" ]]; then
  if command -v git >/dev/null 2>&1 && git -C "${ROOT_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    release_tag="$(git -C "${ROOT_DIR}" rev-parse --short=12 HEAD)"
  else
    release_tag="$(date -u +%Y%m%d%H%M%S)"
  fi
fi

if [[ ! "${release_tag}" =~ ^[A-Za-z0-9_.-]+$ ]]; then
  echo "Invalid release tag: ${release_tag}" >&2
  exit 1
fi

previous_tag="$(current_backend_tag)"
export APP_IMAGE_TAG="${release_tag}"

production_compose config --quiet
production_compose build --pull backend frontend

# Force a fresh one-shot migration container for every deployment.
production_compose rm --stop --force migrate >/dev/null 2>&1 || true
production_compose up -d --no-build --remove-orphans

PRODUCTION_ENV_FILE="${ENV_FILE}" "${SCRIPT_DIR}/smoke-check-production.sh"
record_release_state "${release_tag}" "${previous_tag}"

echo "Deployment completed with image tag: ${release_tag}"
if [[ -n "${previous_tag}" && "${previous_tag}" != "${release_tag}" ]]; then
  echo "Previous image tag recorded for rollback: ${previous_tag}"
fi
