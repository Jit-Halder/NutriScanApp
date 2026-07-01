const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserFeedback = sequelize.define('UserFeedback', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    timestamps: true,
    updatedAt: false,
});

module.exports = UserFeedback;
