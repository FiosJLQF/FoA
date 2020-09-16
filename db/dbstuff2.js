// centralize all database functionality in one file

const { Pool } = require('pg');   // postgress_node
const { user, host, database, password, port, ssl } = require('../db/db_configuration2.js');
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