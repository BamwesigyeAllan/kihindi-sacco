# KIHINDI SACCO Management System

A single-service Express application with a static browser interface, Sequelize data models, and a local SQLite or managed PostgreSQL/MySQL database.

## Requirements

- Node.js 20 or later (Node.js 22 LTS recommended)
- npm

## Run locally (SQLite)

1. Install dependencies: `npm ci`
2. Copy `.env.example` to `.env` and keep `NODE_ENV=development` and `DB_DIALECT=sqlite`.
3. Start the app with `npm run dev` (or `npm start`).
4. Open <http://localhost:5000>. The API health check is <http://localhost:5000/health>.

The SQLite database is created automatically at `data/kihindi.sqlite`; the directory is created if needed. In development, the app creates the default staff accounts and sample loan products on first startup. The local admin login is `admin` / `admin123`; change its password before using real member data. Do not use development credentials or the example JWT secret in a deployed environment.

To use a local PostgreSQL or MySQL database instead, set `DB_DIALECT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env`. Alternatively, set `DATABASE_URL`; `DB_SSL=true` enables TLS for providers that require it.

## Deploy to Render

1. Push this repository to GitHub and create a Render Blueprint using `render.yaml`.
2. When prompted, set `INITIAL_ADMIN_PASSWORD` to a unique password. Render generates `JWT_SECRET` and connects the web service to PostgreSQL.
3. Wait for the service to become live, then open the Render service URL. Render checks `/health` after deploy.
4. Sign in using username `admin` and the initial admin password you configured. Once an admin already exists in the database, the bootstrap variables can be removed; the app never inserts the development accounts in production.

The Blueprint uses free Render plans for evaluation. Free web instances can sleep, and free PostgreSQL databases are temporary and have limited storage/retention; upgrade both plans before storing real financial or member data. The Render filesystem is ephemeral on the free web plan, so member photos and the SACCO logo can be lost after a restart/redeploy. For persistent uploads, attach a persistent disk on a paid web plan and set `UPLOAD_DIR` to its mount path (for example, `/var/data/uploads`). Keep the PostgreSQL database separate from the web filesystem.

### Production environment variables

- `NODE_ENV=production`
- `DB_DIALECT=postgres` and `DATABASE_URL` (Render supplies the linked database URL)
- `JWT_SECRET` (at least 32 characters; Render generates one in the Blueprint)
- `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` only to create the first admin on an empty database
- `UPLOAD_DIR` optionally points to persistent storage for photos and branding
- `PORT` is assigned by Render; the app binds to `0.0.0.0`
- `DB_SSL=true` only if the database provider requires TLS

Production startup fails early if the JWT secret, database, or database dialect is unsafe/misconfigured. SQLite remains intended for local development only.

## Useful commands

- `npm run dev` — start with nodemon
- `npm start` — start the server (Render uses this command)
- `npm run start:prod` — production start alias
- `npm run seed` / `npm run seed:dev` — add default development staff accounts and products to the configured database; disabled in production
- `npm run seed:reset` — **destructively drop and recreate all tables**, then add development seed data; disabled in production and never run against a database containing wanted data
- `npm run users` — list staff accounts in the configured database

The server synchronizes Sequelize models at startup. Back up production data before deploying schema changes; for larger production changes, introduce explicit migrations rather than relying on automatic synchronization.
