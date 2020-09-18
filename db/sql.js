
///////////////////////////////////////////////////////
// SQL Statements
///////////////////////////////////////////////////////

module.exports = {

    // SQL: Fields Of Study
    qryFieldOfStudyCategoriesAllDDL: {
        text: `SELECT   "FieldOfStudyCategoryID" AS optionid, "FieldOfStudyCategory" AS optiontext
               FROM     public."vwFieldOfStudyCategoriesAll"
               ORDER BY "FieldOfStudyCategorySortOrder"`,
        rowMode: 'array',
    },

    // SQL: Sponsors
    qrySponsorsAllDDL: {
    text: `SELECT   "sponsorid" AS optionid, "sponsorname" AS optiontext
           FROM     public."vwSponsorsAll"
           ORDER BY "sponsorname"`,
    rowMode: 'array',
    },

    // SQL: Citizenships
    qryCitizenshipCategoriesAllDDL: {
        text: `SELECT   "CitizenshipCategoryID" AS optionid, "CitizenshipCategory" AS optiontext
               FROM     public."vwCitizenshipCategoriesAll"
               ORDER BY "CitizenshipCategorySortOrder"`,
        rowMode: 'array',
    },
    
    // SQL: Year of Need
    qryYearOfNeedCategoriesAllDDL: {
       text: `SELECT   "YearOfNeedCategoryID" AS optionid, "YearOfNeedCategory" AS optiontext
              FROM     public."vwYearOfNeedCategoriesAll"
              ORDER BY "YearOfNeedCategorySortOrder"`,
       rowMode: 'array',
   },
   
    // SQL: Enrollment Statuses (for active scholarships)
    qryEnrollmentStatusesActiveDDL: {
       text: `SELECT   "EnrollmentStatusID" AS optionid, "EnrollmentStatus" AS optiontext
              FROM     public."vwEnrollmentStatusesActive"
              ORDER BY "EnrollmentStatus"`,
       rowMode: 'array',
   },

    // SQL: Military Service Categories (for active scholarships)
    qryMilitaryServiceCategoriesActiveDDL: {
       text: `SELECT   "MilitaryServiceCategoryID" AS optionid, "MilitaryServiceCategory" AS optiontext
              FROM     public."vwMilitaryServiceCategoriesActive"
              ORDER BY "MilitaryServiceCategory"`,
       rowMode: 'array',
   },

   // SQL: FAA Pilot Certificates (for active scholarships)
    qryFAAPilotCertificateCategoriesActiveDDL: {
       text: `SELECT   "FAAPilotCertificateCategoryID" AS optionid, "FAAPilotCertificateCategory" AS optiontext
              FROM     public."vwFAAPilotCertificateCategoriesActive"
              ORDER BY "FAAPilotCertificateCategory"`,
       rowMode: 'array',
   },

   // SQL: FAA Pilot Ratings (for active scholarships)
   qryFAAPilotRatingCategoriesActiveDDL: {
       text: `SELECT   "FAAPilotRatingCategoryID" AS optionid, "FAAPilotRatingCategory" AS optiontext
              FROM     public."vwFAAPilotRatingCategoriesActive"
              ORDER BY "FAAPilotRatingCategory"`,
       rowMode: 'array',
   },

   // SQL: FAA Mechanic Certificates (for active scholarships)
   qryFAAMechanicCertificateCategoriesActiveDDL: {
       text: `SELECT   "FAAMechanicCertificateCategoryID" AS optionid, "FAAMechanicCertificateCategory" AS optiontext
              FROM     public."vwFAAMechanicCertificateCategoriesActive"
              ORDER BY "FAAMechanicCertificateCategory"`,
       rowMode: 'array',
   },

    // SQL: Scholarships (All)
    qryScholarships: {
        text: `SELECT   "SponsorLogo", "ScholarshipID", "ScholarshipName", "SponsorName", "ScholarshipDescription", "ScholarshipAward"
                      , "ScholarshipLink", "ScholarshipEligibilityReqs", "ScholarshipApplDatesText"
                      , "ScholarshipContactFName" , "ScholarshipContactLName" , "ScholarshipContactEmail" , "ScholarshipContactPhone"
                      , "Criteria_FieldOfStudyText", "Criteria_Gender_FemaleOnly"
               FROM     public."vwScholarshipsActive"
               ORDER BY  "ScholarshipName"`,
        rowMode: 'array',  // returns results in an array instead of key/value pairs
    }
   
/*    // SQL: Scholarships (All)
    qryScholarshipsAll: {
    text: `SELECT   "ScholarshipID", "ScholarshipName", "SponsorName"
           FROM     public."vwScholarshipsActive"
           WHERE    "ScholarshipID" = $1`,
    values: ['705'],
    rowMode: 'array',  // returns results in an array instead of key/value pairs
    }
 */
}