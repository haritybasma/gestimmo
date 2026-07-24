# Déploiement sur VPS Ubuntu — gestimmohub.com

Guide pas-à-pas pour héberger GestImmo sur un serveur Ubuntu 24.04, en HTTPS,
sur le domaine **gestimmohub.com**. Prévoir ~15 minutes.

Serveur cible : `213.130.144.56` (accès `root` en SSH).

---

## Étape 0 — DNS (à faire en premier, la propagation prend du temps)

Chez le registrar où vous avez acheté le domaine, créez deux enregistrements **A** :

| Type | Nom   | Valeur            |
| ---- | ----- | ----------------- |
| A    | `@`   | `213.130.144.56`  |
| A    | `www` | `213.130.144.56`  |

Vérifiez la propagation : `dig +short gestimmohub.com` doit renvoyer l'IP.
Caddy ne pourra obtenir le certificat HTTPS qu'une fois le DNS propagé.

---

## Étape 1 — Autoriser le VPS à cloner le dépôt privé (clé de déploiement)

En SSH sur le serveur :

```bash
ssh-keygen -t ed25519 -C "gestimmo-vps" -f /root/.ssh/gestimmo_deploy -N ""
cat /root/.ssh/gestimmo_deploy.pub
```

Copiez la clé publique affichée, puis dans GitHub :
**Dépôt → Settings → Deploy keys → Add deploy key** (accès en lecture seule suffit).

Configurez SSH pour l'utiliser :
```bash
cat >> /root/.ssh/config <<'EOF'
Host github.com
  IdentityFile /root/.ssh/gestimmo_deploy
  IdentitiesOnly yes
EOF
```

---

## Étape 2 — Cloner le dépôt au bon endroit

```bash
mkdir -p /opt/gestimmo
git clone git@github.com:selkhiati-dotcom/gestimmo.git /opt/gestimmo/app
```

---

## Étape 3 — Installation automatique

Un script fait tout : Node.js, PostgreSQL, Caddy (HTTPS), base de données,
secrets, build, service systemd, pare-feu.

```bash
cd /opt/gestimmo/app
DOMAIN=gestimmohub.com ACME_EMAIL=s.elkhiati@syn.ma bash deploy/install.sh
```

À la fin, l'application est en ligne sur **https://gestimmohub.com**.
Ouvrez le site et créez votre organisation via la page **Inscription**
(le premier compte devient administrateur).

### Accès immédiat sans domaine (temporaire)

Si le DNS n'est pas encore propagé, vous pouvez déployer tout de suite en accès
par **IP en HTTP** :

```bash
cd /opt/gestimmo/app
DOMAIN= bash deploy/install.sh
```

L'application est alors accessible sur **http://VOTRE_IP** (ex. `http://213.130.144.56`).
⚠️ En HTTP, le **scan caméra est désactivé** par le navigateur (la douchette USB
fonctionne). Une fois le DNS prêt, activez le domaine + HTTPS en relançant :

```bash
DOMAIN=gestimmohub.com ACME_EMAIL=s.elkhiati@syn.ma bash deploy/install.sh
```

> Le script génère automatiquement un mot de passe PostgreSQL et un `AUTH_SECRET`
> forts, stockés dans `/opt/gestimmo/app/.env` (permissions 600).

---

## Vérifications

```bash
systemctl status gestimmo        # service applicatif actif ?
journalctl -u gestimmo -f        # logs en direct
curl -s https://gestimmohub.com/api/health   # {"status":"ok",...}
systemctl status caddy           # reverse proxy / HTTPS
```

---

## Sauvegardes automatiques (recommandé)

Planifiez un dump quotidien chiffré via cron (le script est fourni) :

```bash
mkdir -p /var/backups/gestimmo
crontab -e
```
Ajoutez :
```cron
0 2 * * *  cd /opt/gestimmo/app && set -a && . ./.env && set +a && ./scripts/backup.sh /var/backups/gestimmo
```
Sauvegardes horodatées, conservées 30 jours. Pensez à copier régulièrement le
dossier `/var/backups/gestimmo` vers un stockage externe (règle 3-2-1).

Restauration :
```bash
gunzip -c /var/backups/gestimmo/gestimmo-XXXX.sql.gz | psql "$DATABASE_URL"
```

---

## Mettre à jour l'application

À chaque nouvelle version poussée sur GitHub :

```bash
cd /opt/gestimmo/app && bash deploy/update.sh
```

---

## Dépannage

| Symptôme | Piste |
| --- | --- |
| HTTPS ne s'active pas | DNS pas encore propagé, ou ports 80/443 fermés. `journalctl -u caddy -f`. |
| 502 Bad Gateway | L'app n'est pas démarrée : `systemctl status gestimmo`, `journalctl -u gestimmo`. |
| L'app refuse de démarrer | `AUTH_SECRET` absent/faible dans `.env`, ou `DATABASE_URL` incorrect. |
| La caméra ne s'ouvre pas | Doit être en HTTPS (ok via Caddy) et autoriser l'accès caméra dans le navigateur. |

---

## Rappels sécurité

- L'application n'écoute que sur `127.0.0.1:3000` ; seul Caddy l'expose (HTTPS).
- PostgreSQL n'écoute qu'en local. Secrets uniquement dans `.env` (hors Git).
- Voir [`HEBERGEMENT.md`](HEBERGEMENT.md) pour le détail protection & sauvegarde.
- Pensez à désactiver la connexion SSH par mot de passe au profit des clés.
