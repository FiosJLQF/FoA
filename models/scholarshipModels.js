const Sequelize = require('sequelize');
const db = require('../db/db_config.js');

///////////////////////////////////////////////////////////////////////////////////
// a list of all active Scholarships (with Sponsor dimensional data)
///////////////////////////////////////////////////////////////////////////////////
const ScholarshipsActive = db.define('vwScholarshipsActive', {
    ScholarshipID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    ScholarshipName: {
        type: Sequelize.STRING
    },
    ScholarshipAward: {
        type: Sequelize.STRING
    },
    ScholarshipDescription: {
        type: Sequelize.STRING
    },
    Criteria_FieldOfStudyText: {
        type: Sequelize.STRING
    },
    Criteria_Gender_FemaleOnly: {
        type: Sequelize.STRING
    },
    SponsorID: {
        type: Sequelize.INTEGER
    }

}, {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
});

module.exports = {
    ScholarshipsActive
};
