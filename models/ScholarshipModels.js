const Sequelize = require('sequelize');
const db = require('../db/db_config.js');

const ScholarshipsActive = db.define('vwScholarshipsActive', {
    ScholarshipID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    ScholarshipName: {
        type: Sequelize.STRING
    },
    SponsorID: {
        type: Sequelize.INTEGER
    }

// Awards, Type, Description


}, {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
});

module.exports = {
    ScholarshipsActive
};
