const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dialect = (process.env.DB_DIALECT || (process.env.DB_NAME ? 'mysql' : 'sqlite')).toLowerCase();
const ssl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
const defaultPort = dialect === 'postgres' ? 5432 : (ssl ? 4000 : 3306);
const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

if (nodeEnv === 'production') {
  if (!process.env.JWT_SECRET || jwtSecret.length < 32 || jwtSecret === 'your-super-secret-key-change-this-in-production') {
    throw new Error('Set JWT_SECRET to a unique value of at least 32 characters in production.');
  }
  if (dialect === 'sqlite') {
    throw new Error('SQLite is only supported for local development; configure a persistent database for production.');
  }
  if (!process.env.DATABASE_URL && !(process.env.DB_HOST && process.env.DB_NAME)) {
    throw new Error('Configure DATABASE_URL or DB_HOST/DB_NAME for the production database.');
  }
  if (Boolean(process.env.INITIAL_ADMIN_USERNAME) !== Boolean(process.env.INITIAL_ADMIN_PASSWORD)) {
    throw new Error('Set both INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD to provision the first admin.');
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  initialAdmin: {
    username: process.env.INITIAL_ADMIN_USERNAME || null,
    password: process.env.INITIAL_ADMIN_PASSWORD || null
  },
  database: {
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || defaultPort,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'kihindi_sacco',
    dialect,
    ssl,
    storage: process.env.DB_STORAGE || path.join(process.cwd(), 'data', 'kihindi.sqlite')
  },
  jwtSecret,
  logLevel: process.env.LOG_LEVEL || 'info'
};
