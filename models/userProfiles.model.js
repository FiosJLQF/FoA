///////////////////////////////////////////////////////////////////////////////////
// User Profile
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const UserProfiles = sequelize.define('vwWebsiteUserProfiles', {
        UserID:         DataTypes.INTEGER,
        Username:       DataTypes.STRING,
        UserFName:      DataTypes.STRING,
        UserLName:      DataTypes.STRING,
        UserTelephone:  DataTypes.STRING,
    }, {
        schema: 'public',
        freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
        timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return UserProfiles;
};