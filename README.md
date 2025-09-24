# EcoRide — MVP (FR)

Plateforme de **covoiturage écoresponsable**. Ce dépôt contient :

- **frontend/** (React + Vite + Tailwind)
- **backend/** (Node.js + Express)
- **docs/** (maquettes, ERD, annexes)

> Objectif : démontrer un MVP cohérent (UX, API, données) avec un positionnement **moderne, convivial et “éco”**.

---

## Liens utiles

- **Trello (Agile)** : https://trello.com/invite/b/68c2c067b25e3cf5fd59a8c1/ATTI27e2d66b9698bc865b3bfb24035f67ab5B193055/eco-ride-agile
- **Code (GitHub)** : https://github.com/Mayk-ITdS/ecoride
- **Maquettes & ERD** : `docs/` (ex. `docs/eco_ride_erd.svg`, `docs/figures/*.png`)
- **Démo** : TODO (ex. Front : Vercel, Back : Render/Fly)

---

## Comptes de test

**admin** : admin@ecoride.fr / password="studi"

**Employé** : rubio@studi.fr / password="studi" (rôle employee)

**Chauffeur** : conducteur01@demo.fr / password="studi"

**Passager** : passager01@demo.fr / password="studi"

Vous pouvez aussi créer un compte puis affecter un rôle via l’UI. En prod, changez les mots de passe.

### Sécurité & bonnes pratiques (résumé)

Ne jamais committer .env avec des secrets (utiliser .env.example).

Comptes de démo : réinitialiser les mots de passe côté PG via crypt(...).

JWT : changer JWT_SECRET en production.

CORS : restreindre CORS_ORIGIN aux domaines de démo.

DB : pour un déploiement, créer des utilisateurs dédiés avec droits limités (éviter root).

Logs : masquer les tokens et données sensibles.

## Architecture (vue d’ensemble)

Architecture & stack

Front : React + Vite + Tailwind.
Back : Express 5, Node.js 22, middlewares (CORS, JWT, validation),Prisma

### Stack technique (Back-end):

Runtime : Node.js 22.x

Framework : Express 5.x

Base relationnelle : PostgreSQL 14.x (pg, pg-promise)

Base documentaire : MongoDB Atlas (mongodb driver)

Auth : jsonwebtoken (JWT), bcrypt (hash des mots de passe)

Config/Dev : dotenv (variables d’env), cors, nodemon

(Optionnel dans le repo): prisma (outillage/migrations)

### Dépendances clés et rôle

express — serveur HTTP, routing, middlewares

pg / pg-promise — accès Postgres, requêtes paramétrées, transactions

mongodb — accès aux collections passenger_notes, preferences

jsonwebtoken — émission/validation de tokens JWT côté API

bcrypt — hachage des mots de passe (pas de stockage en clair)

cors — autoriser l’origine du front en dev

dotenv — chargement des variables d’environnement

nodemon — relance auto en développement

**Données** :

- **Relationnel** (PostgreSQL): users, user_roles, trajets, participations, voitures, status_trajet, roles.

**IInstallation des données**:

```
createdb -h localhost -p 5432 -U ecoride ecoride_db
psql -h localhost -p 5432 -U ecoride -d ecoride_db -f ecoride_schema.sql
psql -h localhost -p 5432 -U ecoride -d ecoride_db -f ecoride_seed.sql


```

- **Documentaire(NoSQL)** (MongoDB): passenger_notes (les avis), preferences (peferences des conducteurs).

- **Raison du double stockage** : les trajets, réservations et rôles exigent des - - - contraintes fortes (FK/UNIQUE/transactions) ⇒ PostgreSQL ; les avis et préférences évoluent plus librement et doivent être modérés/étendus rapidement ⇒ MongoDB.

Schéma (ERD) : voir `docs/eco_ride_erd.svg`.

---

# Postgres

DATABASE_URL="postgresql://ecoride:root@localhost:5432/ecoride_db"

# Mongo (au choix: local ou Atlas)

# --- Local ---

MONGODB_URI="mongodb://root@127.0.0.1:27017"

# --- Atlas (exemple, remplace <user>:<pass> par tes vrais) ---

MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.d6zt5ai.mongodb.net"
MONGO_DB="ecorideMongo"

# API

PORT=3000
JWT_SECRET="change-me-en-local"
CORS_ORIGIN="http://localhost:5173"

# (optionnel) Si tu gardes passenger_notes

REVIEWS_COLLECTION="passenger_notes"

## Structure du dépôt

```
ecoride/
├─ frontend/                   # React + Vite + Tailwind
│  └─ src/...
├─ backend/                    # Node + Express
│  ├─ src/
│  │  ├─ routes/              # auth, reviews, employee, trajets, ...
│  │  ├─ controllers/
│  │  ├─ services/            # logique métier
│  │  ├─ middlewares/
│  │  └─ server.js
│  ├─ db/
│  │  ├─ postgres.js
│  │  ├─ mongo.js
│  │  └─ seedMongo.js         # seed complémentaire Mongo
│  └─ deliverables/
│     └─ ecoride<schema.sql> + <seed.sql>     # schéma + données PG (dump)
└─ docs/
```

---

## Prérequis

- **Node.js** ≥ 18
- **pnpm** ou **npm** (au choix)
- **PostgreSQL** 13+ (ou instance managée)
- **MongoDB** (local ou Atlas)
- (Optionnel) **Docker** pour dev rapide

---

## Variables d’environnement

Créer les fichiers d’environnement :

## Installation rapide (local)

### 1 Cloner

```bash
git clone https://github.com/Mayk-ITdS/ecoride.git
cd ecoride
```

### Frontend

```
cd frontend
npm i           # ou pnpm i
npm run dev     # démarre sur http://localhost:5173
```

### Backend

```
cd backend
npm i
# Appliquer les migrations (Prisma — choisis l’outil et complète)
# Ex. Prisma :
# npx prisma migrate dev
npm run dev     # API sur http://localhost:3000
```

### Installation des données

## 1 PostgreSQL — schéma & données

Le dump SQL se trouve dans backend/deliverables/ecoride_schema.sql (schéma ET données : COPY ...). ou ecoride_seed.sql deja avec les donnes de test

# Créer la base

createdb -h localhost -p 5432 -U ecoride ecoride_db

# Charger schéma + données (vous pouvez être invité à saisir le mot de passe)

PGPASSWORD='root' psql -h localhost -p 5432 -U ecoride -d ecoride_db -f backend/deliverables/01_schema.sql

## 2 MongoDB — seed complémentaire

Le backend utilise deux collections : passenger_notes (avis) et preferences.

```
cd backend
npm i
node db/seedMongo.js
```

### Démarrage

## Backend

```
cd backend
npm i
npm run dev   # http://localhost:3000
```

## Frontend

```
cd frontend
npm i
npm run dev   # http://localhost:5173
```

API – endpoints essentiels

Base URL (dev)

http://localhost:3000

CORS ouvert pour : http://localhost:5173 et https://ecoride-three.vercel.app

Santé

```
GET /health → { ok: true }
```

### Avis (MongoDB – collection passenger_notes)

```
GET /reviews?limit=9&page=1 → Liste publique paginée (avis approuvés)

GET /reviews/pending (auth requise – employé/admin) → Avis en attente de modération

POST /reviews/:id/approve (auth requise – employé/admin) → Approuve un avis

POST /reviews/:id/reject (auth requise – employé/admin) → Rejette (basculé en ops_only)

```

### Utilisateurs

```
GET /users/me (JWT requis dans Authorization: Bearer <token>) → Profil courant
(Si besoin, ajoute ici POST /users/login / POST /users/register selon ce que tu exposes.)
```

### Trajets (PostgreSQL)

```
GET /trajets → Recherche (filtres: depart, arrivee, date, prixMax, isEco, …)

GET /trajets/:id → Détail trajet

POST /trajets (auth chauffeur) → Création
(Voir src/routes/trajetRoutes.js pour la liste complète.)
```

### Participations (PostgreSQL)

```
POST /participations (auth) → Réserver une place

DELETE /participations/:id (auth) → Annuler une réservation
(Voir src/routes/participationRoutes.js.)
```

### Véhicules / Rôles

```
GET /voitures/... – endpoints véhicule

GET /roles/... – endpoints rôle

```

**Voir src/routes/**
