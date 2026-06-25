#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${PRODUCTION_COMPOSE_FILE:-${ROOT_DIR}/compose.production.yaml}"
ENV_FILE="${PRODUCTION_ENV_FILE:-${ROOT_DIR}/.env.production}"
STATE_DIR="${PRODUCTION_STATE_DIR:-${ROOT_DIR}/.deployments}"

if [[ "${ENV_FILE}" != /* ]]; then
  ENV_FILE="${ROOT_DIR}/${ENV_FILE}"
fi

export PRODUCTION_ENV_FILE="${ENV_FILE}"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Required command not found: $1" >&2
    exit 1
  }
}

require_production_environment() {
  require_command docker
  docker compose version >/dev/null

  if [[ ! -f "${COMPOSE_FILE}" ]]; then
    echo "Production Compose file not found: ${COMPOSE_FILE}" >&2
    exit 1
  fi

  if [[ ! -f "${ENV_FILE}" ]]; then
    echo "Production environment file not found: ${ENV_FILE}" >&2
    echo "Copy .env.production.example and replace all REQUIRED values." >&2
    exit 1
  fi

  if grep -q "REQUIRED_" "${ENV_FILE}"; then
    echo "Production environment still contains REQUIRED placeholders." >&2
    exit 1
  fi

  mkdir -p "${STATE_DIR}"
}

production_compose() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

current_backend_tag() {
  local container_id image
  container_id="$(production_compose ps -q backend 2>/dev/null || true)"
  [[ -n "${container_id}" ]] || return 0
  image="$(docker inspect --format '{{.Config.Image}}' "${container_id}" 2>/dev/null || true)"
  [[ "${image}" == *:* ]] || return 0
  printf '%s\n' "${image##*:}"
}

record_release_state() {
  local new_tag="$1" previous_tag="${2:-}"
  if [[ -n "${previous_tag}" && "${previous_tag}" != "${new_tag}" ]]; then
    printf '%s\n' "${previous_tag}" > "${STATE_DIR}/previous-tag"
  fi
  printf '%s\n' "${new_tag}" > "${STATE_DIR}/current-tag"
}
