const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoanProduct = sequelize.define('LoanProduct', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    description: DataTypes.TEXT,
    interest_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    rate_type: { type: DataTypes.ENUM('per_annum', 'per_month'), defaultValue: 'per_annum' },
    max_amount: DataTypes.DECIMAL(12, 2),
    min_amount: DataTypes.DECIMAL(12, 2),
    max_tenor_months: DataTypes.INTEGER,
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
}, { timestamps: true, tableName: 'loan_products' });

module.exports = LoanProduct;