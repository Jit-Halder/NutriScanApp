const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    healthConditions: {
        type: DataTypes.JSON, // e.g., ["diabetes", "hypertension"]
        allowNull: true,
    },
    dietaryPreferences: {
        type: DataTypes.JSON, // e.g., ["vegan", "keto"]
        allowNull: true,
    },
    allergies: {
        type: DataTypes.JSON, // e.g., ["peanuts", "dairy"]
        allowNull: true,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    height: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    fitnessGoals: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: true,
});

module.exports = UserProfile;
