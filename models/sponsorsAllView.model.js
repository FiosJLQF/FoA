///////////////////////////////////////////////////////////////////////////////////
// Sponsors
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const SponsorsAllView = sequelize.define('vwSponsorsAll', {
        SponsorID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        SponsorIDMatching:           DataTypes.STRING,
        SponsorName:                 DataTypes.STRING,
        SponsorLogo:                 DataTypes.STRING,
        SponsorDescription:          DataTypes.STRING,
        SponsorWebsite:              DataTypes.STRING,
        SponsorContactFName:         DataTypes.STRING,
        SponsorContactLName:         DataTypes.STRING,
        SponsorContactEmail:         DataTypes.STRING,
        SponsorContactTelephone:     DataTypes.STRING,
        SponsorContactInfoFormatted: DataTypes.STRING,
        SponsorTypeText:             DataTypes.STRING,
        SponsorType:                 DataTypes.STRING,
        SponsorTypeMatchingText:     DataTypes.STRING,
        SponsorStatusID:             DataTypes.STRING,
        SponsorIsFeatured:           DataTypes.BOOLEAN,
        ScholarshipCountAll:         DataTypes.STRING,
        ScholarshipCountActive:      DataTypes.STRING
    }, {
    freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return SponsorsAllView;
};