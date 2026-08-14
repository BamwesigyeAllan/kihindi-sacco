const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
        type: DataTypes.ENUM(
            'admin',
            'chairman',
            'loan_officer',
            'cashier',
            'treasurer',
            'officer'
        ),
        defaultValue: 'officer'
    }
}, { timestamps: true, tableName: 'users' });

User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

User.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
};

module.exports = User;