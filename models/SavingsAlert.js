const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavingsAlert = sequelize.define('SavingsAlert', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    member_id: { type: DataTypes.INTEGER, allowNull: false },
    alert_type: { type: DataTypes.ENUM('milestone', 'low_balance', 'high_balance'), allowNull: false },
    threshold_amount: DataTypes.DECIMAL(12, 2),
    triggered_at: { type: DataTypes.DATE },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, tableName: 'savings_alerts' });

module.exports = SavingsAlert;