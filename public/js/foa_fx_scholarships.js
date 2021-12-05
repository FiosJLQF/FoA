//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

//const { eventNames } = require("../../app");
//const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
//const pageSponsorVolume = 15; // number of sponsors to be displayed on a page


/////////////////////////////////////////////////////////////////////////////////////////////////
// show all scholarships
/////////////////////////////////////////////////////////////////////////////////////////////////
function showAllScholarships(scholarships) {

    // clear any previous search results
    clearScholarshipSearchResults();

    // clear any previous search criteria
    clearScholarshipSearchCriteria();

    // load all scholarships
    console.log(scholarships.count);
    buildScholarshipSearchResults(scholarships, 1, false);
}


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear/reset the Scholarship Search Criteria
/////////////////////////////////////////////////////////////////////////////////////////////////
function clearScholarshipSearchCriteria() {

    // clear all errors
    const elAgeError = document.querySelector('#filterAgeInputError');
    elAgeError.textContent = '';
    elAgeError.classList.remove('input-error');
    const elGPAError = document.querySelector('#filterGPAInputError');
    elGPAError.textContent = '';
    elGPAError.classList.remove('input-error');

    // reset all the search criteria selections
    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterFieldOfStudyIcon'),
        document.querySelector('#filterFieldOfStudyInputBlock'),
        document.querySelector('#filterFieldOfStudyInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterSponsorNamesIcon'),
        document.querySelector('#filterSponsorNamesInputBlock'),
        document.querySelector('#filterSponsorNamesInput'), 'hide');
    
    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterGenderIcon'),
        document.querySelector('#filterGenderInputBlock'),
        document.querySelector('#filterGenderInput'), 'hide');
    
    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterAgeIcon'),
        document.querySelector('#filterAgeInputBlock'),
        document.querySelector('#filterAgeInput'), 'hide');
    
    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterCitizenshipIcon'),
        document.querySelector('#filterCitizenshipInputBlock'),
        document.querySelector('#filterCitizenshipInput'), 'hide');
    
    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterYearOfNeedIcon'),
        document.querySelector('#filterYearOfNeedInputBlock'),
        document.querySelector('#filterYearOfNeedInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterKeywordsIcon'),
        document.querySelector('#filterKeywordsInputBlock'),
        document.querySelector('#filterKeywordsInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterEnrollmentStatusIcon'),
        document.querySelector('#filterEnrollmentStatusInputBlock'),
        document.querySelector('#filterEnrollmentStatusInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterGPAIcon'),
        document.querySelector('#filterGPAInputBlock'),
        document.querySelector('#filterGPAInput'), 'hide');
    
    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterUSMilitaryServiceIcon'),
        document.querySelector('#filterUSMilitaryServiceInputBlock'),
        document.querySelector('#filterUSMilitaryServiceInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterFAAPilotCertificateIcon'),
        document.querySelector('#filterFAAPilotCertificateInputBlock'),
        document.querySelector('#filterFAAPilotCertificateInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterFAAPilotRatingIcon'),
        document.querySelector('#filterFAAPilotRatingInputBlock'),
        document.querySelector('#filterFAAPilotRatingInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterFAAMechanicCertRatingIcon'),
        document.querySelector('#filterFAAMechanicCertRatingInputBlock'),
        document.querySelector('#filterFAAMechanicCertRatingInput'), 'hide');

    // hide the Advanced Search section
    toggleAdvancedSearchCriteriaInputBlock(
        document.querySelector('#advancedSearchIcon'),
        document.querySelector('#advancedSearchInputBlock'), '', 'hide')

    // reset the search results column (if any results are showing)
    clearScholarshipSearchResults();

    // scroll back to the top of the page
    window.scrollTo(0,0);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear Search Results
/////////////////////////////////////////////////////////////////////////////////////////////////
function clearScholarshipSearchResults() {

    document.querySelector('#searchResultsTitle').textContent = 'Enter criteria and click "Search"';
//    const searchResults = document.querySelector('#searchResults');
    if (document.querySelector('#searchResults') !== null) {
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(document.querySelector('#searchResults'));
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(pagination);
    };
    // const searchResults = document.querySelector('#searchResults');
    // if (searchResults !== null) {
    //     document.querySelector('#scholarshipsearchresultscolumn').removeChild(searchResults);
    //     document.querySelector('#scholarshipsearchresultscolumn').removeChild(pagination);
    // };

}

