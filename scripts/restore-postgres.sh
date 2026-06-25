#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=production-common.sh
source "${SCRIPT_DIR}/production-common.sh"

require_production_environment
require_command sha256sum

backup_file="${1:-}"
if [[ -z "${backup_file}" || ! -f "${backup_file}" ]]; then
  echo "Usage: CONFIRM_RESTORE=YES bash scripts/restore-postgres.sh <backup.dump>" >&2
  exit 1
fi

if [[ "${CONFIRM_RESTORE:-}" != "YES" ]]; then
  echo "Restore is destructive. Re-run with CONFIRM_RESTORE=YES." >&2
  exit 1
fi

if [[ -f "${backup_file}.sha256" ]]; then
  sha256sum --check "${backup_file}.sha256"
else
  echo "Warning: checksum file not found: ${backup_file}.sha256" >&2
fi

current_tag="$(current_backend_tag)"
if [[ -z "${current_tag}" && -f "${STATE_DIR}/current-tag" ]]; then
  current_tag="$(cat "${STATE_DIR}/current-tag")"
fi
if [[ -n "${current_tag}" ]]; then
  export APP_IMAGE_TAG="${current_tag}"
fi

production_compose stop frontend backend worker beat

# Preserve the database state immediately before the destructive restore.
PRODUCTION_ENV_FILE="${ENV_FILE}" bash "${SCRIPT_DIR}/backup-postgres.sh" "${ROOT_DIR}/backups/pre-restore"

cat "${backup_file}" | production_compose exec -T postgres sh -ec '
  dropdb --if-exists --force -U "$POSTGRES_USER" "$POSTGRES_DB"
  createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
  pg_restore --exit-on-error --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"
'

production_compose rm --stop --force migrate >/dev/null 2>&1 || true
production_compose up -d --no-build --remove-orphans
PRODUCTION_ENV_FILE="${ENV_FILE}" bash "${SCRIPT_DIR}/smoke-check-production.sh"

echo "Database restore completed from: ${backup_file}"
