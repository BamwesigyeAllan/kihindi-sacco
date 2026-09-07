const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dialect = (process.env.DB_DIALECT || (process.env.DB_NAME ? 'mysql' : 'sqlite')).toLowerCase();
const ssl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
const defaultPort = ssl ? 4000 : 3306;

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
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
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
  logLevel: process.env.LOG_LEVEL || 'info'
};
