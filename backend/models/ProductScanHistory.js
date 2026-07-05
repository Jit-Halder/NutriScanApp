const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductScanHistory = sequelize.define('ProductScanHistory', {
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
    tableName: 'productscanhistories',
    timestamps: true,
    updatedAt: false, // We only care about when it was scanned (createdAt)
});

module.exports = ProductScanHistory;
