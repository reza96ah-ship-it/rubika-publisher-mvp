#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=production-common.sh
source "${SCRIPT_DIR}/production-common.sh"

require_production_environment
require_command sha256sum

backup_dir="${1:-${ROOT_DIR}/backups}"
mkdir -p "${backup_dir}"
backup_dir="$(cd "${backup_dir}" && pwd)"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir}/nashrino-postgres-${stamp}.dump"
temporary_file="${backup_file}.partial"

cleanup() {
  rm -f "${temporary_file}"
}
trap cleanup EXIT

production_compose exec -T postgres sh -ec \
  'pg_dump --format=custom --compress=9 --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  > "${temporary_file}"

test -s "${temporary_file}"
mv "${temporary_file}" "${backup_file}"
sha256sum "${backup_file}" > "${backup_file}.sha256"
trap - EXIT

echo "Backup created: ${backup_file}"
echo "Checksum created: ${backup_file}.sha256"
