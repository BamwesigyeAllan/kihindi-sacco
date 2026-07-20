# KIHINDI SACCO Backend

Backend API for the KIHINDI SACCO management system.

Built with Express.js, Sequelize, and MySQL.

## Requirements

- Node.js 18+ / 20+
- npm
- MySQL (or compatible MariaDB)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment configuration

```bash
copy .env.example .env
```

### 3. Edit `.env`

Update the settings to match your local MySQL environment:

```env
PORT=5000
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=kihindi_sacco
JWT_SECRET=your-super-secret-key-change-this-in-production
```

### 4. Start the application

```bash
npm run dev
```

For production:

```bash
npm run start:prod
```

## Database seeds

```bash
npm run seed
npm run seed:dev
npm run seed:reset
```

## Configuration

The application loads environment variables from `.env` using `dotenv` and exposes settings through `config/index.js`.

- `PORT` – HTTP port for the server
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – database connection credentials
- `JWT_SECRET` – secret used to sign authentication tokens
- `LOG_LEVEL` – optional logging level

## Project structure

- `app.js` – application entrypoint
- `config/` – application configuration files
- `models/` – Sequelize model definitions
- `routes/` – Express route handlers
- `middleware/` – authentication helpers
- `public/` – static frontend files
- `uploads/` – uploaded files storage
- `utils/` – helper utilities

## Notes

- `sequelize.sync({ alter: true })` is enabled in `app.js` for development and will automatically sync database tables.
- A default admin user is created automatically with username `admin` and password `password` if none exists.

## Optional

If you wish to remove VS Code sample `Edge` launch configs or add Firefox debugging, update `.vscode/launch.json` accordingly.