/////////////////////////////////////////////////////////////////////////////////////////////////
// find matching scholarships when the Search button is pressed
/////////////////////////////////////////////////////////////////////////////////////////////////
function findMatchingScholarships(scholarships, pageNumber) {

//alert('Starting "findMatchingScholarships"!');

    ////////////////////////////////////////////////////////
    // clear the previous search results
    ////////////////////////////////////////////////////////
    clearScholarshipSearchResults();

    ////////////////////////////////////////////////////////
    // variable declarations
    ////////////////////////////////////////////////////////
    const matchingScholarships = [];
    let matchedOn = '';  // what criteria was the matching on, in the format "Field of Study (engineering; maintenance);"
    let matchedOnTextExact = '';  // what criteria was the matching on, in the format "Field of Study (engineering; maintenance);"
    let matchedOnTextBlank = '';  // what criteria was the matching on, in the format "Field of Study (engineering; maintenance);"
    let matchResult = false;  // the final determination of whether this scholarship matches any search criteria
    let matchCount = 0;  // the number of individual search criteria a scholarship matches on
    let matchCountExact = 0;  // the number of individual search criteria a scholarship matches on
    let matchCountBlank = 0;  // the number of individual search criteria a scholarship matches on

    const fieldOfStudyList = [];  // multi-value SELECT
    let matchFieldOfStudy = false;
    let matchedOnTextFieldOfStudy = '';
    let matchedOnTextExactFieldOfStudy = '';
    let matchedOnTextBlankFieldOfStudy = '';

    const sponsorList = [];  // multi-value SELECT
    let matchSponsor = false;
    let matchedOnTextSponsor = '';
    let matchedOnTextExactSponsor = '';
    let matchedOnTextBlankSponsor = '';

    let genderList = '';  // single-value SELECT only
    let matchGender = false;
    let matchedOnTextGender = '';
    let matchedOnTextExactGender = '';
    let matchedOnTextBlankGender = '';

    let matchAge = false;  // free text
    let matchedOnAge = '';

    let citizenshipList = '';  // single-value SELECT only
    let matchCitizenship = false;
    let matchedOnCitizenship = '';

    let yearOfNeedList = '';  // single-value SELECT only
    let matchYearOfNeed = false;
    let matchedOnYearOfNeed = '';

    const keywordList = [];  // free text, comma-delimited
    let matchKeyword = false;
    let matchedOnKeyword = '';

    let enrollmentStatusList = '';  // single-value SELECT only
    let matchEnrollmentStatus = false;
    let matchedOnEnrollmentStatus = '';

    let matchGPA = false;  // free text
    let matchedOnGPA = '';

    let militaryServiceList = '';  // single-value SELECT only
    let matchMilitaryService = false;
    let matchedOnMilitaryService = '';

    const faaPilotCertList = [];  // multi-value SELECT
    let matchFAAPilotCert = false;
    let matchedOnFAAPilotCert = '';

    const faaPilotRatingList = [];  // multi-value SELECT
    let matchFAAPilotRating = false;
    let matchedOnFAAPilotRating = '';

    const faaMechanicCertRatingList = [];  // multi-value SELECT
    let matchFAAMechanicCertRating = false;
    let matchedOnFAAMechanicCertRating = '';

    // scroll to the top of the page
    window.scrollTo(0,0);

    ///////////////////////////////////////////////////////////
    // Prep: Field of Study
    ///////////////////////////////////////////////////////////
    // format the Field of Study for use in the matching logic
    let filterFieldOfStudyIDs = document.querySelector("#filterFieldOfStudyInput").selectedOptions;
    [].forEach.call(filterFieldOfStudyIDs, fieldOfStudyID => {
        if ( fieldOfStudyID.value !== "0" ) {
            fieldOfStudyList.push('|' + fieldOfStudyID.textContent.toLowerCase() + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Prep: Sponsor Names (i.e., the Sponsor IDs)
    ///////////////////////////////////////////////////////////
    // format the Sponsor IDs for use in the matching logic
    let filterSponsorIDs = document.querySelector("#filterSponsorNamesInput").selectedOptions;
    [].forEach.call(filterSponsorIDs, sponsorID => {
        if ( sponsorID.value !== "0" ) {
            sponsorList.push('|' + sponsorID.value + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Prep: Gender
    ///////////////////////////////////////////////////////////
    // format the Gender for use in the matching logic
    let filterGendersDDL = document.querySelector("#filterGenderInput");
    let filterGenders = filterGendersDDL.options[filterGendersDDL.selectedIndex].textContent;
    if ( filterGenders.toLowerCase() !== '(not selected)' ) {
        genderList = '|' + filterGenders.toLowerCase() + '|';  // no forEach needed as Gender is single-value SELECT
    };

    ///////////////////////////////////////////////////////////
    // Prep: Age
    ///////////////////////////////////////////////////////////
    // format the Age for use in the matching logic
    let filterAge = document.querySelector("#filterAgeInput").value;

    ///////////////////////////////////////////////////////////
    // Prep: Citizenship
    ///////////////////////////////////////////////////////////
    // format the Citizenship for use in the matching logic
    let filterCitizenshipsDDL = document.querySelector("#filterCitizenshipInput");
    let filterCitizenships = filterCitizenshipsDDL.options[filterCitizenshipsDDL.selectedIndex].textContent;
    if ( filterCitizenships.toLowerCase() !== '(not selected)' ) {
        citizenshipList = '|' + filterCitizenships.toLowerCase() + '|';  // no forEach needed as Gender is single-value SELECT
    };

    ///////////////////////////////////////////////////////////
    // Prep: Year of Need
    ///////////////////////////////////////////////////////////
    // format the Year Of Need for use in the matching logic
    let filterYearOfNeedDDL = document.querySelector("#filterYearOfNeedInput");
    let filterYearOfNeed = filterYearOfNeedDDL.options[filterYearOfNeedDDL.selectedIndex].textContent;
    if ( filterYearOfNeed.toLowerCase() !== '(not selected)' ) {
        yearOfNeedList = '|' + filterYearOfNeed.toLowerCase() + '|';  // no forEach needed as Year of Need is single-value SELECT
    };

    ///////////////////////////////////////////////////////////
    // Prep: Keywords
    ///////////////////////////////////////////////////////////

    // format the Keywords(s) for use in the matching logic
    let filterKeywords = document.querySelector("#filterKeywordsInput").value.trim();

    if (filterKeywords.length > 0) {
        if (filterKeywords.includes(',')) {
            // create an array of the values
            const filterKeywordsArr = filterKeywords.split(",")
            // remove whitespace around the keywords
            filterKeywordsArr.forEach( function(keyword, ind, keywords) {
                keywordList.push(keyword.trim());
            });
        } else {
            // add the single value as the only element in the array
            keywordList.push( filterKeywords.trim() );
        }
    }

    ///////////////////////////////////////////////////////////
    // Prep: Higher Ed Enrollment Status
    ///////////////////////////////////////////////////////////
    // format the Higher Ed Enrollment Status for use in the matching logic
    let filterEnrollmentStatusDDL = document.querySelector("#filterEnrollmentStatusInput");
    let filterEnrollmentStatus = filterEnrollmentStatusDDL.options[filterEnrollmentStatusDDL.selectedIndex].textContent;
    if ( filterEnrollmentStatus.toLowerCase() !== '(not selected)' ) {
        enrollmentStatusList = '|' + filterEnrollmentStatus.toLowerCase() + '|';  // no forEach needed as Enrollment Status is single-value SELECT
    };

    ///////////////////////////////////////////////////////////
    // Prep: GPA
    ///////////////////////////////////////////////////////////
    // format the GPA for use in the matching logic
    let filterGPA = document.querySelector("#filterGPAInput").value;

    ///////////////////////////////////////////////////////////
    // Prep: U.S. Military Service Type
    ///////////////////////////////////////////////////////////
    // format the U.S. Military Service Type for use in the matching logic
    let filterMilitaryServiceDDL = document.querySelector("#filterUSMilitaryServiceInput");
    let filterMilitaryService = filterMilitaryServiceDDL.options[filterMilitaryServiceDDL.selectedIndex].textContent;
    if ( filterMilitaryService.toLowerCase() !== '(not selected)' ) {
        militaryServiceList = '|' + filterMilitaryService.toLowerCase() + '|';  // no forEach needed as Military Service is single-value SELECT
    };

    ///////////////////////////////////////////////////////////
    // Prep: FAA Pilot Certificate
    ///////////////////////////////////////////////////////////
    // format the FAA Pilot Certificates for use in the matching logic
    let filterFAAPilotCerts = document.querySelector("#filterFAAPilotCertificateInput").selectedOptions;
    [].forEach.call(filterFAAPilotCerts, faaPilotCertID => {
        if ( faaPilotCertID.value !== "0" ) {
            faaPilotCertList.push('|' + faaPilotCertID.textContent.toLowerCase() + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Prep: FAA Pilot Rating
    ///////////////////////////////////////////////////////////
    // format the FAA Pilot Ratings for use in the matching logic
    let filterFAAPilotRatings = document.querySelector("#filterFAAPilotRatingInput").selectedOptions;
    [].forEach.call(filterFAAPilotRatings, faaPilotRatingID => {
        if ( faaPilotRatingID.value !== "0" ) {
            faaPilotRatingList.push('|' + faaPilotRatingID.textContent.toLowerCase() + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Prep: FAA Mechanic Certificate/Rating
    ///////////////////////////////////////////////////////////
    // format the FAA Mechanic Certificates/Ratings for use in the matching logic
    let filterFAAMechanicCertRatings = document.querySelector("#filterFAAMechanicCertRatingInput").selectedOptions;
    [].forEach.call(filterFAAMechanicCertRatings, faaMechanicCertRatingID => {
        if ( faaMechanicCertRatingID.value !== "0" ) {
            faaMechanicCertRatingList.push('|' + faaMechanicCertRatingID.textContent.toLowerCase() + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Create an array of matching scholarships
    ///////////////////////////////////////////////////////////
    for ( var i = 0; i < scholarships.length; i++ ) {

//        alert('Checking scholarship #' + i + ' of ' + scholarships.length);

        // reset the matching variables
        matchResult = false;
        matchedOn = '';
        matchedOnTextExact = '';
        matchedOnTextBlank = '';
        matchCount = 0;
        matchCountExact = 0;
        matchCountBlank = 0;

        matchFieldOfStudy = false;
        matchedOnTextFieldOfStudy = '';
        matchedOnTextExactFieldOfStudy = '';
        matchedOnTextBlankFieldOfStudy = '';

        matchSponsor = false;
        matchedOnTextSponsor = '';
        matchedOnTextExactSponsor = '';
        matchedOnTextBlankSponsor = '';

        matchGender = false;
        matchedOnTextGender = '';
        matchedOnTextExactGender = '';
        matchedOnTextBlankGender = '';

        matchAge = false;
        matchedOnAge = '';
        matchedOnTextExactAge = '';

        matchCitizenship = false;
        matchedOnCitizenship = '';
        matchedOnTextExactCitizenship = '';

        matchYearOfNeed = false;
        matchedOnYearOfNeed = '';
        matchedOnTextExactYearOfNeed = '';

        matchKeyword = false;
        matchedOnKeyword = '';
        matchedOnTextExactKeyword = '';

        matchEnrollmentStatus = false;
        matchedOnEnrollmentStatus = '';
        matchedOnTextExactEnrollmentStatus = '';

        matchGPA = false;
        matchedOnGPA = '';
        matchedOnTextExactGPA = '';

        matchMilitaryService = false;
        matchedOnMilitaryService = '';
        matchedOnTextExactMilitaryService = '';

        matchFAAPilotCert = false;
        matchedOnFAAPilotCert = '';
        matchedOnTextExactFAAPilotCert = '';

        matchFAAPilotRating = false;
        matchedOnFAAPilotRating = '';
        matchedOnTextExactFAAPilotRating = '';

        matchFAAMechanicCertRating = false;
        matchedOnFAAMechanicCertRating = '';
        matchedOnTextExactFAAMechanicCertRating = '';

        // check the Field of Study
        if ( fieldOfStudyList.length === 0 || scholarships[i]['Criteria_FieldOfStudyMatchingText'].length === 0 ) {
            matchFieldOfStudy = true;
            matchCount++;
            matchCountBlank++;
            matchedOnTextFieldOfStudy = 'Field of Study; ';
            matchedOnTextBlankFieldOfStudy = '';
        } else {
            fieldOfStudyList.forEach( function(fieldOfStudyText) {
                if ( scholarships[i]['Criteria_FieldOfStudyMatchingText'].toLowerCase().includes(fieldOfStudyText) ) {
                    matchFieldOfStudy = true;
                    matchCount++;
                    matchCountExact++;
//                    if ( matchedOnTextFieldOfStudy.length === 0 ) {
//                        matchedOnTextFieldOfStudy = 'Field of Study (';
//                        matchedOnTextExactFieldOfStudy = 'Field of Study (';
//                    };
//                    matchedOnTextFieldOfStudy += fieldOfStudyText.replaceAll('|','') + '; ';
//                    matchedOnTextExactFieldOfStudy += fieldOfStudyText.replaceAll('|','') + '; ';
                }
            });
            if ( matchFieldOfStudy ) {
//                matchedOnTextFieldOfStudy = matchedOnTextFieldOfStudy.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnTextFieldOfStudy += '); ';  // close the list of matching values
//                matchedOnTextExactFieldOfStudy = matchedOnTextExactFieldOfStudy.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnTextExactFieldOfStudy += '); ';  // close the list of matching values
                matchedOnTextExactFieldOfStudy += "Field of Study; ";
            };
        }

        // check the Sponsor IDs
        if ( sponsorList.length === 0 ) { // don't need to check that the scholarship has a Sponsor - it's required
            matchSponsor = true;
            matchCount++;
            matchCountBlank++
            matchedOnTextSponsor = 'Sponsor; ';
            matchedOnTextBlankSponsor = 'Sponsor; ';
        } else {
            sponsorList.forEach( function(sponsorID) {
                if ( scholarships[i]['SponsorIDMatching'].toLowerCase().includes(sponsorID) ) {
                    matchSponsor = true;
                    matchCount++;
                    matchCountExact++;
//                    if ( matchedOnTextSponsor.length === 0 ) {
//                        matchedOnTextSponsor = 'Sponsor (';
//                        matchedOnTextExactSponsor = 'Sponsor (';
//                    };
//                    matchedOnTextSponsor += scholarships[i]['SponsorName'] + '; ';
//                    matchedOnTextExactSponsor += scholarships[i]['SponsorName'] + '; ';
                }
            });
            if ( matchSponsor ) {
//                matchedOnTextSponsor = matchedOnTextSponsor.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnTextSponsor += '); ';  // close the list of matching values
//                matchedOnTextExactSponsor = matchedOnTextExactSponsor.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnTextExactSponsor += '); ';  // close the list of matching values
                matchedOnTextExactSponsor = 'Sponsor; ';
            };
        }

        // check the Gender
        if ( genderList.length === 0  || scholarships[i]['Criteria_GenderMatchingText'].length === 0) {
            matchGender = true;
            matchCount++;
            matchCountBlank++;
            matchedOnTextGender = 'Gender; ';
            matchedOnTextBlankGender = 'Gender; ';
        } else {
            matchGender = scholarships[i]['Criteria_GenderMatchingText'].toLowerCase().includes(genderList);
            if ( matchGender ) {
                matchCount++;
                matchCountExact++;
//                matchedOnTextGender = 'Gender (' + filterGenders + '); ';
//                matchedOnTextExactGender = 'Gender (' + filterGenders + '); ';
                matchedOnTextExactGender = 'Gender; ';
            };
        }

        // check the Age
        if ( filterAge.length === 0 || 
            ( scholarships[i]['Criteria_AgeMinimum'].length === 0 && scholarships[i]['Criteria_AgeMaximum'].length === 0 )) {
            matchAge = true;
            matchCount++;
            matchCountBlank++;
            matchedOnAge = 'Age; ';
        } else {
            if ( scholarships[i]['Criteria_AgeMaximum'].length == 0 ) {
                matchAge = (scholarships[i]['Criteria_AgeMinimum'] <= filterAge);
            } else {
                matchAge = ((filterAge >= scholarships[i]['Criteria_AgeMinimum'])
                            && (filterAge <= scholarships[i]['Criteria_AgeMaximum']));
            };
            if ( matchAge ) {
                matchCount++;
                matchCountExact++;
//                matchedOnAge = 'Age (' + filterAge + '); ';
                matchedOnTextExactAge = 'Age; ';
            };
        }

        // check the Citizenship
        if ( citizenshipList.length === 0  || scholarships[i]['Criteria_CitizenshipMatchingText'].length === 0) {
            matchCitizenship = true;
            matchCount++;
            matchCountBlank++;
            matchedOnCitizenship = 'Citizenship; ';
        } else {
            matchCitizenship = scholarships[i]['Criteria_CitizenshipMatchingText'].toLowerCase().includes(citizenshipList);
            if ( matchCitizenship ) {
                matchCount++;
                matchCountExact++;
//                matchedOnCitizenship = 'Citizenship (' + filterCitizenships + '); ';
                matchedOnTextExactCitizenship = 'Citizenship; ';
            };
        }

        // check the Year of Need
        if ( yearOfNeedList.length === 0  || scholarships[i]['Criteria_YearOfNeedMatchingText'].length === 0) {
            matchYearOfNeed = true;
            matchCount++;
            matchCountBlank++;
            matchedOnYearOfNeed = 'Year of Need; ';
        } else {
            matchYearOfNeed = scholarships[i]['Criteria_YearOfNeedMatchingText'].toLowerCase().includes(yearOfNeedList);
            if ( matchYearOfNeed ) {
                matchCount++;
                matchCountExact++;
//                matchedOnYearOfNeed = 'Year of Need (' + filterYearOfNeed + '); ';
                matchedOnTextExactYearOfNeed = 'Year of Need; ';
            };
        }

        // check the Keyword(s)
        if ( keywordList.length === 0 ) {
            matchKeyword = true;
            matchCount++;
            matchCountBlank++;
            matchedOnKeyword = 'Keywords; ';
        } else {
            keywordList.forEach( function(keyword, ind, keywords) {
                if (keyword.length > 0) {
                    matchKeyword = matchKeyword || (
                        scholarships[i]['SponsorName'].toLowerCase().includes(keyword.toLowerCase())
                        || scholarships[i]['ScholarshipName'].toLowerCase().includes(keyword.toLowerCase())
                        || scholarships[i]['ScholarshipDescription'].toLowerCase().includes(keyword.toLowerCase())
                        || scholarships[i]['ScholarshipEligibilityReqs'].toLowerCase().includes(keyword.toLowerCase())
                    );
                    if ( matchKeyword ) {
                        matchCount++;
                        matchCountExact++;
//                        if ( matchedOnKeyword.length === 0 ) {
//                            matchedOnKeyword = 'Keywords (';
//                        };
//                        matchedOnKeyword += keyword + '; ';
                    };
                };
            });
            if ( matchKeyword ) {
//                matchedOnKeyword = matchedOnKeyword.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnKeyword += '); ';  // close the list of matching values
                matchedOnTextExactKeyword = 'Keyword; ';
            };  
        }

        // check the Enrollment Status
        if ( enrollmentStatusList.length === 0  || scholarships[i]['Criteria_EnrollmentStatusMatchingText'].length === 0) {
            matchEnrollmentStatus = true;
            matchCount++;
            matchCountBlank++;
            matchedOnEnrollmentStatus = 'Enrollment Status; ';
        } else {
            matchEnrollmentStatus = scholarships[i]['Criteria_EnrollmentStatusMatchingText'].toLowerCase().includes(enrollmentStatusList);
            if ( matchEnrollmentStatus ) {
                matchCount++;
                matchCountExact++;
//                matchedOnEnrollmentStatus = 'Enrollment Status (' + filterEnrollmentStatus + '); ';
                matchedOnTextExactEnrollmentStatus = 'Enrollment Status; ';
            };
        }

        // check the GPA
        if ( filterGPA.length === 0 || 
            ( scholarships[i]['Criteria_GPAMinimum'].length === 0 && scholarships[i]['Criteria_GPAMaximum'].length === 0 )) {
            matchGPA = true;
            matchCount++;
            matchCountBlank++;
            matchedOnGPA = 'GPA; ';
        } else {
            matchGPA = (filterGPA >= scholarships[i]['Criteria_GPAMinimum']);
            if ( matchGPA ) {
                matchCount++;
                matchCountExact++;
//                matchedOnGPA = 'GPA (' + filterGPA + '); ';
                matchedOnTextExactGPA = 'GPA; ';
            };
        }

        // check the Military Service
        if ( militaryServiceList.length === 0  || scholarships[i]['Criteria_MilitaryServiceMatchingText'].length === 0) {
            matchMilitaryService = true;
            matchCount++;
            matchCountBlank++;
            matchedOnMilitaryService = 'Military Service; ';
        } else {
            matchMilitaryService = scholarships[i]['Criteria_MilitaryServiceMatchingText'].toLowerCase().includes(militaryServiceList);
            if ( matchMilitaryService ) {
                matchCount++;
                matchCountExact++;
//                matchedOnMilitaryService = 'Military Service (' + filterMilitaryService + '); ';
                matchedOnTextExactMilitaryService = 'Military Service; ';
            };
        }

        // check the FAA Pilot Certificate
        if ( faaPilotCertList.length === 0 || scholarships[i]['Criteria_FAAPilotCertificateMatchingText'].length === 0 ) {
            matchFAAPilotCert = true;
            matchCount++;
            matchCountBlank++;
            matchedOnFAAPilotCert = 'FAA Pilot Certificate; ';
        } else {
            faaPilotCertList.forEach( function(faaPilotCertText) {
                if ( scholarships[i]['Criteria_FAAPilotCertificateMatchingText'].toLowerCase().includes(faaPilotCertText) ) {
                    matchFAAPilotCert = true;
                    matchCount++;
                    matchCountExact++;
//                    if ( matchedOnFAAPilotCert.length === 0 ) {
//                        matchedOnFAAPilotCert = 'FAA Pilot Certificate (';
//                    };
//                    matchedOnFAAPilotCert += faaPilotCertText.replaceAll('|','') + '; ';
                }
            });
            if ( matchFAAPilotCert ) {
//                matchedOnFAAPilotCert = matchedOnFAAPilotCert.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnFAAPilotCert += '); ';  // close the list of matching values
                matchedOnTextExactFAAPilotCert = 'FAA Pilot Airman Certificate; ';
            };
        }

        // check the FAA Pilot Rating
        if ( faaPilotRatingList.length === 0 || scholarships[i]['Criteria_FAAPilotRatingMatchingText'].length === 0 ) {
            matchFAAPilotRating = true;
            matchCount++;
            matchCountBlank++;
            matchedOnFAAPilotRating = 'FAA Pilot Rating; ';
        } else {
// alert(scholarships[i]['Criteria_FAAPilotRatingMatchingText'].toLowerCase());
            faaPilotRatingList.forEach( function(faaPilotRatingText) {
// alert(faaPilotRatingText);
                if ( scholarships[i]['Criteria_FAAPilotRatingMatchingText'].toLowerCase().includes(faaPilotRatingText) ) {
                    matchFAAPilotRating = true;
                    matchCount++;
                    matchCountExact++;
//                    if ( matchedOnFAAPilotRating.length === 0 ) {
//                        matchedOnFAAPilotRating = 'FAA Pilot Rating (';
//                    };
//                    matchedOnFAAPilotRating += faaPilotRatingText.replaceAll('|','') + '; ';
                }
            });
            if ( matchFAAPilotRating ) {
//                matchedOnFAAPilotRating = matchedOnFAAPilotRating.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnFAAPilotRating += '); ';  // close the list of matching values
                matchedOnTextExactFAAPilotRating = 'FAA Pilot Rating; ';
            };
        }

        // check the FAA Mechanic Certificate/Rating
        if ( faaMechanicCertRatingList.length === 0 || scholarships[i]['Criteria_FAAMechanicCertificateMatchingText'].length === 0 ) {
            matchFAAMechanicCertRating = true;
            matchCount++;
            matchCountBlank++;
            matchedOnFAAMechanicCertRating = 'FAA Mechanic Certificate/Rating; ';
        } else {
            faaMechanicCertRatingList.forEach( function(faaMechanicCertRatingText) {
                if ( scholarships[i]['Criteria_FAAMechanicCertificateMatchingText'].toLowerCase().includes(faaMechanicCertRatingText) ) {
                    matchFAAMechanicCertRating = true;
                    matchCount++;
                    matchCountExact++;
//                    if ( matchedOnFAAMechanicCertRating.length === 0 ) {
//                        matchedOnFAAMechanicCertRating = 'FAA Mechanic Certificate/Rating (';
//                    };
//                    matchedOnFAAMechanicCertRating += faaMechanicCertRatingText.replaceAll('|','') + '; ';
                }
            });
            if ( matchFAAMechanicCertRating ) {
//                matchedOnFAAMechanicCertRating = matchedOnFAAMechanicCertRating.slice(0, -2);  // remove the trailing "; " characters
//                matchedOnFAAMechanicCertRating += '); ';  // close the list of matching values
                matchedOnTextExactFAAMechanicCertRating = 'FAA Mechanic Certificate/Rating; ';
            };
        }

        ///////////////////////////////////////////////////////////
        // Does this scholarship match ANY of the search criteria?
        // Note that "AND" logic is used as blank Search Criteria is set to "True" for matching purposes.
        ///////////////////////////////////////////////////////////
        matchedOn = matchedOnTextFieldOfStudy + matchedOnTextSponsor + matchedOnTextGender + matchedOnAge + matchedOnCitizenship +
                    matchedOnYearOfNeed + matchedOnKeyword + matchedOnEnrollmentStatus + matchedOnGPA +
                    matchedOnMilitaryService + matchedOnFAAPilotCert + matchedOnFAAPilotRating + matchedOnFAAMechanicCertRating;
        if ( matchedOn.substring(0, 2) === '; ' ) { matchedOn = matchedOn.slice(2); };
        matchedOnTextExact = matchedOnTextExactFieldOfStudy + matchedOnTextExactSponsor + matchedOnTextExactGender + matchedOnTextExactAge +
                             matchedOnTextExactCitizenship + matchedOnTextExactYearOfNeed + matchedOnTextExactKeyword +
                             matchedOnTextExactEnrollmentStatus + matchedOnTextExactGPA + matchedOnTextExactMilitaryService + 
                             matchedOnTextExactFAAPilotCert + matchedOnTextExactFAAPilotRating + matchedOnTextExactFAAMechanicCertRating;
        if ( matchedOnTextExact.substring(0, 2) === '; ' ) { matchedOnTextExact = matchedOnTextExact.slice(2); };
//        matchedOnTextBlank = matchedOnTextBlankFieldOfStudy + matchedOnTextBlankSponsor + matchedOnTextBlankGender;
//        if ( matchedOnTextBlank.substring(0, 2) === '; ' ) { matchedOnTextBlank = matchedOnTextBlank.slice(2); };
        matchResult = (matchFieldOfStudy && matchSponsor && matchGender && matchAge && matchCitizenship &&
                       matchYearOfNeed && matchKeyword && matchEnrollmentStatus && matchGPA && matchMilitaryService &&
                       matchFAAPilotCert && matchFAAPilotRating && matchFAAMechanicCertRating);
         if ( matchResult ) {
            scholarships[i]['matchedOn'] = matchedOn;
            scholarships[i]['matchedOnTextExact'] = matchedOnTextExact;
//            scholarships[i]['matchedOnTextBlank'] = matchedOnTextBlank;
            scholarships[i]['matchCount'] = matchCount;
            scholarships[i]['matchCountExact'] = matchCountExact;
//            scholarships[i]['matchCountBlank'] = matchCountBlank;
//            scholarships[i]['sponsorsCriteriaCount'] = sponsorList.length;
            matchingScholarships.push(scholarships[i]);
        }

    } // end scholarships "for" loop

    ///////////////////////////////////////////////////////////
    // if matches found, build the search results; otherwise, show a message
    ///////////////////////////////////////////////////////////
    if (matchingScholarships.length === 0) {
        if (sponsorList.length != 0) {
            document.querySelector('#searchResultsTitle').textContent = 'No active scholarships found for the selected Sponsor. Try changing the search criteria for better results.';
        } else {
            document.querySelector('#searchResultsTitle').textContent = 'No results found. Try changing the search criteria for better results.';
        }
        const searchResults = document.querySelector('#searchResults');
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(searchResults);
    } else {
        // sort the matching scholarships, first by number of exact mataches (most matches first), second by Sponsor Name
        console.log('Before sorting results.');
        matchingScholarships.sort( (a,b) => (
            b.matchCountExact - a.matchCountExact ||
            a.SponsorName.localeCompare(b.SponsorName)
        ));
        console.log('After sorting results.');
        // build "scholarship search results"
        const createResults = buildScholarshipSearchResults(matchingScholarships, pageNumber, true);
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////
// build the scholarship search results divs
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildScholarshipSearchResults(matchingScholarships, pageNumber, showMatchingCriteria) {

//alert(`Total Scholarship Volume: ${matchingScholarships.length}`);

    // clear any previous search results
    clearScholarshipSearchResults();
    if ( showMatchingCriteria == true ) {
        document.querySelector('#searchResultsTitle').textContent = 'Search Results:';
    } else {
        document.querySelector('#searchResultsTitle').textContent = 'Showing All Scholarships';
    }

    // if a specific page number is displayed, extract just the scholarships to be built
    const selectedScholarships = matchingScholarships.slice(
        (pageNumber-1) * pageScholarshipVolume,
        pageNumber * pageScholarshipVolume);

    // for each selected scholarship, build the initial display with the details hidden
    const divSearchResultsColumn = document.querySelector('#scholarshipsearchresultscolumn');
    const divSearchResultsDivs = document.createElement('div');
    divSearchResultsDivs.id = 'searchResults';

    for (let selectedScholarship of selectedScholarships) {

        // build and add the first row (scholarship summary information)
        const divScholarshipRow1 = document.createElement('div');
        divScholarshipRow1.classList.add('row');
        divScholarshipRow1.classList.add('scholarshipSearchResultsSummaryRow');

            // build and add the first column to the first row
            const divScholarshipRow1Col1 = document.createElement('div');
            divScholarshipRow1Col1.classList.add('scholarshipsearchresultscol1');

            const imgSponsorLogo = document.createElement('img');
            imgSponsorLogo.src = selectedScholarship['SponsorLogo'];
            imgSponsorLogo.classList.add('sponsorLogo');

            divScholarshipRow1Col1.appendChild(imgSponsorLogo);

            // Add "Female Applicants Only" marker
            if (selectedScholarship['Criteria_Gender_FemaleOnly'].length > 0) {
                const spnFemaleApplicantsOnly = document.createElement('span');
                spnFemaleApplicantsOnly.classList.add('femaleapplicantsonly');
                spnFemaleApplicantsOnly.textContent = selectedScholarship['Criteria_Gender_FemaleOnly'];
                divScholarshipRow1Col1.appendChild(spnFemaleApplicantsOnly);
            };

            // change all appendChild to append??
            divScholarshipRow1.appendChild(divScholarshipRow1Col1);

            // build and add the second column to the first row
            const divScholarshipRow1Col2 = document.createElement('div');
            divScholarshipRow1Col2.classList.add('scholarshipsearchresultscol2');

            const iconExpand = document.createElement('i');
            iconExpand.id = "iconExpand_" + selectedScholarship['ScholarshipID'];
            iconExpand.classList.add('fas');
            iconExpand.classList.add('fa-chevron-down');
            iconExpand.addEventListener('click', function() {
                toggleShowScholarshipDetails(iconExpand.id, 
                    "scholarshipDetails_" + selectedScholarship['ScholarshipID']);
            });

            divScholarshipRow1Col2.appendChild(iconExpand);
            divScholarshipRow1.appendChild(divScholarshipRow1Col2);

            // build and add the third column to the first row
            const divScholarshipRow1Col3 = document.createElement('div');
            divScholarshipRow1Col3.classList.add('scholarshipsearchresultscol3');
            divScholarshipRow1Col3.classList.add('container');
            const divScholarshipRow1Col3Rows = document.createElement('div');
            divScholarshipRow1Col3Rows.classList.add('row');

                // Sponsor Name
                const divScholarshipRow1Col3Row1Col1 = document.createElement('div');
                divScholarshipRow1Col3Row1Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow1Col3Row1Col1.textContent = 'Sponsor:';

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row1Col1);

                const divScholarshipRow1Col3Row1Col2 = document.createElement('div');
                divScholarshipRow1Col3Row1Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow1Col3Row1Col2.textContent = selectedScholarship['SponsorName'];

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row1Col2);

                // Scholarship Name
                const divScholarshipRow1Col3Row2Col1 = document.createElement('div');
                divScholarshipRow1Col3Row2Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow1Col3Row2Col1.textContent = 'Scholarship:';

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row2Col1);

                const divScholarshipRow1Col3Row2Col2 = document.createElement('div');
                divScholarshipRow1Col3Row2Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow1Col3Row2Col2.textContent = selectedScholarship['ScholarshipName'];

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row2Col2);

                // Scholarship Type (Field of Study)
                const divScholarshipRow1Col3Row3Col1 = document.createElement('div');
                divScholarshipRow1Col3Row3Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow1Col3Row3Col1.textContent = 'Scholarship Type:';

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row3Col1);

                const divScholarshipRow1Col3Row3Col2 = document.createElement('div');
                divScholarshipRow1Col3Row3Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow1Col3Row3Col2.textContent = selectedScholarship['Criteria_FieldOfStudyText'];

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row3Col2);

                // Scholarship Description
                const divScholarshipRow1Col3Row4Col1 = document.createElement('div');
                divScholarshipRow1Col3Row4Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow1Col3Row4Col1.textContent = 'Description:';

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row4Col1);

                const divScholarshipRow1Col3Row4Col2 = document.createElement('div');
                divScholarshipRow1Col3Row4Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow1Col3Row4Col2.classList.add('text-block');

//                divScholarshipRow1Col3Row4Col2.id = 'divscholarshipdesc_' + selectedScholarship['ScholarshipID'];
//                divScholarshipRow1Col3Row4Col2.classList.add('description-short');
//                divScholarshipRow1Col3Row4Col2.textContent = selectedScholarship['ScholarshipDescription'];

                const spanScholarshipDescription = document.createElement('span');
                spanScholarshipDescription.id = 'pscholarshipdesc_' + selectedScholarship['ScholarshipID'];
                spanScholarshipDescription.classList.add('description-short');
//                spanScholarshipDescription.textContent = selectedScholarship['ScholarshipDescription'];
                spanScholarshipDescription.innerHTML = selectedScholarship['ScholarshipDescription'];

                divScholarshipRow1Col3Row4Col2.appendChild(spanScholarshipDescription);

                    const iconDescExpand = document.createElement('i');
                    iconDescExpand.id = "iconDescExpand_" + selectedScholarship['ScholarshipID'];
                    iconDescExpand.classList.add('fas');
                    iconDescExpand.classList.add('fa-chevron-down');
                    iconDescExpand.addEventListener('click', function() {
                        toggleShowScholarshipDescDetails(iconDescExpand.id, spanScholarshipDescription.id);
                    });

                divScholarshipRow1Col3Row4Col2.appendChild(iconDescExpand);

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row4Col2);

                // Award Amount / Quantity
                const divScholarshipRow1Col3Row5Col1 = document.createElement('div');
                divScholarshipRow1Col3Row5Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow1Col3Row5Col1.textContent = 'Award:';

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row5Col1);

                const divScholarshipRow1Col3Row5Col2 = document.createElement('div');
                divScholarshipRow1Col3Row5Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow1Col3Row5Col2.textContent = selectedScholarship['ScholarshipAward'];

            divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row5Col2);

        divScholarshipRow1Col3.appendChild(divScholarshipRow1Col3Rows);

        divScholarshipRow1.appendChild(divScholarshipRow1Col3);

//alert('Row1Col3 addeded to div.');

        // add the first row to the search results div
        divSearchResultsDivs.appendChild(divScholarshipRow1);

        // build and add the second row (scholarship detail information)
        const divScholarshipRow2 = document.createElement('div');
        divScholarshipRow2.id = "scholarshipDetails_" + selectedScholarship['ScholarshipID'];
//        divScholarshipRow2.classList.add("container");
        divScholarshipRow2.classList.add('row');
        divScholarshipRow2.classList.add('scholarshipSearchResultsDetailsRow');
        
            // build and add the first column to the second row
            const divScholarshipRow2Col1 = document.createElement('div');
            divScholarshipRow2Col1.classList.add('scholarshipsearchresultscol1');
            divScholarshipRow2Col1.classList.add('apply');
//            divScholarshipRow2Col1.style.display = "inline";
        
//                const chkIAgreeToReqs = document.createElement('input');
//                chkIAgreeToReqs.setAttribute("type","checkbox");
//                chkIAgreeToReqs.id = "chkIAgreeToReqs_" + selectedScholarship.scholarshipID; 
//                chkIAgreeToReqs.addEventListener('click', function() {
//                    toggleApplyButton(chkIAgreeToReqs.checked, 
//                                      "lnkApply_" + selectedScholarship.scholarshipID,
//                                      selectedScholarship.scholarshipLink)
//                });
//
//            divScholarshipRow2Col1.appendChild(chkIAgreeToReqs);
//
//                const lblIAgreeToReqs = document.createElement('label');
//                lblIAgreeToReqs.setAttribute('for', 'chkIAgreeToReqs');
//                lblIAgreeToReqs.innerText = "I have read and understand the Eligibility Requirements.";
//
//            divScholarshipRow2Col1.appendChild(lblIAgreeToReqs);

                const lnkApply = document.createElement('a');
                lnkApply.id = "lnkApply_" + selectedScholarship['ScholarshipID'];
//                lnkApply.href = "javascript:void(0)";  // initially disabled
                lnkApply.href = selectedScholarship['ScholarshipLink'];
                lnkApply.target = "_blank";
//                lnkApply.classList.add('button-disabled');

                const imgApply = document.createElement('img');
                imgApply.src = "../img/imgApplyButton.png";
                imgApply.classList.add('button-apply');

                lnkApply.appendChild(imgApply);
                divScholarshipRow2Col1.appendChild(lnkApply);

        divScholarshipRow2.appendChild(divScholarshipRow2Col1);
        
            // build and add the second column to the second row (empty)
            const divScholarshipRow2Col2 = document.createElement('div');
            divScholarshipRow2Col2.classList.add('scholarshipsearchresultscol2');
//            divScholarshipRow2Col2.style.display = "inline-block";

        divScholarshipRow2.appendChild(divScholarshipRow2Col2);
        
            // build and add the third column to the second row
            const divScholarshipRow2Col3 = document.createElement('div');
            divScholarshipRow2Col3.classList.add('scholarshipsearchresultscol3');
            divScholarshipRow2Col3.classList.add('container');
//            divScholarshipRow2Col3.style.display = "inline-block";
            const divScholarshipRow2Col3Rows = document.createElement('div');
            divScholarshipRow2Col3Rows.classList.add('row');

                // Eligibility Requirements
                const divScholarshipRow2Col3Row1Col1 = document.createElement('div');
                divScholarshipRow2Col3Row1Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow2Col3Row1Col1.classList.add('text-block');
                divScholarshipRow2Col3Row1Col1.textContent = 'Eligibility Requirements:';

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row1Col1);

                const divScholarshipRow2Col3Row1Col2 = document.createElement('div');
                divScholarshipRow2Col3Row1Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow2Col3Row1Col2.classList.add('text-block');
                divScholarshipRow2Col3Row1Col2.innerHTML = selectedScholarship['ScholarshipEligibilityReqs'];

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row1Col2);

                // Application Dates
                const divScholarshipRow2Col3Row2Col1 = document.createElement('div');
                divScholarshipRow2Col3Row2Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow2Col3Row2Col1.textContent = 'Application Dates:';

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row2Col1);

                const divScholarshipRow2Col3Row2Col2 = document.createElement('div');
                divScholarshipRow2Col3Row2Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow2Col3Row2Col2.textContent = selectedScholarship['ScholarshipApplDatesText'];

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row2Col2);

                // Contact Info
                const divScholarshipRow2Col3Row3Col1 = document.createElement('div');
                divScholarshipRow2Col3Row3Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow2Col3Row3Col1.textContent = 'Contact Info:';

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row3Col1);

                const divScholarshipRow2Col3Row3Col2 = document.createElement('div');
                divScholarshipRow2Col3Row3Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow2Col3Row3Col2.classList.add('text-block');
                divScholarshipRow2Col3Row3Col2.innerHTML = selectedScholarship['ScholarshipContactInfoFormatted'];

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row3Col2);

            // only show matching criteria if requested by the calling script
            if (showMatchingCriteria) {

                    // Matching Search Criteria (Exact)
                    const divScholarshipRow2Col3Row4Col1 = document.createElement('div');
                    divScholarshipRow2Col3Row4Col1.classList.add('scholarshipsearchresultscol3A');
                    divScholarshipRow2Col3Row4Col1.innerText = 'Criteria Match:';

                divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row4Col1);

                    const divScholarshipRow2Col3Row4Col2 = document.createElement('div');
                    divScholarshipRow2Col3Row4Col2.classList.add('scholarshipsearchresultscol3B');
                    divScholarshipRow2Col3Row4Col2.classList.add('text-block');
//                    divScholarshipRow2Col3Row4Col2.innerHTML =  selectedScholarship['matchCountExact'] + ' Criteria: ' + selectedScholarship['matchedOnTextExact'];
                    if ( selectedScholarship['matchCountExact'] === 0 ) {
                        divScholarshipRow2Col3Row4Col2.innerHTML = 'No exact criteria was selected.';
                    } else {
                        divScholarshipRow2Col3Row4Col2.innerHTML =  selectedScholarship['matchCountExact'] + ' Criteria: ' + selectedScholarship['matchedOnTextExact'];
                    }

                divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row4Col2);

//                    // Matching Search Criteria (No Preference)
//                    const divScholarshipRow2Col3Row5Col1 = document.createElement('div');
//                    divScholarshipRow2Col3Row5Col1.classList.add('scholarshipsearchresultscol3A');
//                    divScholarshipRow2Col3Row5Col1.innerHTML = 'Matched On<br>&nbsp;&nbsp;&nbsp;(No Preference):';
//
//                divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row5Col1);
//
//                    const divScholarshipRow2Col3Row5Col2 = document.createElement('div');
//                    divScholarshipRow2Col3Row5Col2.classList.add('scholarshipsearchresultscol3B');
//                    divScholarshipRow2Col3Row5Col2.classList.add('text-block');
//                    divScholarshipRow2Col3Row5Col2.innerHTML =  selectedScholarship['matchCountBlank'] + ' Criteria: ' + selectedScholarship['matchedOnTextBlank'];
//
//                divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row5Col2);

            };

            divScholarshipRow2Col3.appendChild(divScholarshipRow2Col3Rows);

        divScholarshipRow2.appendChild(divScholarshipRow2Col3);
        divScholarshipRow2.style.display = "none"; // initially hidden

        // add the first row to the search results div
        divSearchResultsDivs.appendChild(divScholarshipRow2);
    
        // add the scholarship break line to the search results div
        const hrScholarshipBreak = document.createElement('hr');
        hrScholarshipBreak.classList.add('searchresults-subblock-break-hr');
        divSearchResultsDivs.appendChild(hrScholarshipBreak);

        // add all scholarship search results divs to the body
        divSearchResultsColumn.appendChild(divSearchResultsDivs);

        ///////////////////////////////////////////////////////////////////////////////
        // post-render scripts
        ///////////////////////////////////////////////////////////////////////////////

        // if the "Scholarship Description" does not overflow, hide the "show/hide" chevron
        if ( spanScholarshipDescription.clientHeight >= spanScholarshipDescription.scrollHeight ) {
            iconDescExpand.style.display = 'none';
        };

    };  // loop to the next Scholarship in the array

    // add the page navigator bar after the results are built
    const buildPageNavResult = buildScholarshipPageNavigator(matchingScholarships, pageNumber, showMatchingCriteria);

    // scroll back to the top of the page
    window.scrollTo(0,0);

};


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the pagination div
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildScholarshipPageNavigator(matchingScholarships, pageNumberSelected, showMatchingCriteria) {

//    let pageNumberToLoad = 0;
    const numberOfPages = Math.ceil(matchingScholarships.length / pageScholarshipVolume);

    // find the "parent" div to which to add the pagination controls
    const divSearchResultsColumn = document.querySelector('#scholarshipsearchresultscolumn');
    const divPaginationNavBar = document.createElement('div');
    divPaginationNavBar.id = 'pagination';
    divPaginationNavBar.classList.add('paginationnavbar');

    // page label
    const spanPageLabel = document.createElement('span');
    spanPageLabel.textContent = 'Page:';
    divPaginationNavBar.append(spanPageLabel);

    // create links for each page
    for (i = 1; i <= numberOfPages; i++) {

        let pageNumberToLoad = i;
        const lnkPageNumber = document.createElement('a');
        lnkPageNumber.id = "lnkPageNumber_" + i;
        lnkPageNumber.href = "javascript:void(0)";  // initially disabled
        lnkPageNumber.classList.add('paginationItem');

        const spanPageNumber = document.createElement('span');
        spanPageNumber.textContent = i;
        spanPageNumber.classList.add('paginationItem');
        if (i === pageNumberSelected) {
            spanPageNumber.classList.add('paginationItemSelected');
        };
        spanPageNumber.addEventListener('click', function() {
//            clearScholarshipSearchCriteria();
            clearScholarshipSearchResults();
            buildScholarshipSearchResults(matchingScholarships, pageNumberToLoad, showMatchingCriteria);
        });

        lnkPageNumber.append(spanPageNumber);
        divPaginationNavBar.append(lnkPageNumber);
        divPaginationNavBar.append(spanPageNumber);

    };

    // add all scholarship search results divs to the body
    divSearchResultsColumn.append(divPaginationNavBar);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear/reset the Sponsor/College Search Criteria
/////////////////////////////////////////////////////////////////////////////////////////////////
/*
function clearSponsorCollegeSearchCritera() {

    document.getElementById("filter_keyword").value = "";
    document.getElementById("filter_sponsor").value = 0;
    document.getElementById("filter_college").value = 0;
    document.getElementById("filter_sponsortype").value = 0;

    // scroll back to the top of the page
    window.scrollTo(0,0);
    
}
*/


/////////////////////////////////////////////////////////////////////////////////////////////////
// when a user clicks on the "expand/collapse" button for a scholarship, show/hide the details
/////////////////////////////////////////////////////////////////////////////////////////////////
function toggleShowScholarshipDetails(buttonID, detailsID) {

    const enableButton = document.querySelector("#" + buttonID);
    const divDetails = document.querySelector("#" + detailsID);

//    alert('div.display: ' + divDetails.style.display);

    // if the current display is hidden, then show
    if ( divDetails.style.display !== "flex") {
        divDetails.style.display = "flex";
        enableButton.classList.remove("fa-chevron-down");
        enableButton.classList.add("fa-chevron-up");
    } else {
        divDetails.style.display = "none";
        enableButton.classList.remove("fa-chevron-up");
        enableButton.classList.add("fa-chevron-down");
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// when a user clicks on the "expand/collapse" button for a scholarship description, show/hide the expanded view
/////////////////////////////////////////////////////////////////////////////////////////////////
function toggleShowScholarshipDescDetails(buttonID, detailsID) {

    const enableButton = document.querySelector("#" + buttonID);
    const divDescription = document.querySelector("#" + detailsID);

    // if the current description is collapsed, then expand it
    if ( divDescription.classList.contains('description-long') ) {
//        alert('divDescription is expanded');
        divDescription.classList.remove('description-long');
        divDescription.classList.add('description-short');
        enableButton.classList.add("fa-chevron-down");
        enableButton.classList.remove("fa-chevron-up");
    } else {  // if the current description is expanded, then collapse it
//        alert('divDescription is collapsed');
        divDescription.classList.add('description-long');
        divDescription.classList.remove('description-short');
        enableButton.classList.add("fa-chevron-up");
        enableButton.classList.remove("fa-chevron-down");
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// when a user clicks on "I agreed and understand...", enable the Apply button
/////////////////////////////////////////////////////////////////////////////////////////////////
/*
function toggleApplyButton(checkStatus, linkID, linkHref) {

    let lnkToChange = document.querySelector("#" + linkID);
//    alert('Link (' + lnkToChange.id + ') has been selected!');

    if (checkStatus) {
        lnkToChange.classList.remove("button-disabled");
        lnkToChange.classList.add("button-enabled");
        lnkToChange.href = linkHref;
        lnkToChange.target = "_blank";
    } else {
        lnkToChange.classList.add("button-disabled");
        lnkToChange.classList.remove("button-enabled");
        lnkToChange.href = "javascript:void(0)";
        lnkToChange.target = "";
    }
}
*/


/////////////////////////////////////////////////////////////////////////////////////////////////
// load the list of Sponsors into the Search Criteria option
/////////////////////////////////////////////////////////////////////////////////////////////////
/*
function loadSponsorList(sponsors) {

    // get a reference to the SELECT element
    const selSponsorList = document.querySelector("#filterSponsorNamesInput");

    // create and add the "(Not Selected)" default option
    const optSponsorNotSelected = document.createElement("option");
    optSponsorNotSelected.textContent = "(Not Selected)";
    optSponsorNotSelected.value = 0;
    optSponsorNotSelected.selected = true;
    selSponsorList.appendChild(optSponsorNotSelected);

    // add options for each of the Sponsors in the current data file
    sponsors.forEach( function(sponsor, ind) {
        const optSponsor = document.createElement("option");
        optSponsor.textContent = sponsor.sponsorName;
        optSponsor.value = sponsor.sponsorID;
        selSponsorList.appendChild(optSponsor);
    });

}
*/


 //////////////////////////////////////////////////////////////////////////////////////////
// process Search Criteria submission
//////////////////////////////////////////////////////////////////////////////////////////
function searchScholarships(scholarships) {

    // clear any previous search results
    clearScholarshipSearchResults();

    // validate the input values
    const dataAreValidated = validateScholarshipSearchCriteria();
    if ( dataAreValidated ) {
        // validation passed => find and display scholarships
        findMatchingScholarships(scholarships, 1);
    };

}

//////////////////////////////////////////////////////////////////////////////////////////
// validate Search Criteria
//////////////////////////////////////////////////////////////////////////////////////////
function validateScholarshipSearchCriteria() {

    let errorCount = 0;

    // Age
    const elAge = document.querySelector('#filterAgeInput');
    const elAgeError = document.querySelector('#filterAgeInputError');
    if ( elAge.value.length == 0 ) {
        elAgeError.textContent = '';
        elAgeError.classList.remove('input-error');
    } else if ( validator.isInt(elAge.value, { min: 16, max: 99}) ) {
        elAgeError.textContent = '';
        elAgeError.classList.remove('input-error');
    } else {
        errorCount++;
        elAgeError.textContent = 'Age must be between 16 and 99';
        elAgeError.classList.add('input-error');
    }

    // GPA
    const elGPA = document.querySelector('#filterGPAInput');
    const elGPAError = document.querySelector('#filterGPAInputError');
    if ( elGPA.value.length == 0 ) {
        elGPAError.textContent = '';
        elGPAError.classList.remove('input-error');
    } else if ( validator.isFloat(elGPA.value, { min: 0, max: 4}) ) {
        elGPAError.textContent = '';
        elGPAError.classList.remove('input-error');
    } else {
        errorCount++;
        elGPAError.textContent = 'GPA must be between 0.00 and 4.00';
        elGPAError.classList.add('input-error');
    }

    //    alert('Error Count: ' + errorCount);
    
    if ( errorCount == 0 ) {
        return true;
    } else {
        return false;
    }

}
