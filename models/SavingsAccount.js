const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavingsAccount = sequelize.define('SavingsAccount', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    member_id: { type: DataTypes.INTEGER, allowNull: false },
    account_no: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    balance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    interest_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('active', 'closed'), defaultValue: 'active' },
    opened_date: { type: DataTypes.DATEONLY, allowNull: false },
    created_by: { type: DataTypes.INTEGER }
}, { timestamps: true, tableName: 'savings_accounts' });

module.exports = SavingsAccount;