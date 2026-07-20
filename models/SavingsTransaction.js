const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavingsTransaction = sequelize.define('SavingsTransaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    savings_account_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('deposit', 'withdrawal', 'interest'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    description: DataTypes.TEXT,
    transaction_date: { type: DataTypes.DATEONLY, allowNull: false },
    reference_no: DataTypes.STRING(50),
    created_by: { type: DataTypes.INTEGER }
}, { timestamps: true, tableName: 'savings_transactions' });

module.exports = SavingsTransaction;