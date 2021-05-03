///////////////////////////////////////////////////////////////////////////////////
// Scholarship Recurrence Options, formatted for DDL
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const ScholarshipRecurrenceCategoriesDDL = sequelize.define('vwScholarshipRecurrenceCategoriesDDL', {
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
    return ScholarshipRecurrenceCategoriesDDL;
};
