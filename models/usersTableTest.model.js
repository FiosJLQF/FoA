///////////////////////////////////////////////////////////////////////////////////
// Users Table
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const UsersTableTest = sequelize.define('tblWebsiteUsersTest', {
        UserID: {
            type: DataTypes.INTEGER//,
//            primaryKey: true
        },
        Username:                 DataTypes.STRING,
        UserFName:                DataTypes.STRING,
        UserLName:                DataTypes.STRING,
        UserTelephone:            DataTypes.STRING
    }, {
        freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
        timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return UsersTableTest;
};
