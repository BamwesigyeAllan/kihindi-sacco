const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoanRepayment = sequelize.define('LoanRepayment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    loan_id: { type: DataTypes.INTEGER, allowNull: false },
    amount_paid: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
    payment_mode: { type: DataTypes.ENUM('cash', 'bank', 'mmo'), defaultValue: 'cash' },
    reference_no: DataTypes.STRING(50),
    created_by: { type: DataTypes.INTEGER }
}, { timestamps: true, tableName: 'loan_repayments' });

module.exports = LoanRepayment;