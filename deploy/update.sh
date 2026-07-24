#!/usr/bin/env bash
# =============================================================================
# GestImmo — mise à jour de l'application déployée sur le VPS.
# Récupère la dernière version, rebuild et redémarre le service.
#
#   cd /opt/gestimmo/app && bash deploy/update.sh
# =============================================================================
set -euo pipefail

APP_DIR="/opt/gestimmo/app"
APP_USER="gestimmo"
cd "$APP_DIR"

echo "==> Récupération de la dernière version"
git fetch origin
git reset --hard origin/main   # le serveur ne contient pas de modifications manuelles

echo "==> Re-bascule du provider Prisma vers PostgreSQL"
sed -i 's#provider = "sqlite"#provider = "postgresql"#' prisma/schema.prisma

echo "==> Dépendances, schéma et build"
npm ci
npx prisma generate
npx prisma db push
npm run build
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

echo "==> Redémarrage du service"
systemctl restart gestimmo
echo "Mise à jour terminée. Version en ligne : https://gestimmohub.com/api/health"
