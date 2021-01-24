require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');

module.exports = new Sequelize( {
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
});