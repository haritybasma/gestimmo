#!/usr/bin/env bash
# =============================================================================
# GestImmo — installation sur un VPS Ubuntu (24.04) avec HTTPS automatique.
#
# À exécuter EN ROOT, depuis le dossier du dépôt cloné dans /opt/gestimmo/app.
#
# Deux modes :
#   • Avec domaine (HTTPS automatique) :
#       DOMAIN=gestimmohub.com ACME_EMAIL=s.elkhiati@syn.ma bash deploy/install.sh
#   • Sans domaine (accès temporaire en HTTP par l'IP, la caméra sera désactivée) :
#       DOMAIN= bash deploy/install.sh
#
# Le script installe Node.js, PostgreSQL et Caddy, crée la base, configure
# l'application (secrets générés), la lance en service systemd et l'expose.
# Idempotent : relançable pour basculer d'un mode à l'autre.
# =============================================================================
set -euo pipefail

# DOMAIN peut être vide (mode IP/HTTP). Ne PAS mettre de valeur par défaut.
DOMAIN="${DOMAIN-gestimmohub.com}"
ACME_EMAIL="${ACME_EMAIL:-s.elkhiati@syn.ma}"
APP_DIR="/opt/gestimmo/app"
APP_USER="gestimmo"
DB_NAME="gestimmo"
DB_USER="gestimmo"

if [ "$(id -u)" -ne 0 ]; then
  echo "Ce script doit être exécuté en root." >&2
  exit 1
fi
if [ ! -f "$APP_DIR/package.json" ]; then
  echo "Dépôt introuvable dans $APP_DIR. Clonez-le d'abord à cet emplacement." >&2
  exit 1
fi

echo "==> 1/9 Paquets système"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ufw debian-keyring debian-archive-keyring apt-transport-https ca-certificates gnupg openssl

echo "==> 2/9 Node.js 22 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node --version

echo "==> 3/9 PostgreSQL"
apt-get install -y postgresql
systemctl enable --now postgresql

echo "==> 4/9 Caddy (reverse proxy HTTPS)"
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "==> 5/9 Utilisateur de service + secrets"
id "$APP_USER" >/dev/null 2>&1 || adduser --system --group --home /opt/gestimmo "$APP_USER"

# .env : généré une seule fois puis réutilisé (garde le même mot de passe DB)
if [ ! -f "$APP_DIR/.env" ]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  AUTH_SECRET="$(openssl rand -hex 48)"
  cat > "$APP_DIR/.env" <<EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@127.0.0.1:5432/$DB_NAME?schema=public
AUTH_SECRET=$AUTH_SECRET
NODE_ENV=production
EOF
  echo "   .env créé (secrets générés)."
else
  echo "   .env existant conservé."
fi
chmod 600 "$APP_DIR/.env"

# Sécurité du cookie de session : Secure (HTTPS) avec domaine, désactivé en
# mode IP/HTTP pour que la connexion fonctionne sans certificat.
sed -i '/^COOKIE_SECURE=/d' "$APP_DIR/.env"
if [ -z "$DOMAIN" ]; then
  echo "COOKIE_SECURE=false" >> "$APP_DIR/.env"
fi

# Récupère le mot de passe DB depuis le .env pour (re)configurer le rôle Postgres
DB_URL_LINE="$(grep '^DATABASE_URL=' "$APP_DIR/.env")"
DB_PASSWORD="$(printf '%s' "$DB_URL_LINE" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')"

echo "==> 6/9 Base de données"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 \
  && sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" \
  || sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "==> 7/9 Build de l'application"
cd "$APP_DIR"
# Bascule le provider Prisma vers PostgreSQL (le dépôt est en SQLite pour le dev)
sed -i 's#provider = "sqlite"#provider = "postgresql"#' prisma/schema.prisma
npm ci
npx prisma generate
npx prisma db push          # crée le schéma dans PostgreSQL
npm run build
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

echo "==> 8/9 Service systemd"
cp "$APP_DIR/deploy/gestimmo.service" /etc/systemd/system/gestimmo.service
systemctl daemon-reload
systemctl enable gestimmo
systemctl restart gestimmo

echo "==> 9/9 Reverse proxy + pare-feu"
if [ -z "$DOMAIN" ]; then
  # Mode sans domaine : HTTP simple sur toutes les adresses (accès par IP)
  cat > /etc/caddy/Caddyfile <<'EOF'
:80 {
	reverse_proxy 127.0.0.1:3000
}
EOF
  SERVER_IP="$(hostname -I | awk '{print $1}')"
  APP_URL="http://$SERVER_IP"
else
  # Mode domaine : HTTPS automatique (Let's Encrypt)
  sed "s/gestimmohub.com/$DOMAIN/g; s/s.elkhiati@syn.ma/$ACME_EMAIL/g" "$APP_DIR/deploy/Caddyfile" > /etc/caddy/Caddyfile
  APP_URL="https://$DOMAIN"
fi
systemctl reload caddy || systemctl restart caddy
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 80 >/dev/null 2>&1 || true
ufw allow 443 >/dev/null 2>&1 || true
yes | ufw enable >/dev/null 2>&1 || true

echo ""
echo "============================================================"
echo " Installation terminée."
echo " Application  : $APP_URL"
echo " Santé        : $APP_URL/api/health"
echo " Statut app   : systemctl status gestimmo"
echo " Logs app     : journalctl -u gestimmo -f"
if [ -z "$DOMAIN" ]; then
  echo ""
  echo " Mode SANS DOMAINE (HTTP) : accès par IP, le scan CAMÉRA est désactivé"
  echo " (le navigateur l'exige en HTTPS). La douchette USB fonctionne."
  echo " Pour activer le domaine + HTTPS ensuite, relancez :"
  echo "   DOMAIN=gestimmohub.com ACME_EMAIL=$ACME_EMAIL bash deploy/install.sh"
fi
echo ""
echo " Ouvrez $APP_URL et créez votre organisation (page Inscription)."
echo "============================================================"
