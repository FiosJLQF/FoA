///////////////////////////////////////////////////////////////////////////////////
// Active Scholarships (with Sponsor dimensional data)
///////////////////////////////////////////////////////////////////////////////////

module.exports = (sequelize, DataTypes) => {
    const ScholarshipsActive = sequelize.define('vwScholarshipsActive', {
        ScholarshipID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        ScholarshipName:                             DataTypes.STRING,
        ScholarshipNameMatching:                     DataTypes.STRING,
        ScholarshipLink:                             DataTypes.STRING,
        ScholarshipAward:                            DataTypes.STRING,
        ScholarshipDescription:                      DataTypes.STRING,
        ScholarshipDescriptionMatching:              DataTypes.STRING,
        ScholarshipEligibilityReqs:                  DataTypes.STRING,
        ScholarshipEligibilityReqsMatching:          DataTypes.STRING,
        ScholarshipApplDatesText:                    DataTypes.STRING,
        ScholarshipContactInfoFormatted:             DataTypes.STRING,
        Criteria_FieldOfStudy:                       DataTypes.STRING,
        Criteria_FieldOfStudyText:                   DataTypes.STRING,
        Criteria_FieldOfStudyMatchingText:           DataTypes.STRING,
        Criteria_GenderMatchingText:                 DataTypes.STRING,
//        Criteria_Gender_FemaleOnly:                  DataTypes.STRING,
        Criteria_FemaleApplicantsOnly:               DataTypes.STRING,
        Criteria_FemaleApplicantsOnly_Text:          DataTypes.STRING,
        Criteria_AgeMinimum:                         DataTypes.INTEGER,
        Criteria_AgeMaximum:                         DataTypes.INTEGER,
        Criteria_Citizenship:                        DataTypes.STRING,
        Criteria_CitizenshipMatchingText:            DataTypes.STRING,
        Criteria_YearOfNeed:                         DataTypes.STRING,
        Criteria_YearOfNeedMatchingText:             DataTypes.STRING,
        Criteria_EnrollmentStatus:                   DataTypes.STRING,
        Criteria_EnrollmentStatusMatchingText:       DataTypes.STRING,
        Criteria_GPAMinimum:                         DataTypes.NUMBER,
        Criteria_MilitaryService:                    DataTypes.STRING,
        Criteria_MilitaryServiceMatchingText:        DataTypes.STRING,
        Criteria_FAAPilotCertificate:                DataTypes.STRING,
        Criteria_FAAPilotCertificateMatchingText:    DataTypes.STRING,
        Criteria_FAAPilotRating:                     DataTypes.STRING,
        Criteria_FAAPilotRatingMatchingText:         DataTypes.STRING,
        Criteria_FAAMechanicCertificate:             DataTypes.STRING,
        Criteria_FAAMechanicCertificateMatchingText: DataTypes.STRING,
        SponsorID:                                   DataTypes.STRING,
        SponsorIDMatching:                           DataTypes.STRING,
        SponsorLogo:                                 DataTypes.STRING,
        SponsorName:                                 DataTypes.STRING,
        SponsorNameMatching:                         DataTypes.STRING,
        SponsorTypeMatchingText:                     DataTypes.STRING,
        SponsorIsFeatured:                           DataTypes.BOOLEAN,
        ScholarshipIsFeatured:                       DataTypes.BOOLEAN
    }, {
        freezeTableName: true,  // don't have Sequelize automatically pluralize the table name
        timestamps: false,  // don't add the timestamp attributes (updatedAt, createdAt)
    });
    return ScholarshipsActive;
};