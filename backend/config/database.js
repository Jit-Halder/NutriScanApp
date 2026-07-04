const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Sequelize } = require('sequelize');

let sequelize;

// Support DATABASE_URL / MYSQL_URL (standard for cloud providers like Aiven)
const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (databaseUrl) {
    // Cloud deployment: use the full connection URI
    sequelize = new Sequelize(databaseUrl, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Local development: use individual env variables
    sequelize = new Sequelize(
        process.env.DB_NAME || 'nutriscan',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
            dialectOptions: process.env.DB_SSL === 'true' ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            } : {},
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

module.exports = sequelize;
