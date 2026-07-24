# GestImmo — Gestion des immobilisations

Application web simple pour **gérer les immobilisations** : génération d'étiquettes
code-barres, inventaires périodiques par scan, et états valorisés (amortissement
**linéaire** et **dégressif**).

Responsive : utilisable depuis un PC, un PDA/terminal, une tablette ou un
smartphone (scan à la caméra ou à la douchette USB).

## Fonctionnalités

- **Multi-sociétés** — une organisation regroupe plusieurs sociétés, chacune
  avec son **pays** et sa **devise**. Sélecteur de société active en haut ;
  tous les écrans (immos, étiquettes, inventaires, états) et la devise
  d'affichage suivent la société courante. Un même **lieu physique** peut
  contenir les biens de plusieurs sociétés : chaque immobilisation reste
  rattachée à sa société. Inscription en libre-service qui crée
  l'organisation, le compte administrateur et les sociétés.
- **Immobilisations** — fiche complète (code, désignation, catégorie,
  localisation, valeur & date d'acquisition, durée, méthode d'amortissement,
  n° de série, fournisseur…), code séquentiel généré automatiquement,
  rattachée à une société.
- **Étiquettes code-barres** — planche imprimable Code128, colonnes réglables,
  désignation/localisation optionnelles.
- **Inventaires** — campagnes de pointage (périmètre : une société ou tout le
  groupe), scan **caméra** ou **douchette USB**, réconciliation en temps réel :
  présents / manquants / non répertoriés / **biens d'une autre société** /
  écarts de localisation, avancement.
- **États valorisés** — valeur nette comptable à une date donnée, en linéaire
  **et** dégressif côte à côte, totaux, **export CSV** (Excel).
- **Sociétés** — gestion des entités du groupe (pays, devise, identifiant légal,
  société par défaut / active).
- **Référentiels** — catégories et localisations (partagées dans l'organisation).
- **Multi-utilisateurs** — inscription et connexion par email / mot de passe.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite (dev) /
PostgreSQL (prod) · JsBarcode · @zxing/browser.

## Démarrage rapide (développement)

```bash
npm install
cp .env.example .env          # (ou copier manuellement sous Windows)
npx prisma migrate dev        # crée la base SQLite
npm run db:seed               # données de démonstration + compte admin
npm run dev                   # http://localhost:3000
```

Connexion de démonstration : **admin@gestimmo.local** / **admin123**
(à changer en production).

## Scripts utiles

| Commande             | Rôle                                      |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Serveur de développement                  |
| `npm run build`      | Build de production                       |
| `npm start`          | Démarre le build de production            |
| `npm run db:seed`    | (Ré)injecte les données de démonstration  |
| `npm run db:studio`  | Explorateur de base de données Prisma     |
| `npm run db:migrate` | Crée/applique une migration               |

## Passage en production (cloud, multi-utilisateurs)

L'app est prévue pour être **hébergée** et accédée depuis n'importe quel poste.

1. **Base PostgreSQL** (Neon, Supabase, RDS, VPS…) :
   - dans `prisma/schema.prisma`, mettre `provider = "postgresql"` ;
   - renseigner `DATABASE_URL` (URL Postgres) dans l'environnement ;
   - `npx prisma migrate deploy`.
2. **Secret de session** : définir `AUTH_SECRET` avec une valeur aléatoire
   (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. **Déploiement** : Vercel (le plus simple), ou tout hébergeur Node
   (`npm run build` puis `npm start`), Docker, etc.

> ⚠️ Le scan à la **caméra** nécessite HTTPS (contrainte des navigateurs).
> En local, `localhost` est considéré comme sécurisé ; en production, servez
> l'app en HTTPS. La **douchette USB** fonctionne partout (saisie clavier).

📘 Guides détaillés :
- Déploiement clé-en-main sur un **VPS Ubuntu + HTTPS** : [`DEPLOIEMENT-VPS.md`](DEPLOIEMENT-VPS.md)
- Hébergement, **protection & isolation des données**, **sauvegardes/restauration**,
  supervision : [`HEBERGEMENT.md`](HEBERGEMENT.md)

## Versions

Le numéro de version est affiché en bas de la barre latérale et exposé par
`GET /api/health`. L'historique des évolutions est dans
[`CHANGELOG.md`](CHANGELOG.md) (versionnage [SemVer](https://semver.org/lang/fr/)).

## Modèle d'amortissement

Les annuités sont calculées par année à partir de la date d'acquisition
(prorata temporis « à l'anniversaire ») ; la VNC à une date quelconque est
obtenue par interpolation. Le dégressif applique `taux = (1/durée) × coefficient`
sur la VNC, avec bascule automatique vers le linéaire quand c'est plus favorable.
Voir `src/lib/amortissement.ts`. Ce modèle convient à un outil de gestion ; pour
une clôture fiscale au jour près, adaptez les règles de prorata à votre pays.
