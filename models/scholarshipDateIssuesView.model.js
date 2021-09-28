///////////////////////////////////////////////////////////////////////////////////
// Scholarship Date Issues
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const ScholarshipDateIssues = sequelize.query(
        `SELECT public."fnQueryToHTMLTable"('SELECT * FROM public."vwScholarships_DateProblems_Alert"') AS "TableDef"`,
        { type: sequelize.QueryTypes.SELECT }
    )
    .then( function(ScholarshipDateIssues) {
        
    });
    return ScholarshipDateIssues;
};