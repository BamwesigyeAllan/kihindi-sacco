const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    member_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('deposit', 'withdrawal', 'loan_disbursement', 'loan_repayment', 'fee', 'savings_deposit', 'savings_withdrawal', 'interest_payment'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    description: DataTypes.TEXT,
    reference: DataTypes.STRING(50),
    created_by: { type: DataTypes.INTEGER }
}, { timestamps: true, tableName: 'transactions' });

module.exports = Transaction;