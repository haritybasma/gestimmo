# Journal des versions — GestImmo

Toutes les évolutions notables de l'application sont consignées ici.
Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le
versionnage respecte [SemVer](https://semver.org/lang/fr/) : `MAJEUR.MINEUR.CORRECTIF`.

- **MAJEUR** : changement incompatible (ex. refonte du modèle de données).
- **MINEUR** : nouvelle fonctionnalité rétro-compatible.
- **CORRECTIF** : correction de bug rétro-compatible.

La version courante est affichée en bas de la barre latérale et exposée par
l'endpoint `GET /api/health`.

## [Non publié]

### Ajouté

- Outils de déploiement VPS : service systemd, configuration Caddy (HTTPS
  automatique), scripts `deploy/install.sh` et `deploy/update.sh`, guide
  [`DEPLOIEMENT-VPS.md`](DEPLOIEMENT-VPS.md).

## [0.3.0] — 2026-07-07

### Ajouté

- **Multi-sociétés** : une organisation regroupe plusieurs sociétés, chacune
  avec son pays et sa devise. Chaque immobilisation est rattachée à une société.
- **Inscription en libre-service** (`/inscription`) : création de
  l'organisation, du compte administrateur et des sociétés (devise auto-remplie
  selon le pays).
- **Sélecteur de société active** : filtre l'ensemble des écrans et adapte la
  devise d'affichage.
- **Gestion des sociétés** (`/societes`) : ajout, modification, société par
  défaut / active, suppression.
- **Inventaire multi-société** : périmètre par société ou pour tout le groupe ;
  détection des biens appartenant à une autre société scannés dans un même lieu.
- **Versionnage** : numéro de version affiché dans l'interface, commit et date
  de build, endpoint de supervision `/api/health`.
- **Sécurité** : en-têtes HTTP de sécurité (HSTS, X-Frame-Options, nosniff,
  Permissions-Policy…), contrôle de `AUTH_SECRET` en production.

### Modifié

- Cloisonnement de toutes les données par organisation (isolation multi-tenant).

## [0.2.0] — 2026-07-06

### Ajouté

- **Immobilisations** : gestion complète (CRUD), code séquentiel, catégories,
  localisations, statut.
- **Étiquettes code-barres** Code128 imprimables (mise en page réglable).
- **Inventaires** : campagnes, scan caméra et douchette USB, réconciliation
  (présents / manquants / non répertoriés / écarts de localisation).
- **États valorisés** : valeur nette comptable en amortissement **linéaire** et
  **dégressif** à une date donnée, export CSV.
- **Authentification** par email / mot de passe (sessions JWT, mots de passe
  bcrypt).

## [0.1.0] — 2026-07-06

### Ajouté

- Initialisation du projet (Next.js, TypeScript, Tailwind, Prisma).
