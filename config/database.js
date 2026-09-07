const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('./index');

const db = config.database;
let sequelize;

if (db.url) {
    sequelize = new Sequelize(db.url, {
        logging: false,
        define: { timestamps: true },
        dialectOptions: db.ssl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {}
    });
} else if (db.dialect === 'sqlite') {
    const dir = path.dirname(db.storage);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: db.storage,
        logging: false,
        define: { timestamps: true }
    });
} else {
    sequelize = new Sequelize(db.name, db.user, db.password, {
        host: db.host,
        port: db.port,
        dialect: db.dialect,
        dialectModule: db.dialect === 'mysql' ? require('mysql2') : undefined,
        logging: false,
        define: { timestamps: true },
        dialectOptions: db.ssl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {}
    });
}

module.exports = sequelize;
