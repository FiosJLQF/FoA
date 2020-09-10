// centralize all database functionality in one file

const { Pool } = require('pg');   // postgress_node
const { user, host, database, password, port } = require('../db/db_configuration');
const pool = new Pool({ user, host, database, password, port });

module.exports = {
    pool,
    query: (text, params, callback) => {
        const start = Date.now()
        return pool.query(text, params, (err, res) => {
            const duration = Date.now() - start
//            console.log('executed query', {text, duration, rows: res.rowCount})
            callback(err, res)
        })
    },
    close: () => {
        pool.end(err => {
            console.log('client has disconnected')
            if (err) {
              console.log('error during disconnection', err.stack)
            }
        })
    },
}