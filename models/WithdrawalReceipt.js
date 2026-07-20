const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WithdrawalReceipt = sequelize.define('WithdrawalReceipt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    member_id: { type: DataTypes.INTEGER, allowNull: false },
    account_no: { type: DataTypes.STRING(20), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    national_id: { type: DataTypes.STRING(20), allowNull: false },
    receipt_no: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    withdrawal_date: { type: DataTypes.DATEONLY, allowNull: false }
}, { timestamps: true, tableName: 'withdrawal_receipts' });

module.exports = WithdrawalReceipt;