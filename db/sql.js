
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

    // SQL: Sponsors for DDL (All)
    qrySponsorsAllDDL: {
    text: `SELECT   "SponsorID" AS optionid, "SponsorName" AS optiontext
           FROM     public."vwSponsorsAll"
           ORDER BY "SponsorName"`,
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
    qryEnrollmentStatusCategoriesAllDDL: {
       text: `SELECT   "EnrollmentStatusCategoryID" AS optionid, "EnrollmentStatusCategory" AS optiontext
              FROM     public."vwEnrollmentStatusCategoriesAll"
              ORDER BY "EnrollmentStatusCategorySortOrder"`,
       rowMode: 'array',
   },

    // SQL: Military Service Categories (for active scholarships)
    qryMilitaryServiceCategoriesAllDDL: {
       text: `SELECT   "MilitaryServiceCategoryID" AS optionid, "MilitaryServiceCategory" AS optiontext
              FROM     public."vwMilitaryServiceCategoriesAll"
              ORDER BY "MilitaryServiceCategorySortOrder"`,
       rowMode: 'array',
   },

   // SQL: FAA Pilot Certificates (for active scholarships)
    qryFAAPilotCertificateCategoriesAlleDDL: {
       text: `SELECT   "FAAPilotCertificateCategoryID" AS optionid, "FAAPilotCertificateCategory" AS optiontext
              FROM     public."vwFAAPilotCertificateCategoriesAll"
              ORDER BY "FAAPilotCertificateCategorySortOrder"`,
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
        text: `SELECT   "SponsorID", "SponsorLogo", "ScholarshipID", "ScholarshipName", "SponsorName", "ScholarshipDescription"
                      , "ScholarshipAward", "ScholarshipLink", "ScholarshipEligibilityReqs", "ScholarshipApplDatesText"
                      , "ScholarshipContactFName" , "ScholarshipContactLName" , "ScholarshipContactEmail" , "ScholarshipContactPhone"
                      , "Criteria_FieldOfStudyText", "Criteria_Gender_FemaleOnly"
               FROM     public."vwScholarshipsActive"
               ORDER BY  "SponsorName", "ScholarshipName"`,
        rowMode: 'array',  // returns results in an array instead of key/value pairs
    },
  
    // SQL: Sponsors (All)
    qrySponsorsAll: {
       text: `SELECT DISTINCT
                        "SponsorID", "SponsorName", "SponsorLogo", "SponsorDescription", "SponsorWebsite", "SponsorTypeText"
                      , "SponsorContactFName", "SponsorContactLName", "SponsorContactEmail", "SponsorContactTelephone"
              FROM      public."vwSponsorsAllWithScholarshipInfo"
              ORDER BY "SponsorName"`,
      rowMode: 'array',
   },

   // SQL: Sponsors with Scholarship Info (All)
    qrySponsorsAllWithScholarshipInfo: {
        text: `SELECT    "SponsorID", "ScholarshipID", "ScholarshipName", "SponsorName", "SponsorLogo", "SponsorDescription", "SponsorWebsite"
                       , "SponsorContactFName", "SponsorContactLName", "SponsorContactEmail", "SponsorContactTelephone", "SponsorTypeText"
                       , "ScholarshipDescription", "ScholarshipAward", "ScholarshipLink", "ScholarshipEligibilityReqs"
                       , "ScholarshipApplStartDate", "ScholarshipApplEndDate", "ScholarshipApplDatesText", "ScholarshipContactFName"
                       , "ScholarshipContactLName", "ScholarshipContactEmail", "ScholarshipContactPhone", "Criteria_FieldOfStudy"
                       , "Criteria_FieldOfStudyText", "Criteria_Gender_FemaleOnly"
               FROM      public."vwSponsorsAllWithScholarshipInfo"
               ORDER BY "SponsorName"`,
       rowMode: 'array',
    },
  /*
       // SQL: Sponsor Types (All)
    qrySponsorTypeCategoriesAllDDL: {
       text: `SELECT   "SponsorTypeCategoryID" AS optionid, "SponsorTypeCategory" AS optiontext
              FROM     public."vwSponsorTypeCategoriesAll"
              ORDER BY "SponsorTypeCategorySortOrder"`,
       rowMode: 'array',
   }
*/
}