const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'kihindi_sacco',
    dialect: process.env.DB_DIALECT || 'mysql',
    ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1'
  },
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
  logLevel: process.env.LOG_LEVEL || 'info'
};
