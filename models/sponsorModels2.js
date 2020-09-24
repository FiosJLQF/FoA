const Sequelize = require('sequelize');
const db = require('../db/db_config.js');

///////////////////////////////////////////////////////////////////////////////////
// a list of all Sponsors, with all data elements
///////////////////////////////////////////////////////////////////////////////////
const SponsorsAll = db.define('vwSponsorsAll', {
    SponsorID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    SponsorName: {
        type: Sequelize.STRING
    },
    SponsorLogo: {
        type: Sequelize.STRING
    },
    SponsorDescription: {
        type: Sequelize.STRING
    },
    SponsorWebsite: {
        type: Sequelize.STRING
    },
    SponsorContactFName: {
        type: Sequelize.STRING
    },
    SponsorContactLName: {
        type: Sequelize.STRING
    },
    SponsorContactEmail: {
        type: Sequelize.STRING
    },
    SponsorContactTelephone: {
        type: Sequelize.STRING
    },
    SponsorContactInfoFormatted: {
        type: Sequelize.STRING
    },
    SponsorTypeText: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
});


///////////////////////////////////////////////////////////////////////////////////
// a list of all Sponsors, formatted for the "Sponsor(s)" search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const SponsorsDDL = db.define('vwSponsorsDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
});


///////////////////////////////////////////////////////////////////////////////////
// a list of all Sponsor Types, formatted for the "Sponsor Type(s)" search criteria DDL
///////////////////////////////////////////////////////////////////////////////////
const SponsorTypeCategoriesDDL = db.define('vwSponsorTypeCategoriesDDL', {
    optionid: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    optiontext: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
});

module.exports = {
    SponsorsAll,
    SponsorTypeCategoriesDDL,
    SponsorsDDL
};
