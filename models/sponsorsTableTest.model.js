///////////////////////////////////////////////////////////////////////////////////
// Sponsors Table
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const SponsorsTableTest = sequelize.define('tblSponsorsTest', {
        SponsorID: {
            type: DataTypes.INTEGER//,
//            primaryKey: true
        },
        SponsorName:                 DataTypes.STRING,
        SponsorDescription:          DataTypes.STRING,
        SponsorWebsite:              DataTypes.STRING,
        SponsorLogo:                 DataTypes.STRING,
        SponsorContactFName:         DataTypes.STRING,
        SponsorContactLName:         DataTypes.STRING,
        SponsorContactEmail:         DataTypes.STRING,
        SponsorContactTelephone:     DataTypes.STRING,
        SponsorType:                 DataTypes.STRING,
    }, {
        freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
        timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return SponsorsTableTest;
};