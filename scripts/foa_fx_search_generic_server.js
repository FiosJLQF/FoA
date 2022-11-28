//////////////////////////////////////////////////////////////////////////////////////////
// scripts used by the search engine
//
//  - formatSearchCriteriaArray(searchCriteriaOriginal)
//  - processScholarshipSearchCriteria(req.body)
//  - processSponsorSearchCriteria(req.body)
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
// external scripts and functions
//////////////////////////////////////////////////////////////////////
const commonFx = require('./common_fx_server');
const { ScholarshipsActive, SponsorsActiveView } = require('../models/sequelize_foa.js');
const { Op } = require('sequelize');  // enables WHERE clause operators


//////////////////////////////////////////////////////////////////////
// format search engine criteria for use in SQL WHERE clause
//////////////////////////////////////////////////////////////////////
async function formatSearchCriteriaArray(searchCriteriaOriginal) {

    let searchCriteriaSearchFormat = '';
    let searchCriteriaLogFormat = '';
    let searchCriteriaArray = [];

    // Convert single value input into an array (if not already)
    searchCriteriaArray = searchCriteriaOriginal ? [].concat(searchCriteriaOriginal) : [];

    // Remove any "Not Selected" options
    if ( searchCriteriaArray.indexOf('0') >= 0 ) {
        searchCriteriaArray.splice(searchCriteriaArray.indexOf('0'), 1);
    };

    // Reformat the selected values (if any) into a "LIKE ANY" parameter string
    if ( searchCriteriaArray.length > 0 ) {
        searchCriteriaSearchFormat = "{%" + searchCriteriaArray.join("%,%") + "%,%000000%}"; // Add the "No Preference" option
    } else {
        searchCriteriaSearchFormat = '{}'; 
    };

    // Reformat the selected values (if any) into a tilde-delimited string for logging and reporting
    searchCriteriaLogFormat = searchCriteriaSearchFormat.replace('{%','~').replace('%}','~').replaceAll('%,%','~');

    // Return the formatted values
    return { searchCriteriaSearchFormat: searchCriteriaSearchFormat, // formatted for P-SQL "any" search matching
             searchCriteriaLogFormat: searchCriteriaLogFormat, // formatted for writing to logs
             searchCriteriaArray: searchCriteriaArray // formatted for array functions
    };

};


