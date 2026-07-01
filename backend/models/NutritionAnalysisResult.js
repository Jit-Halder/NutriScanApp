const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NutritionAnalysisResult = sequelize.define('NutritionAnalysisResult', {
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
    score: {
        type: DataTypes.STRING, // e.g., 'A', 'B', etc.
        allowNull: true,
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    warnings: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    suggestions: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    timestamps: true,
    updatedAt: false,
});

module.exports = NutritionAnalysisResult;
