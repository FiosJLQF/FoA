///////////////////////////////////////////////////////////////////////////////////
// User Profile
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const UserProfiles = sequelize.define('vwWebsiteUserProfileTest', {
        UserID:   DataTypes.INTEGER,
        Username: DataTypes.STRING
    }, {
    freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return UserProfiles;
};