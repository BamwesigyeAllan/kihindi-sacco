const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoanApplication = sequelize.define('LoanApplication', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    member_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    repayment_period_months: { type: DataTypes.INTEGER, allowNull: false },
    insurance_fee: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    reviewed_by: { type: DataTypes.INTEGER },
    reviewed_at: DataTypes.DATE,
    notes: DataTypes.TEXT
}, { timestamps: true, tableName: 'loan_applications' });

module.exports = LoanApplication;