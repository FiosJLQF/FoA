// centralize all database functionality in one file
const { Sequelize, DataTypes } = require('sequelize');
const { user, host, database, password, port, ssl } = require('./db_configuration2.js');

const db = new Sequelize('database', 'user', 'password', {
    host: host,
    dialect: 'postgres',
    ssl: ssl,
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
  });

  // Test DB
  db.authenticate()
    .then( () => console.log('Database connected...'))
    .catch( err => console.log('Error: ' + err))

const Sponsors = db.define('Sponsors' {
    SponsorID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    SponsorName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'vwSponsorsAllWithScholarshipInfo'
});

module.exports = {
    db,
    Sponsors
};

/*
const { Pool } = require('pg');   // postgress_node
const { user, host, database, password, port, ssl } = require('./db_configuration2.js');
const pool2 = new Pool({ user, host, database, password, port, ssl });

module.exports = {
    pool2,
    query: (text, params, callback) => {
        const start = Date.now()
        return pool2.query(text, params, (err, res) => {
            const duration = Date.now() - start
//            console.log('executed query', {text, duration, rows: res.rowCount})
            callback(err, res)
        })
    },
    close: () => {
        pool2.end(err => {
            console.log('client has disconnected')
            if (err) {
              console.log('error during disconnection', err.stack)
            }
        })
    },
}
*/