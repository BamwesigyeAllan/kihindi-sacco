const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FixedDeposit = sequelize.define('FixedDeposit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    account_no: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    member_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    amount_words: DataTypes.STRING(255),
    interest_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    tenor_months: { type: DataTypes.INTEGER, allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    maturity_date: { type: DataTypes.DATEONLY, allowNull: false },
    interest_payment: { type: DataTypes.ENUM('at_maturity', 'monthly', 'quarterly'), defaultValue: 'quarterly' },
    payment_mode: { type: DataTypes.ENUM('cash', 'bank', 'mmo'), defaultValue: 'cash' },
    reference_no: DataTypes.STRING(50),
    status: { type: DataTypes.ENUM('active', 'matured', 'withdrawn', 'penalized'), defaultValue: 'active' },
    interest_earned: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    last_interest_date: DataTypes.DATEONLY,
    total_interest_paid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER }
}, { timestamps: true, tableName: 'fixed_deposits' });

module.exports = FixedDeposit;