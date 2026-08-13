const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberApplication = sequelize.define('MemberApplication', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    gender: { type: DataTypes.ENUM('Male', 'Female', 'Other') },
    date_of_birth: DataTypes.DATEONLY,
    nin: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(15), allowNull: false },
    member_password: { type: DataTypes.STRING(255), allowNull: false },
    marital_status: DataTypes.STRING(20),
    village: DataTypes.STRING(50),
    parish: DataTypes.STRING(50),
    sub_county: DataTypes.STRING(50),
    district: DataTypes.STRING(50),
    occupation: DataTypes.STRING(50),
    stage_name: DataTypes.STRING(50),
    next_of_kin_name: { type: DataTypes.STRING(100), allowNull: false },
    next_of_kin_phone: { type: DataTypes.STRING(15), allowNull: false },
    entrance_fee_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    share_capital: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    photo_url: DataTypes.STRING(255),
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    reviewed_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    reviewed_at: DataTypes.DATE
}, { timestamps: true, tableName: 'member_applications' });

module.exports = MemberApplication;
