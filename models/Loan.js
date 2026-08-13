const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    loan_id: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    member_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    interest_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    repayment_period_months: { type: DataTypes.INTEGER, allowNull: false },
    disbursement_date: DataTypes.DATEONLY,
    due_date: DataTypes.DATEONLY,
    balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    insurance_fee: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 }, // NEW
    status: { type: DataTypes.ENUM('pending', 'active', 'completed', 'defaulted'), defaultValue: 'pending' },
    created_by: { type: DataTypes.INTEGER }
}, { timestamps: true, tableName: 'loans' });

module.exports = Loan;