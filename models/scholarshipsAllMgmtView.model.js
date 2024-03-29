///////////////////////////////////////////////////////////////////////////////////
// Active Scholarships (with Sponsor dimensional data)
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const ScholarshipsAllMgmtView = sequelize.define('vwScholarshipsAllMgmt', {
        ScholarshipID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        SponsorID:                                   DataTypes.INTEGER,
        SponsorName:                                 DataTypes.STRING,
        SponsorLogo:                                 DataTypes.STRING,
        ScholarshipName:                             DataTypes.STRING,
        ScholarshipLink:                             DataTypes.STRING,
        ScholarshipContactFName:                     DataTypes.STRING,
        ScholarshipContactLName:                     DataTypes.STRING,
        ScholarshipContactEmail:                     DataTypes.STRING,
        ScholarshipContactTelephone:                 DataTypes.STRING,
        ScholarshipAward:                            DataTypes.STRING,
        ScholarshipDescription:                      DataTypes.STRING,
        ScholarshipRecurrence:                       DataTypes.STRING,
        ScholarshipEligibilityReqs:                  DataTypes.STRING,
        ScholarshipEligibilityReqsOther:             DataTypes.STRING,
        ScholarshipApplListDate:                     DataTypes.STRING,
        ScholarshipApplStartDate:                    DataTypes.STRING,
        ScholarshipApplEndDate:                      DataTypes.STRING,
        Criteria_FieldOfStudy:                       DataTypes.STRING,
        Criteria_Citizenship:                        DataTypes.STRING,
        Criteria_AgeMinimum:                         DataTypes.STRING,
        Criteria_AgeMaximum:                         DataTypes.STRING,
        Criteria_YearOfNeed:                         DataTypes.STRING,
        Criteria_FemaleApplicantsOnly:               DataTypes.STRING,
        Criteria_FemaleApplicantsOnly_Text:          DataTypes.STRING,
        Criteria_EnrollmentStatus:                   DataTypes.STRING,
        Criteria_GPAMinimum:                         DataTypes.STRING,
        Criteria_USMilitaryService:                  DataTypes.STRING,
        Criteria_FAAPilotCertificate:                DataTypes.STRING,
        Criteria_FAAPilotRating:                     DataTypes.STRING,
        Criteria_FAAMechanicCertificate:             DataTypes.STRING,
        Notes_Admin:                                 DataTypes.STRING,
        ScholarshipStatus:                           DataTypes.STRING,
        ScholarshipIsFeatured:                       DataTypes.BOOLEAN
    }, {
        freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
        timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return ScholarshipsAllMgmtView;
};