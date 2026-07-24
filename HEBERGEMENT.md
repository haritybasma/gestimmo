# Hébergement cloud, protection & sauvegarde des données

Ce guide décrit comment héberger GestImmo en production, comment les données des
entreprises sont **protégées**, **isolées** et **sauvegardées**, et comment
suivre les versions déployées.

---

## 1. Architecture d'hébergement recommandée

```
   Utilisateurs (PC / PDA / mobile)
              │  HTTPS (TLS)
              ▼
   ┌─────────────────────┐        ┌──────────────────────────┐
   │  App GestImmo        │  TLS   │  Base PostgreSQL gérée   │
   │  (Next.js, Node)     │───────▶│  (chiffrée, sauvegardée) │
   │  Vercel / VPS / Docker        │  Neon · Supabase · RDS   │
   └─────────────────────┘        └──────────────────────────┘
```

Deux options éprouvées :

| Option | Pour qui | Points forts |
| --- | --- | --- |
| **Vercel + Postgres géré** (Neon, Supabase) | Le plus simple, rapide à lancer | Déploiement Git, HTTPS auto, mises à l'échelle, sauvegardes gérées |
| **VPS / serveur interne** (Docker ou Node + Nginx) | Contrôle total, données on-premise | Souveraineté des données, coût maîtrisé |

---

## 2. Passer de SQLite (dev) à PostgreSQL (prod)

En développement, l'app utilise SQLite (fichier local). En production, on utilise
**PostgreSQL** (multi-utilisateurs, sauvegardes, haute disponibilité).

1. **Provisionner** une base PostgreSQL gérée (Neon / Supabase / AWS RDS / Azure).
2. Dans `prisma/schema.prisma`, changer le provider :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Définir les variables d'environnement (secrets de l'hébergeur, **jamais** dans le code) :
   ```bash
   DATABASE_URL="postgresql://user:motdepasse@host:5432/gestimmo?sslmode=require"
   AUTH_SECRET="<64 caractères aléatoires>"   # obligatoire en prod
   NODE_ENV="production"
   ```
   Générer un secret :
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   > ⚠️ L'application **refuse de démarrer** en production si `AUTH_SECRET` est
   > absent, trop court (< 32 caractères) ou laissé à sa valeur par défaut.
4. **Appliquer le schéma** à la base de production :
   ```bash
   npx prisma migrate deploy
   ```
5. **Déployer** :
   - Vercel : connecter le dépôt Git, renseigner les variables, `git push`.
   - VPS : `npm ci && npm run build && npm start` (derrière Nginx en HTTPS), ou Docker.

> 🔒 Le scan **caméra** exige HTTPS (contrainte des navigateurs). Vercel fournit
> HTTPS automatiquement ; sur VPS, utiliser Let's Encrypt (Nginx/Caddy).

---

## 3. Comment les données des entreprises sont protégées

### 3.1 Isolation multi-entreprises (multi-tenant)
- Chaque donnée (immobilisations, inventaires, catégories, localisations,
  sociétés) porte un `organizationId`. **Toutes** les requêtes filtrent par
  l'organisation de l'utilisateur connecté : une organisation ne peut jamais
  voir ou modifier les données d'une autre.
- Les actions serveur re-vérifient systématiquement l'appartenance à
  l'organisation avant toute lecture, écriture ou suppression (défense côté
  serveur, pas seulement dans l'interface).

### 3.2 Authentification & sessions
- Mots de passe **hachés avec bcrypt** (jamais stockés en clair).
- Sessions signées **JWT** stockées dans un cookie **httpOnly** (inaccessible au
  JavaScript, donc protégé contre le vol par XSS), `SameSite=Lax` (anti-CSRF),
  `Secure` en production (transmis uniquement en HTTPS), expiration 7 jours.
- `AUTH_SECRET` fort obligatoire en production (contrôle au démarrage).

### 3.3 Chiffrement
- **En transit** : HTTPS/TLS entre le navigateur et l'app, et `sslmode=require`
  entre l'app et la base.
- **Au repos** : les bases PostgreSQL gérées (Neon, Supabase, RDS) chiffrent les
  données sur disque (AES-256) et les sauvegardes.

### 3.4 Durcissement applicatif
- En-têtes de sécurité HTTP (`next.config.ts`) : HSTS (force HTTPS),
  `X-Frame-Options` (anti-clickjacking), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy` (seule la caméra est autorisée).
- Secrets uniquement via variables d'environnement, jamais dans le dépôt Git
  (`.env` est ignoré par Git).

---

## 4. Sauvegarde et restauration

### 4.1 Sauvegardes automatiques (recommandé)
Les bases PostgreSQL gérées offrent des sauvegardes automatiques :
- **Neon / Supabase / RDS** : sauvegardes quotidiennes + **PITR**
  (Point-In-Time Recovery) permettant de restaurer à une seconde près sur les
  derniers jours. Activez une **rétention** adaptée (ex. 7 à 30 jours).
- Vérifiez périodiquement que la restauration fonctionne (test de restauration).

### 4.2 Sauvegarde manuelle / externe (défense supplémentaire)
En complément, exportez régulièrement un dump chiffré vers un stockage tiers
(autre fournisseur / autre région) pour la règle **3-2-1** (3 copies, 2 supports,
1 hors site).

Un script est fourni : [`scripts/backup.sh`](scripts/backup.sh)
```bash
# nécessite pg_dump (client PostgreSQL) et la variable DATABASE_URL
DATABASE_URL="postgresql://..." ./scripts/backup.sh /chemin/vers/sauvegardes
```
Il crée un fichier compressé horodaté, ex. `gestimmo-2026-07-07T02-00.sql.gz`.

Automatisez-le (ex. tâche cron quotidienne) :
```cron
0 2 * * *  DATABASE_URL="postgresql://..." /opt/gestimmo/scripts/backup.sh /var/backups/gestimmo
```

### 4.3 Restauration
```bash
# base vide cible
gunzip -c gestimmo-2026-07-07T02-00.sql.gz | psql "$DATABASE_URL"
```
Pour un incident majeur : restaurer via le PITR du fournisseur, ou recréer une
base et importer le dernier dump, puis relancer l'app.

---

## 5. Suivi des versions et supervision

- La **version** est visible en bas de la barre latérale (ex. `v0.3.0`) et
  détaillée au survol (commit + date de build).
- Historique complet des évolutions : [`CHANGELOG.md`](CHANGELOG.md).
- **Endpoint de supervision** : `GET /api/health` renvoie
  ```json
  { "status": "ok", "version": "0.3.0", "commit": "abc1234",
    "database": "up", "time": "..." }
  ```
  À brancher sur la surveillance de l'hébergeur (uptime, alertes) et le
  healthcheck du load balancer.

---

## 6. Bonnes pratiques d'exploitation

- **Comptes** : changez le mot de passe du compte de démonstration ; imposez des
  mots de passe forts.
- **Moindre privilège** : l'utilisateur PostgreSQL de l'app ne doit avoir accès
  qu'à sa base.
- **Mises à jour** : appliquez les mises à jour de sécurité des dépendances
  (`npm audit`), déployez via `migrate deploy` (jamais `migrate dev` en prod).
- **Journalisation** : conservez les logs applicatifs et base pour audit.
