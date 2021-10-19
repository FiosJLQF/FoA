///////////////////////////////////////////////////////////////////////////////////
// Sponsor Names, formatted for the search criteria DDL, active only
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const SponsorsActiveDDL = sequelize.define('vwSponsorsActiveDDL', {
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
    return SponsorsActiveDDL;
};
