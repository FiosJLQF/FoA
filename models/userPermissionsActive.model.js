///////////////////////////////////////////////////////////////////////////////////
// Website User Permissions
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const UserPermissionsActive = sequelize.define('vwWebsiteUserPermissionsActiveTest', {
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        ObjectName:     DataTypes.STRING,
        ObjectValues:   DataTypes.STRING,
        CanCreate:      DataTypes.BOOLEAN,
        CanRead:        DataTypes.BOOLEAN,
        CanUpdate:      DataTypes.BOOLEAN,
        CanDelete:      DataTypes.BOOLEAN,
    }, {
    freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
    timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return UserPermissionsActive;
};