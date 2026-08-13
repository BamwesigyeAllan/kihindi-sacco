const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const useSsl = process.env.DB_USE_SSL === 'true';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT || 4000,
        logging: false,
        define: { timestamps: true },
        dialectOptions: useSsl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {}
    }
);

module.exports = sequelize;
