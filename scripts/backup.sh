#!/usr/bin/env bash
# Sauvegarde de la base PostgreSQL de GestImmo.
# Usage : DATABASE_URL="postgresql://..." ./scripts/backup.sh [dossier_destination]
#
# Crée un dump SQL compressé et horodaté, puis conserve les 30 derniers.

set -euo pipefail

DEST="${1:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Erreur : la variable DATABASE_URL n'est pas définie." >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Erreur : pg_dump introuvable (installez le client PostgreSQL)." >&2
  exit 1
fi

mkdir -p "$DEST"
STAMP="$(date -u +%Y-%m-%dT%H-%M)"
FILE="$DEST/gestimmo-$STAMP.sql.gz"

echo "Sauvegarde vers $FILE ..."
pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip > "$FILE"

# Purge des sauvegardes plus anciennes que la rétention
find "$DEST" -name 'gestimmo-*.sql.gz' -type f -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true

echo "Terminé. Sauvegardes conservées $RETENTION_DAYS jours."
