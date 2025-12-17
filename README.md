# EcoRide

EcoRide is an eco-friendly carpooling platform MVP designed to promote sustainable transportation by connecting drivers and passengers for shared rides. This project demonstrates a modern, user-friendly application with a focus on green initiatives.

## Features

- **User Management**: Registration, login, and role-based access (Admin, Employee, Driver, Passenger)
- **Trip Management**: Create, search, and manage carpool trips (trajets)
- **Vehicle Management**: Add and manage vehicles for drivers
- **Reviews and Ratings**: Users can leave reviews for trips
- **Dashboards**: Separate dashboards for admins, employees, and users
- **Authentication**: JWT-based authentication with secure password hashing
- **Multi-Database Support**: Uses PostgreSQL for relational data and MongoDB for flexible data like reviews
- **Responsive UI**: Built with React and Tailwind CSS for a modern, mobile-friendly interface

## Tech Stack

### Backend

- **Node.js** with **Express.js** for the server
- **Prisma** as ORM for database management
- **PostgreSQL** for relational data
- **MongoDB** for NoSQL data (e.g., reviews)
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

### Frontend

- **React** with **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **Lucide React** for icons

### Development Tools

- **ESLint** and **Prettier** for code linting and formatting
- **Vitest** for testing
- **Nodemon** for backend development

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **MongoDB** database
- **Git** for version control

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Mayk-ITdS/ecoride.git
   cd ecoride
   ```

2. **Set up the backend**:

   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend**:

   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**:
   - Ensure PostgreSQL and MongoDB are running.
   - Update the `.env` file in the backend directory with your database credentials (see `.env.example`).
   - Run database migrations:
     ```bash
     cd backend
     npx prisma migrate dev
     ```
   - Seed the database if needed:
     ```bash
     node db/seedMongo.js  # For MongoDB seeding
     ```

## Running the Application

1. **Start the backend**:

   ```bash
   cd backend
   npm run dev
   ```

   The backend will run on `http://localhost:3000` (or as configured).

2. **Start the frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` (or as configured by Vite).

3. **Access the application**:
   Open your browser and navigate to the frontend URL.

## API Documentation

The backend provides RESTful APIs for various functionalities. Key endpoints include:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Users**: `/api/users`
- **Trips**: `/api/trajets`
- **Vehicles**: `/api/voitures`
- **Reviews**: `/api/reviews`

For detailed API documentation, refer to the backend routes in `src/routes/`.

## Testing

- **Backend Tests**: Run tests in the backend directory:
  ```bash
  cd backend
  npm test
  ```
- **Frontend Tests**: Run tests in the frontend directory:
  ```bash
  cd frontend
  npm run test
  ```

## Test Accounts

Use the following test accounts for demonstration:

- **Demo**: zenon@studi.fr / password: "studi"

## Security Best Practices

- Never commit `.env` files with secrets; use `.env.example` as a template.
- Change `JWT_SECRET` in production.
- Restrict CORS origins to allowed domains.
- Use dedicated database users with limited privileges.
- Mask sensitive data in logs.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

## License

This project is licensed under the ISC License.

## Links

- **Trello Board**: [EcoRide Agile](https://trello.com/invite/b/68c2c067b25e3cf5fd59a8c1/ATTI27e2d66b9698bc865b3bfb24035f67ab5B193055/eco-ride-agile)
- **GitHub Repository**: [Mayk-ITdS/ecoride](https://github.com/Mayk-ITdS/ecoride)
- **Live Demo**: [EcoRide on Vercel](https://ecoride-three.vercel.app/)
- **Designs & ERD**: Check the `docs/` folder for mockups and database diagrams.

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