//////////////////////////////////////////////////////////////////////
// process scholarship search criteria and return formatted object for use
//////////////////////////////////////////////////////////////////////
async function processScholarshipSearchCriteria(reqBody) {

    // Local variables
    let scholarshipsMatching = '';
    let criteriaFieldOfStudyFormatted = []; // select all that apply
    let criteriaSponsorFormatted = []; // select all that apply
    let criteriaAgeFormatted = ''; // textbox
    let criteriaCitizenshipFormatted = []; // select one, but processed as array
    let criteriaYearOfNeedFormatted = []; // select one, but processed as array
    let criteriaKeywordsString = ''; // textbox
    let criteriaKeywordsArrayRaw = []; // array created from comma-delimited keyword list
    let criteriaKeywordsArrayFinal = []; // array created from comma-delimited keyword list
    let criteriaKeywordsFormatted = [];
    let criteriaFemaleOnlyFormatted = []; // select one, but processed as array
    let criteriaEnrollmentStatusFormatted = []; // select one, but processed as array
    let criteriaGPAFormatted = ''; // textbox
    let criteriaMilitaryServiceFormatted = []; // select one, but processed as array
    let criteriaFAAPilotCertificateFormatted = []; // select all that apply
    let criteriaFAAPilotRatingFormatted = []; // select all that apply
    let criteriaFAAMechanicCertificateFormatted = []; // select all that apply

    let matchCount = 0;  // for each scholarship, how many criteria did they match on?

    //////////////////////////////////////
    // Field(s) of Study
    //////////////////////////////////////
    try {
        criteriaFieldOfStudyFormatted = await formatSearchCriteriaArray(reqBody.filterFieldOfStudyInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Field of Study', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat: ${criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Field of Study', 0, 'Informational',
            criteriaFieldOfStudyFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Sponsor(s)
    //////////////////////////////////////
    try {
        criteriaSponsorFormatted = await formatSearchCriteriaArray(reqBody.filterSponsorNamesInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Sponsor Search Criteria Formatting', 'Sponsor', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaSponsorFormatted.searchCriteriaSearchFormat: ${criteriaSponsorFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaSponsorFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Sponsor', 0, 'Informational',
            criteriaSponsorFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Age
    //////////////////////////////////////
    criteriaAgeFormatted = reqBody.filterAgeInput;
    console.log(`criteriaAgeFormatted: ${criteriaAgeFormatted}`);
    // Log search criteria
    if ( criteriaAgeFormatted.length > 0 ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Age', 0, 'Informational',
            criteriaAgeFormatted, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    } else {
        criteriaAgeFormatted = null; // so that the WHERE clause below will ignore this criteria
    };

    //////////////////////////////////////
    // Citizenship
    //////////////////////////////////////
    try {
        criteriaCitizenshipFormatted = await formatSearchCriteriaArray(reqBody.filterCitizenshipInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Citizenship', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaCitizenshipFormatted.searchCriteriaSearchFormat: ${criteriaCitizenshipFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaCitizenshipFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Citizenship', 0, 'Informational',
            criteriaCitizenshipFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Year of Need
    //////////////////////////////////////
    try {
        criteriaYearOfNeedFormatted = await formatSearchCriteriaArray(reqBody.filterYearOfNeedInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Year Of Need', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaYearOfNeedFormatted.searchCriteriaSearchFormat: ${criteriaYearOfNeedFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaYearOfNeedFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Year Of Need', 0, 'Informational',
            criteriaYearOfNeedFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Keywords
    //////////////////////////////////////
    criteriaKeywordsString = reqBody.filterKeywordsInput.toUpperCase();
    console.log(`criteriaKeywordsString: '${criteriaKeywordsString}'`);
    // Convert comma-delimited list to array for standard processing
    if (criteriaKeywordsString.length > 0) {
        if (criteriaKeywordsString.includes(',')) {
            // create an array of the values
            criteriaKeywordsArrayRaw = criteriaKeywordsString.split(",")
            // remove whitespace around the keywords
            criteriaKeywordsArrayRaw.forEach( function(keyword, ind, keywords) {
                criteriaKeywordsArrayFinal.push(keyword.trim());
            });
        } else {
            // add the single value as the only element in the array
            criteriaKeywordsArrayFinal = criteriaKeywordsString.trim();
        }
    }
    console.log(`criteriaKeywordsArrayFinal: '${criteriaKeywordsArrayFinal}'`);
    // Process the formatted keywords array
    try {
        criteriaKeywordsFormatted = await formatSearchCriteriaArray(criteriaKeywordsArrayFinal);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Keywords', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaKeywordsFormatted.searchCriteriaSearchFormat: ${criteriaKeywordsFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaKeywordsString.length > 0 ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Keywords', 0, 'Informational',
            criteriaKeywordsString, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Female Applicants Only
    //////////////////////////////////////
    try {
        criteriaFemaleOnlyFormatted = await formatSearchCriteriaArray(reqBody.filterGenderInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Female Applicants Only', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaFemaleOnlyFormatted.searchCriteriaSearchFormat: ${criteriaFemaleOnlyFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaFemaleOnlyFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Female Applicants Only', 0, 'Informational',
            criteriaFemaleOnlyFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Enrollment Status
    //////////////////////////////////////
    try {
        criteriaEnrollmentStatusFormatted = await formatSearchCriteriaArray(reqBody.filterEnrollmentStatusInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Enrollment Status', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaEnrollmentStatusFormatted.searchCriteriaSearchFormat: ${criteriaEnrollmentStatusFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaEnrollmentStatusFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Enrollment Status', 0, 'Informational',
            criteriaEnrollmentStatusFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // GPA
    //////////////////////////////////////
    criteriaGPAFormatted = reqBody.filterGPAInput;
    console.log(`criteriaGPAFormatted: ${criteriaGPAFormatted}`);
    // Log search criteria
    if ( criteriaGPAFormatted.length > 0 ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'GPA', 0, 'Informational',
            criteriaGPAFormatted, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    } else {
        criteriaGPAFormatted = null; // so that the WHERE clause below will ignore this criteria
    };

    //////////////////////////////////////
    // Military Service
    //////////////////////////////////////
    try {
        criteriaMilitaryServiceFormatted = await formatSearchCriteriaArray(reqBody.filterUSMilitaryServiceInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Military Service', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaMilitaryServiceFormatted.searchCriteriaSearchFormat: ${criteriaMilitaryServiceFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaMilitaryServiceFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Military Service', 0, 'Informational',
            criteriaMilitaryServiceFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // FAA Pilot Certificate
    //////////////////////////////////////
    try {
        criteriaFAAPilotCertificateFormatted = await formatSearchCriteriaArray(reqBody.filterFAAPilotCertificateInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'FAA Pilot Certificate', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaFAAPilotCertificateFormatted.searchCriteriaSearchFormat: ${criteriaFAAPilotCertificateFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaFAAPilotCertificateFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'FAA Pilot Certificate', 0, 'Informational',
            criteriaFAAPilotCertificateFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // FAA Pilot Rating
    //////////////////////////////////////
    try {
        criteriaFAAPilotRatingFormatted = await formatSearchCriteriaArray(reqBody.filterFAAPilotRatingInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'FAA Pilot Rating', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaFAAPilotRatingFormatted.searchCriteriaSearchFormat: ${criteriaFAAPilotRatingFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaFAAPilotRatingFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'FAA Pilot Rating', 0, 'Informational',
            criteriaFAAPilotRatingFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // FAA Mechanic Certificate
    //////////////////////////////////////
    try {
        criteriaFAAMechanicCertificateFormatted = await formatSearchCriteriaArray(reqBody.filterFAAMechanicCertRatingInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'FAA Mechanic Certificate', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaFAAMechanicCertificateFormatted.searchCriteriaSearchFormat: ${criteriaFAAMechanicCertificateFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaFAAMechanicCertificateFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'FAA Mechanic Certificate', 0, 'Informational',
            criteriaFAAMechanicCertificateFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    ////////////////////////////////////////////////////
    // Add the search parameters, and find the resultant records
    ////////////////////////////////////////////////////
    try {
        scholarshipsMatching = await ScholarshipsActive.findAndCountAll( {
            where: {
                [Op.or]: {
                    Criteria_FieldOfStudy: {
                        [Op.like]: {
                            [Op.any]: criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat } },
                    SponsorID: {
                        [Op.like]: {
                            [Op.any]: criteriaSponsorFormatted.searchCriteriaSearchFormat } },

                    // Age must match both criteria
                    [Op.and]: {
                        Criteria_AgeMinimum: {
                            [Op.lt]: criteriaAgeFormatted },
                        Criteria_AgeMaximum: {
                            [Op.gt]: criteriaAgeFormatted }
                    },

                    Criteria_Citizenship: {
                        [Op.like]: {    
                            [Op.any]: criteriaCitizenshipFormatted.searchCriteriaSearchFormat } },
                    Criteria_YearOfNeed: {
                        [Op.like]: {    
                            [Op.any]: criteriaYearOfNeedFormatted.searchCriteriaSearchFormat } },

                    // Keywords match on four text elements
                    SponsorNameMatching: {
                        [Op.like]: {    
                            [Op.any]: criteriaKeywordsFormatted.searchCriteriaSearchFormat } },
                    ScholarshipNameMatching: {
                        [Op.like]: {    
                            [Op.any]: criteriaKeywordsFormatted.searchCriteriaSearchFormat } },
                    ScholarshipDescriptionMatching: {
                        [Op.like]: {    
                            [Op.any]: criteriaKeywordsFormatted.searchCriteriaSearchFormat } },
                    ScholarshipEligibilityReqsMatching: {
                        [Op.like]: {    
                            [Op.any]: criteriaKeywordsFormatted.searchCriteriaSearchFormat } },

                    Criteria_FemaleApplicantsOnly: {
                        [Op.like]: {    
                            [Op.any]: criteriaFemaleOnlyFormatted.searchCriteriaSearchFormat } },
                    Criteria_EnrollmentStatus: {
                        [Op.like]: {    
                            [Op.any]: criteriaEnrollmentStatusFormatted.searchCriteriaSearchFormat } },
                    Criteria_GPAMinimum: {
                        [Op.lt]: criteriaGPAFormatted },
                    Criteria_MilitaryService: {
                        [Op.like]: {    
                            [Op.any]: criteriaMilitaryServiceFormatted.searchCriteriaSearchFormat } },
                    Criteria_FAAPilotCertificate: {
                        [Op.like]: {    
                            [Op.any]: criteriaFAAPilotCertificateFormatted.searchCriteriaSearchFormat } },
                    Criteria_FAAPilotRating: {
                        [Op.like]: {    
                            [Op.any]: criteriaFAAPilotRatingFormatted.searchCriteriaSearchFormat } },
                    Criteria_FAAMechanicCertificate: {
                        [Op.like]: {    
                            [Op.any]: criteriaFAAMechanicCertificateFormatted.searchCriteriaSearchFormat } },
                }
            } 
        } );
    } catch(e) {
        console.log(e);
    };
    console.log(`Matching scholarships: ${scholarshipsMatching.count}`);

    ////////////////////////////////////////////////////
    // Get the ranking for each matching scholarship
    ////////////////////////////////////////////////////
    for (let matchingScholarship of scholarshipsMatching.rows) {

        // Reset matching variables for each scholarship to be processed
        matchCount = 0;
        console.log(`matchingScholarship[name]: ${matchingScholarship['ScholarshipName']}`);

        // Field of Study
        for (const fosItem of criteriaFieldOfStudyFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_FieldOfStudy'].indexOf(fosItem) >= 0 ? 1 : 0;
        };
        
        // Sponsor
        for (const spnItem of criteriaSponsorFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['SponsorID'].indexOf(spnItem) >= 0 ? 1 : 0;
        };

        // Age
        if ( criteriaAgeFormatted ) {
            if ( criteriaAgeFormatted >= matchingScholarship['Criteria_AgeMinimum'] && criteriaAgeFormatted <= matchingScholarship['Criteria_AgeMaximum'] ) {
                matchCount++;
            };
        };

        // Citizenship
        for (const citItem of criteriaCitizenshipFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_Citizenship'].indexOf(citItem) >= 0 ? 1 : 0;
        };

        // Year of Need
        for (const yonItem of criteriaYearOfNeedFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_YearOfNeed'].indexOf(yonItem) >= 0 ? 1 : 0;
        };

        // Keywords
        for (const keyItem of criteriaKeywordsFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['SponsorNameMatching'].indexOf(keyItem) >= 0 ? 1 : 0;
            matchCount += matchingScholarship['ScholarshipNameMatching'].indexOf(keyItem) >= 0 ? 1 : 0;
            matchCount += matchingScholarship['ScholarshipDescriptionMatching'].indexOf(keyItem) >= 0 ? 1 : 0;
            matchCount += matchingScholarship['ScholarshipEligibilityReqsMatching'].indexOf(keyItem) >= 0 ? 1 : 0;
        };

        // Female Applicants
        for (const faoItem of criteriaFemaleOnlyFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_FemaleApplicantsOnly'].indexOf(faoItem) >= 0 ? 1 : 0;
        };

        // Enrollment Status
        for (const cesItem of criteriaEnrollmentStatusFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_EnrollmentStatus'].indexOf(cesItem) >= 0 ? 1 : 0;
        };

        // GPA
        if ( criteriaGPAFormatted ) {
            if ( criteriaGPAFormatted >= matchingScholarship['Criteria_GPAMinimum'] ) {
                matchCount++;
            };
        };

        // U.S. Military Service
        for (const umsItem of criteriaMilitaryServiceFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_MilitaryService'].indexOf(umsItem) >= 0 ? 1 : 0;
        };

        // FAA Pilot Certificate
        for (const fpcItem of criteriaFAAPilotCertificateFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_FAAPilotCertificate'].indexOf(fpcItem) >= 0 ? 1 : 0;
        };

        // FAA Pilot Rating
        for (const fprItem of criteriaFAAPilotRatingFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_FAAPilotRating'].indexOf(fprItem) >= 0 ? 1 : 0;
        };

        // FAA Mechanic Certificate
        for (const fmcItem of criteriaFAAMechanicCertificateFormatted.searchCriteriaArray){
            matchCount += matchingScholarship['Criteria_FAAMechanicCertificate'].indexOf(fmcItem) >= 0 ? 1 : 0;
        };

        // Add the matching criteria count to the scholarship record
        matchingScholarship['matchCount'] = matchCount;
        console.log(`     - matched on ${matchingScholarship['matchCount']} criteria.`);
//        matchingScholarship['ScholarshipName'] += ' (' + matchCount + ')';

    }; // loop to the next scholarship to process
        
    //////////////////////////////////////
    // Re-sort the scholarships based on match count, then Sponsor Name, then Scholarship Name
    //////////////////////////////////////
    scholarshipsMatching.rows.sort( (a,b) => (
            b.matchCount - a.matchCount ||
            a.SponsorName.localeCompare(b.SponsorName) ||
            a.ScholarshipName.localeCompare(b.ScholarshipName)
        ));

    //////////////////////////////////////
    // Return the formatted values
    //////////////////////////////////////
    return {
        scholarshipsMatching: scholarshipsMatching
    };  

};


//////////////////////////////////////////////////////////////////////
// process sponsor search criteria and return formatted object for use
//////////////////////////////////////////////////////////////////////
async function processSponsorSearchCriteria(reqBody) {

    // Local variables
    let sponsorsMatching = '';
    let criteriaKeywordsString = ''; // textbox
    let criteriaKeywordsArrayRaw = []; // array created from comma-delimited keyword list
    let criteriaKeywordsArrayFinal = []; // array created from comma-delimited keyword list
    let criteriaKeywordsFormatted = [];
    let criteriaSponsorFormatted = []; // select all that apply
    let criteriaSponsorTypeFormatted = []; // select all that apply
    let matchCount = 0;  // for each scholarship, how many criteria did they match on?

    //////////////////////////////////////
    // Keywords
    //////////////////////////////////////
    criteriaKeywordsString = reqBody.filterKeywordsInput.toUpperCase();
    console.log(`criteriaKeywordsString: '${criteriaKeywordsString}'`);
    // Convert comma-delimited list to array for standard processing
    if (criteriaKeywordsString.length > 0) {
        if (criteriaKeywordsString.includes(',')) {
            // create an array of the values
            criteriaKeywordsArrayRaw = criteriaKeywordsString.split(",")
            // remove whitespace around the keywords
            criteriaKeywordsArrayRaw.forEach( function(keyword, ind, keywords) {
                criteriaKeywordsArrayFinal.push(keyword.trim());
            });
        } else {
            // add the single value as the only element in the array
            criteriaKeywordsArrayFinal = criteriaKeywordsString.trim();
        }
    }
    console.log(`criteriaKeywordsArrayFinal: '${criteriaKeywordsArrayFinal}'`);
    // Process the formatted keywords array
    try {
        criteriaKeywordsFormatted = await formatSearchCriteriaArray(criteriaKeywordsArrayFinal);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Sponsor Search Criteria Formatting', 'Keywords', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaKeywordsFormatted.searchCriteriaSearchFormat: ${criteriaKeywordsFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaKeywordsString.length > 0 ) {
        try {
            let logEventResult = commonFx.logEvent('Sponsor Search', 'Keywords', 0, 'Informational',
            criteriaKeywordsString, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Sponsor(s)
    //////////////////////////////////////
    try {
        criteriaSponsorFormatted = await formatSearchCriteriaArray(reqBody.filterSponsorNamesInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Sponsor Search Criteria Formatting', 'Sponsor', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaSponsorFormatted.searchCriteriaSearchFormat: ${criteriaSponsorFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaSponsorFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Sponsor Search', 'Sponsor', 0, 'Informational',
            criteriaSponsorFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    //////////////////////////////////////
    // Sponsor Type(s)
    //////////////////////////////////////
    try {
        criteriaSponsorTypeFormatted = await formatSearchCriteriaArray(reqBody.filterSponsorTypeInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Sponsor Search Criteria Formatting', 'Sponsor Type', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaSponsorTypeFormatted.searchCriteriaSearchFormat: ${criteriaSponsorTypeFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaSponsorTypeFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Sponsor Search', 'Field of Study', 0, 'Informational',
            criteriaSponsorTypeFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    ////////////////////////////////////////////////////
    // Add the search parameters, and find the resultant records
    ////////////////////////////////////////////////////
    try {
        sponsorsMatching = await SponsorsActiveView.findAndCountAll( {
            where: {
                [Op.or]: {

                    // Keywords match on two text elements
                    SponsorNameMatching: {
                        [Op.like]: {    
                            [Op.any]: criteriaKeywordsFormatted.searchCriteriaSearchFormat } },
                    SponsorDescriptionMatching: {
                        [Op.like]: {    
                            [Op.any]: criteriaKeywordsFormatted.searchCriteriaSearchFormat } },

                    SponsorID: {
                        [Op.like]: {
                            [Op.any]: criteriaSponsorFormatted.searchCriteriaSearchFormat } },

                    SponsorType: {
                        [Op.like]: {
                            [Op.any]: criteriaSponsorTypeFormatted.searchCriteriaSearchFormat } },

                }
            } 
        } );
    } catch(e) {
        console.log(e);
    };
    console.log(`Matching sponsors: ${sponsorsMatching.count}`);

    ////////////////////////////////////////////////////
    // Get the ranking for each matching sponsor
    ////////////////////////////////////////////////////
    for (let matchingSponsor of sponsorsMatching.rows) {

        // Reset matching variables for each sponsor to be processed
        matchCount = 0;
        console.log(`matchingSponsor[name]: ${matchingSponsor['SponsorName']}`);

        // Keywords
        for (const keyItem of criteriaKeywordsFormatted.searchCriteriaArray){
            matchCount += matchingSponsor['SponsorNameMatching'].indexOf(keyItem) >= 0 ? 1 : 0;
            matchCount += matchingSponsor['SponsorDescriptionMatching'].indexOf(keyItem) >= 0 ? 1 : 0;
        };

        // Sponsor
        for (const spnItem of criteriaSponsorFormatted.searchCriteriaArray){
            matchCount += matchingSponsor['SponsorID'].indexOf(spnItem) >= 0 ? 1 : 0;
        };

        // Sponsor Type
        for (const stItem of criteriaSponsorTypeFormatted.searchCriteriaArray){
            matchCount += matchingSponsor['SponsorType'].indexOf(stItem) >= 0 ? 1 : 0;
        };

        
        // Add the matching criteria count to the sponsor record
        matchingSponsor['matchCount'] = matchCount;
        console.log(`     - matched on ${matchingSponsor['matchCount']} criteria.`);
//        matchingSponsor['SponsorName'] += ' (' + matchCount + ')';

    }; // loop to the next sponsor to process
        
    //////////////////////////////////////
    // Re-sort the sponsors based on match count, then Sponsor Name
    //////////////////////////////////////
    sponsorsMatching.rows.sort( (a,b) => (
            b.matchCount - a.matchCount ||
            a.SponsorName.localeCompare(b.SponsorName)
        ));

    //////////////////////////////////////
    // Return the formatted values
    //////////////////////////////////////
    return {
        sponsorsMatching: sponsorsMatching
    };  

};


//////////////////////////////////////
// return objects
//////////////////////////////////////

module.exports = {
    formatSearchCriteriaArray,
    processScholarshipSearchCriteria,
    processSponsorSearchCriteria
};