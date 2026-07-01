const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedProduct = sequelize.define('SavedProduct', {
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
    productName: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    updatedAt: false,
});

module.exports = SavedProduct;
