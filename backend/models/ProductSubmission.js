const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductSubmission = sequelize.define('ProductSubmission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    barcode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ingredients: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    nutritionFacts: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    packagingDetails: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    }
}, {
    timestamps: true,
});

module.exports = ProductSubmission;
