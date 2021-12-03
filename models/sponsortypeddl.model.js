///////////////////////////////////////////////////////////////////////////////////
// Sponsor Type Options, formatted for the search criteria DDL
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const SponsorTypeCategoriesDDL = sequelize.define('vwSponsorTypeCategoriesDDL', {
        optionid: { 
            type: DataTypes.INTEGER,
            primaryKey: true
        }, 
        optiontext: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
        timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return SponsorTypeCategoriesDDL;
};