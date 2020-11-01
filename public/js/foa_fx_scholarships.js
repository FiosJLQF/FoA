
/////////////////////////////////////////////////////////////////////////////////////////////////
// clear/reset the Scholarship Search Criteria

const { response } = require("express");

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
    toggleSearchCriteriaInputBlock(
        document.querySelector('#advancedSearchIcon'),
        document.querySelector('#advancedSearchInputBlock'), '', 'hide')

    // reset the search results column (if any results are showing)
    clearScholarshipSearchResults();
//    document.querySelector('#searchResultsTitle').textContent = 'Enter criteria and click "Search"';
//    const searchResults = document.querySelector('#searchResults');
//    if (searchResults !== null) {
//        document.querySelector('#scholarshipsearchresultscolumn').removeChild(searchResults);
//        document.querySelector('#scholarshipsearchresultscolumn').removeChild(pagination);
//    }

    // scroll back to the top of the page
    window.scrollTo(0,0);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear Search Results
/////////////////////////////////////////////////////////////////////////////////////////////////
function clearScholarshipSearchResults() {

    document.querySelector('#searchResultsTitle').textContent = 'Enter criteria and click "Search"';
    const searchResults = document.querySelector('#searchResults');
    if (searchResults !== null) {
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(searchResults);
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(pagination);
    };

}

/////////////////////////////////////////////////////////////////////////////////////////////////
// find matching scholarships when the Search button is pressed
/////////////////////////////////////////////////////////////////////////////////////////////////
function findMatchingScholarships(scholarships, pageNumber) {

//alert('Starting "findMatchingScholarships"!');

    ////////////////////////////////////////////////////////
    // clear the previous search results
    ////////////////////////////////////////////////////////
    const searchResults = document.querySelector('#searchResults');
    if (searchResults !== null) {
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(searchResults);
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(pagination);
    }

    ////////////////////////////////////////////////////////
    // variable declarations
    ////////////////////////////////////////////////////////
    const matchingScholarships = [];
    let matchedOn = '';  // what criteria was the matching on, in the format "Field of Study (engineering; maintenance);"
    let matchResult = false;  // the final determination of whether this scholarship matches any search criteria
    let matchCount = 0;  // the number of individual search criteria a scholarship matches on

    const fieldOfStudyList = [];
    let matchFieldOfStudy = false;
    let matchedOnFieldOfStudy = '';

    const sponsorList = [];
    let matchSponsor = false;
    let matchedOnSponsor = '';

    let genderList = '';  // single-value SELECT only
    let matchGender = false;
    let matchedOnGender = '';

    let matchAge = false;  // free text
    let matchedOnAge = '';

    let citizenshipList = '';  // single-value SELECT only
    let matchCitizenship = false;
    let matchedOnCitizenship = '';

    let yearOfNeedList = '';  // single-value SELECT only
    let matchYearOfNeed = false;
    let matchedOnYearOfNeed = '';

    const keywordList = [];
    let matchKeyword = false;
    let matchedOnKeyword = '';

    /*
    let matchHigherEdEnrollmentStatus = false;
    let matchUSMilitaryServiceType = false;
    const faaPilotCertificatesList = [];
    let matchFAAPilotCertificate = false;
    const faaPilotRatingsList = [];
    let matchFAAPilotRating = false;
    const faaMechanicCertificatesList = [];
    let matchFAAMechanicCertificate = false;
*/

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
//alert(`keyword count: ${keywordList.length}`);

/*
    ///////////////////////////////////////////////////////////
    // Prep: Higher Ed Enrollment Status
    ///////////////////////////////////////////////////////////

    // format the Higher Ed Enrollment Status for use in the matching logic
    let filterHigherEdEnrollmentStatuses = document.querySelector("#filterEducationLevelInput"); 
    let filterHigherEdEnrollmentStatusText = filterHigherEdEnrollmentStatuses.options[filterHigherEdEnrollmentStatuses.selectedIndex].text;
    let filterHigherEdEnrollmentStatusValue = filterHigherEdEnrollmentStatuses.options[filterHigherEdEnrollmentStatuses.selectedIndex].value;
    filterHigherEdEnrollmentStatusText = '|' + filterHigherEdEnrollmentStatusText.toLowerCase() + '|';

    ///////////////////////////////////////////////////////////
    // Prep: U.S. Military Service Type
    ///////////////////////////////////////////////////////////
    // format the U.S. Military Service Type for use in the matching logic
    let filterUSMilitaryServiceTypes = document.querySelector("#filterUSMilitaryServiceInput"); 
    let filterUSMilitaryServiceTypeText = filterUSMilitaryServiceTypes.options[filterUSMilitaryServiceTypes.selectedIndex].text;
    let filterUSMilitaryServiceTypeValue = filterUSMilitaryServiceTypes.options[filterUSMilitaryServiceTypes.selectedIndex].value;
    filterUSMilitaryServiceTypeText = '|' + filterUSMilitaryServiceTypeText.toLowerCase() + '|';

    ///////////////////////////////////////////////////////////
    // Prep: FAA Pilot Certificate
    ///////////////////////////////////////////////////////////
    // format the FAA Pilot Certificates for use in the matching logic
    let filterFAAPilotCertificateIDs = document.querySelector("#filterFAAPilotCertificateInput").selectedOptions;

    [].forEach.call(filterFAAPilotCertificateIDs, faaAPilotCertificateID => {
        if ( faaAPilotCertificateID.value !== "0" ) {
            faaPilotCertificatesList.push('|' + faaAPilotCertificateID.textContent.toLowerCase() + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Prep: FAA Pilot Rating
    ///////////////////////////////////////////////////////////
    // format the FAA Pilot Ratings for use in the matching logic
    let filterFAAPilotRatingIDs = document.querySelector("#filterFAAPilotRatingInput").selectedOptions;

    [].forEach.call(filterFAAPilotRatingIDs, faaAPilotRatingID => {
        if ( faaAPilotRatingID.value !== "0" ) {
            faaPilotRatingsList.push('|' + faaAPilotRatingID.textContent.toLowerCase() + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Prep: FAA Mechanic Certificate
    ///////////////////////////////////////////////////////////
    // format the FAA Mechanic Certificates for use in the matching logic
    let filterFAAMechanicCertificateIDs = document.querySelector("#filterFAAMechanicCertRatingInput").selectedOptions;
//    alert(`filterFAAMechanicCertificateIDs: ${filterFAAMechanicCertificateIDs.length}`);

    [].forEach.call(filterFAAMechanicCertificateIDs, faaAMechanicCertificateID => {
        if ( faaAMechanicCertificateID.value !== "0" ) {
//alert(`faaAMechanicCertificateID: ${faaAMechanicCertificateID.value}`);
//alert(`FAA Mechanic Certificate Text: |${faaAMechanicCertificateID.textContent.toLowerCase()}|`);
            faaMechanicCertificatesList.push('|' + faaAMechanicCertificateID.textContent.toLowerCase() + '|');
        }
    })
*/

    ///////////////////////////////////////////////////////////
    // Create an array of matching scholarships
    ///////////////////////////////////////////////////////////
    for ( var i = 0; i < scholarships.length; i++ ) {

//        alert('Checking scholarship #' + i + ' of ' + scholarships.length);

        // reset the matching variables
        matchResult = false;
        matchedOn = '';
        matchCount = 0;

        matchFieldOfStudy = false;
        matchedOnFieldOfStudy = '';

        matchSponsor = false;
        matchedOnSponsor = '';

        matchGender = false;
        matchedOnGender = '';

        matchAge = false;
        matchedOnAge = '';

        matchCitizenship = false;
        matchedOnCitizenship = '';

        matchYearOfNeed = false;
        matchedOnYearOfNeed = '';

        matchKeyword = false;
        matchedOnKeyword = '';
/*
        matchHigherEdEnrollmentStatus = false;
        matchGPA = false;
        matchUSMilitaryServiceType = false;
        matchFAAPilotCertificate = false;
        matchFAAPilotRating = false;
        matchFAAMechanicCertificate = false;
*/

        // check the Field of Study
        if ( fieldOfStudyList.length === 0 || scholarships[i]['Criteria_FieldOfStudyMatchingText'].length === 0 ) {
            matchFieldOfStudy = true;
            matchCount++;
            matchedOnFieldOfStudy = 'Field(s) of Study (Not Specified); ';
        } else {
            fieldOfStudyList.forEach( function(fieldOfStudyText) {
                if ( scholarships[i]['Criteria_FieldOfStudyMatchingText'].toLowerCase().includes(fieldOfStudyText) ) {
                    matchFieldOfStudy = true;
                    matchCount++;
                    if ( matchedOnFieldOfStudy.length === 0 ) {
                        matchedOnFieldOfStudy = 'Field(s) of Study (';
                    };
                    matchedOnFieldOfStudy += fieldOfStudyText.replaceAll('|','') + '; ';
                }
            });
            if ( matchFieldOfStudy ) {
                matchedOnFieldOfStudy = matchedOnFieldOfStudy.slice(0, -2);  // remove the trailing "; " characters
                matchedOnFieldOfStudy += '); ';  // close the list of matching values
            };
        }

        // check the Sponsor IDs
        if ( sponsorList.length === 0 ) { // don't need to check that the scholarship has a Sponsor - it's required
            matchSponsor = true;
            matchCount++;
            matchedOnSponsor = 'Sponsors (Not Specified); ';
        } else {
            sponsorList.forEach( function(sponsorID) {
                if ( scholarships[i]['SponsorIDMatching'].toLowerCase().includes(sponsorID) ) {
                    matchSponsor = true;
                    matchCount++;
                    if ( matchedOnSponsor.length === 0 ) {
                        matchedOnSponsor = 'Sponsor(s) (';
                    };
                    matchedOnSponsor += scholarships[i]['SponsorName'] + '; ';
                }
            });
            if ( matchSponsor ) {
                matchedOnSponsor = matchedOnSponsor.slice(0, -2);  // remove the trailing "; " characters
                matchedOnSponsor += '); ';  // close the list of matching values
            };
        }

        // check the Gender
        if ( genderList.length === 0  || scholarships[i]['Criteria_GenderMatchingText'].length === 0) {
            matchGender = true;
            matchCount++;
            matchedOnGender = 'Gender(s) (Not Specified); ';
        } else {
            matchGender = scholarships[i]['Criteria_GenderMatchingText'].toLowerCase().includes(genderList);
            if ( matchGender ) {
                matchCount++;
                matchedOnGender = 'Gender(s) (' + filterGenders + '); ';
            };
        }

        // check the Age
        if ( filterAge.length === 0 || 
            ( scholarships[i]['Criteria_AgeMinimum'].length === 0 && scholarships[i]['Criteria_AgeMaximum'].length === 0 )) {
            matchAge = true;
            matchCount++;
            matchedOnAge = 'Age (Not Specified); ';
        } else {
            if ( scholarships[i]['Criteria_AgeMaximum'].length == 0 ) {
                matchAge = (scholarships[i]['Criteria_AgeMinimum'] <= filterAge);
            } else {
                matchAge = ((filterAge >= scholarships[i]['Criteria_AgeMinimum'])
                            && (filterAge <= scholarships[i]['Criteria_AgeMaximum']));
            };
            if ( matchAge ) {
                matchCount++;
                matchedOnAge = 'Age (' + filterAge + '); ';
            };
        }

        // check the Citizenship
        if ( citizenshipList.length === 0  || scholarships[i]['Criteria_CitizenshipMatchingText'].length === 0) {
            matchCitizenship = true;
            matchCount++;
            matchedOnCitizenship = 'Citizenship(s) (Not Specified); ';
        } else {
            matchCitizenship = scholarships[i]['Criteria_CitizenshipMatchingText'].toLowerCase().includes(citizenshipList);
            if ( matchCitizenship ) {
                matchCount++;
                matchedOnCitizenship = 'Citizenship(s) (' + filterCitizenships + '); ';
            };
        }

        // check the Year of Need
        if ( yearOfNeedList.length === 0  || scholarships[i]['Criteria_YearOfNeedMatchingText'].length === 0) {
            matchYearOfNeed = true;
            matchCount++;
            matchedOnYearOfNeed = 'Year(s) of Need (Not Specified); ';
        } else {
            matchYearOfNeed = scholarships[i]['Criteria_YearOfNeedMatchingText'].toLowerCase().includes(yearOfNeedList);
            if ( matchYearOfNeed ) {
                matchCount++;
                matchedOnYearOfNeed = 'Year(s) of Need (' + filterYearOfNeed + '); ';
            };
        }

        // check the Keyword(s)
        if ( keywordList.length === 0 ) {
            matchKeyword = true;
            matchCount++;
            matchedOnKeyword = 'Keyword(s) (Not Specified); ';
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
                        if ( matchedOnKeyword.length === 0 ) {
                            matchedOnKeyword = 'Keyword(s) (';
                        };
                        matchedOnKeyword += keyword + '; ';
                    };
                };
            });
            if ( matchKeyword ) {
                matchedOnKeyword = matchedOnKeyword.slice(0, -2);  // remove the trailing "; " characters
                matchedOnKeyword += '); ';  // close the list of matching values
            };
        }
alert(`matchKeyword ${matchKeyword}`);

        /*
        // check the Higher Ed Enrollment Status
        if ( filterHigherEdEnrollmentStatusValue === "0" || scholarships[i].criteriaEducationLevel.length === 0 ) {
            matchHigherEdEnrollmentStatus = true;
        } else {
            matchHigherEdEnrollmentStatus = scholarships[i].criteriaHigherEdEnrollmentStatus.toLowerCase().includes(filterHigherEdEnrollmentStatusText);
        }       


        // check the GPA
        if ( filterGPA === ""  || scholarships[i].criteriaMinimumGPA.length === 0) {
            matchGPA = true;
        } else {
            matchGPA = (scholarships[i].criteriaMinimumGPA <= filterGPA);
        }       

        // check the U.S. Military Service Type
        if ( filterUSMilitaryServiceTypeValue === "0" || scholarships[i].criteriaUSMilitaryService.length === 0 ) {
            matchUSMilitaryServiceType = true;
        } else {
            matchUSMilitaryServiceType = scholarships[i].criteriaUSMilitaryService.toLowerCase().includes(filterUSMilitaryServiceTypeText);
        }       

        // check the FAA Pilot Certificates
        if ( faaPilotCertificatesList.length === 0 || scholarships[i].criteriaFAAPilotCertificate.length === 0 ) {
            matchFAAPilotCertificate = true;
        } else {
            faaPilotCertificatesList.forEach( function(faaPilotCertificateText) {
                matchFAAPilotCertificate = matchFAAPilotCertificate || 
                    (scholarships[i].criteriaFAAPilotCertificate.toLowerCase().includes(faaPilotCertificateText));
            });
        }            

        // check the FAA Pilot Ratings
        if ( faaPilotRatingsList.length === 0 || scholarships[i].criteriaFAAPilotRating.length === 0 ) {
            matchFAAPilotRating = true;
        } else {
            faaPilotRatingsList.forEach( function(faaPilotRatingText) {
                matchFAAPilotRating = matchFAAPilotRating || 
                    (scholarships[i].criteriaFAAPilotRating.toLowerCase().includes(faaPilotRatingText));
            });
        }            

        // check the FAA Mechanic Certificates
        if ( faaMechanicCertificatesList.length === 0 || scholarships[i].criteriaFAAMechanicCertificate.length === 0 ) {
            matchFAAMechanicCertificate = true;
        } else {
            faaMechanicCertificatesList.forEach( function(faaMechanicCertificateText) {
                matchFAAMechanicCertificate = matchFAAMechanicCertificate || 
                    (scholarships[i].criteriaFAAMechanicCertificate.toLowerCase().includes(faaMechanicCertificateText));
            });
        }            

//                alert(`matchfaaMechanicCertificate: ${matchFAAMechanicCertificate}`);
*/

        ///////////////////////////////////////////////////////////
        // Does this scholarship match ANY of the search criteria?
        // Note that "AND" logic is used as blank Search Criteria is set to "True" for matching purposes.
        ///////////////////////////////////////////////////////////
        matchedOn = matchedOnFieldOfStudy + matchedOnSponsor + matchedOnGender + matchedOnAge + matchedOnCitizenship +
                    matchedOnYearOfNeed + matchedOnKeyword;
        if ( matchedOn.substring(0, 2) === '; ' ) { matchedOn = matchedOn.slice(2); };
        matchResult = (matchFieldOfStudy && matchSponsor && matchGender && matchAge && matchCitizenship &&
                       matchYearOfNeed && matchKeyword);
//        matchResult = ( matchHigherEdEnrollmentStatus && matchUSMilitaryServiceType && matchGPA
//                        matchFAAPilotCertificate && matchFAAPilotRating && matchFAAMechanicCertificate);
         if ( matchResult ) {
            scholarships[i]['matchedOn'] = matchedOn;
            scholarships[i]['matchCount'] = matchCount;
            matchingScholarships.push(scholarships[i]);
        }

    } // end scholarships "for" loop


    ///////////////////////////////////////////////////////////
    // if matches found, build the search results; otherwise, show a message
    ///////////////////////////////////////////////////////////
    if (matchingScholarships.length === 0) {
        document.querySelector('#searchResultsTitle').textContent = 'No results found. Try changing the search criteria for better results.';
        const searchResults = document.querySelector('#searchResults');
        document.querySelector('#scholarshipsearchresultscolumn').removeChild(searchResults);
    } else {
        // build "scholarship search results"
//        document.querySelector('#searchResultsTitle').textContent = 'Search Results:';
        const createResults = buildScholarshipSearchResults(matchingScholarships, pageNumber);
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////
// build the scholarship search results divs
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildScholarshipSearchResults(matchingScholarships, pageNumber) {

//alert(`Total Scholarship Volume: ${matchingScholarships.length}`);

    // if a specific page number is displayed, extract just the scholarships to be built
//alert(`Page Number: ${pageNumber}; scholarships per page: ${pageScholarshipVolume}`);
    document.querySelector('#searchResultsTitle').textContent = 'Search Results:';

    const selectedScholarships = matchingScholarships.slice(
        (pageNumber-1) * pageScholarshipVolume,
        pageNumber * pageScholarshipVolume);

//        alert(`Starting Scholarship to load: ${(pageNumber-1) * pageScholarshipVolume}`);
//        alert(`Selected Scholarshps: ${selectedScholarships.length}`);

    // TODO: sort the selected scholarships by "sponsored" and then the rest alphabetically

    // for each selected scholarship, build the initial display with the details hidden
    const divSearchResultsColumn = document.querySelector('#scholarshipsearchresultscolumn');
    const divSearchResultsDivs = document.createElement('div');
    divSearchResultsDivs.id = 'searchResults';
//    divSearchResultsDivs.classList.add('container');
//    divSearchResultsDivs.classList.add('bodylayout1col2');

    for (let selectedScholarship of selectedScholarships) {

//        alert(`Scholarship selected: ${selectedScholarship['ScholarshipName']}!`);

        // update looping variables
//        scholarshipCount++;

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

//alert('Row1Col1 addeded to div.');

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

//alert('Row1Col2 addeded to div.');

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
//                divScholarshipRow1Col3Row1Col2.textContent = selectedScholarship.sponsorName;
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
                spanScholarshipDescription.textContent = selectedScholarship['ScholarshipDescription'];

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
                divScholarshipRow1Col3Row5Col1.textContent = 'Award(s):';

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
            divScholarshipRow2Col1.style.display = "inline-block";
        
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
                imgApply.src = "img/imgApplyButton.png";
                imgApply.classList.add('button-apply');

                lnkApply.appendChild(imgApply);
                divScholarshipRow2Col1.appendChild(lnkApply);

        divScholarshipRow2.appendChild(divScholarshipRow2Col1);
        
            // build and add the second column to the second row (empty)
            const divScholarshipRow2Col2 = document.createElement('div');
            divScholarshipRow2Col2.classList.add('scholarshipsearchresultscol2');
            divScholarshipRow2Col2.style.display = "inline-block";

        divScholarshipRow2.appendChild(divScholarshipRow2Col2);
        
            // build and add the third column to the second row
            const divScholarshipRow2Col3 = document.createElement('div');
            divScholarshipRow2Col3.classList.add('scholarshipsearchresultscol3');
            divScholarshipRow2Col3.classList.add('container');
            divScholarshipRow2Col3.style.display = "inline-block";
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

                // Matching Search Criteria
                const divScholarshipRow2Col3Row4Col1 = document.createElement('div');
                divScholarshipRow2Col3Row4Col1.classList.add('scholarshipsearchresultscol3A');
                divScholarshipRow2Col3Row4Col1.textContent = 'Matched On:';

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row4Col1);

                const divScholarshipRow2Col3Row4Col2 = document.createElement('div');
                divScholarshipRow2Col3Row4Col2.classList.add('scholarshipsearchresultscol3B');
                divScholarshipRow2Col3Row4Col2.classList.add('text-block');
                divScholarshipRow2Col3Row4Col2.innerHTML =  selectedScholarship['matchCount'] + ' Criteria: ' + selectedScholarship['matchedOn'];

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row4Col2);

        divScholarshipRow2Col3.appendChild(divScholarshipRow2Col3Rows);

        divScholarshipRow2.appendChild(divScholarshipRow2Col3);
        divScholarshipRow2.style.display = "none"; // initially hidden

        // add the first row to the search results div
        divSearchResultsDivs.appendChild(divScholarshipRow2);
    
        // add the scholarship break line to the search results div
        const hrScholarshipBreak = document.createElement('hr');
        hrScholarshipBreak.classList.add('bodycol2scholarshipbreak');
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
    const buildPageNavResult = buildPageNavigator(matchingScholarships, pageNumber);

    // scroll back to the top of the page
    window.scrollTo(0,0);

};


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the pagination div
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildPageNavigator(matchingScholarships, pageNumberSelected) {

//    let pageNumberToLoad = 0;
    const numberOfPages = Math.ceil(matchingScholarships.length / pageScholarshipVolume);

    // find the "parent" div to which to add the pagination controls
    const divSearchResultsColumn = document.querySelector('#scholarshipsearchresultscolumn');
    const divPaginationNavBar = document.createElement('div');
    divPaginationNavBar.id = 'pagination';
    divPaginationNavBar.classList.add('paginationNavBar');

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
            clearScholarshipSearchCriteria();
            buildScholarshipSearchResults(matchingScholarships, pageNumberToLoad);
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
function clearSponsorCollegeSearchCritera() {

    document.getElementById("filter_keyword").value = "";
    document.getElementById("filter_sponsor").value = 0;
    document.getElementById("filter_college").value = 0;
    document.getElementById("filter_sponsortype").value = 0;

    // scroll back to the top of the page
    window.scrollTo(0,0);
    
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// when a user clicks on the "expand/collapse" button for a scholarship, show/hide the details
/////////////////////////////////////////////////////////////////////////////////////////////////
function toggleShowScholarshipDetails(buttonID, detailsID) {

    const enableButton = document.querySelector("#" + buttonID);
    const divDetails = document.querySelector("#" + detailsID);

//    alert('div.display: ' + divDetails.style.display);

    // if the current display is hidden, then show
    if ( divDetails.style.display !== "inline-block") {
        divDetails.style.display = "inline-block";
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

/////////////////////////////////////////////////////////////////////////////////////////////////
// load the list of Sponsors into the Search Criteria option
/////////////////////////////////////////////////////////////////////////////////////////////////
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

/* // load the list of States/Provinces into the Search Criteria option
function loadStateProvinceList(statesProvinces) {

    // get a reference to the SELECT element
    const selStateProvinceList = document.querySelector("#filterStateProvinceInput");

    // create and add the "(Not Selected)" default option
    const optStateProvinceNotSelected = document.createElement("option");
    optStateProvinceNotSelected.textContent = "(Not Selected)";
    optStateProvinceNotSelected.value = 0;
    optStateProvinceNotSelected.selected = true;
    selStateProvinceList.appendChild(optStateProvinceNotSelected);

    // add options for each of the StateProvinces in the current data file
    statesProvinces.forEach( function(stateProvince, ind) {
        const optStateProvince = document.createElement("option");
        optStateProvince.textContent = stateProvince.stateProvinceName;
        optStateProvince.value = stateProvince.stateProvinceID;
        optStateProvince.classList.add('filter-option');
        selStateProvinceList.appendChild(optStateProvince);
    });

}
 */

/*  // load the list of Citizenships into the Search Criteria option
function loadCitizenshipList(citizenships) {

    // get a reference to the SELECT element
    const selCitizenshipList = document.querySelector("#filterCitizenshipInput");

    // create and add the "(Not Selected)" default option
    const optCitizenshipNotSelected = document.createElement("option");
    optCitizenshipNotSelected.textContent = "(Not Selected)";
    optCitizenshipNotSelected.value = 0;
    optCitizenshipNotSelected.selected = true;
    selCitizenshipList.appendChild(optCitizenshipNotSelected);

    // add options for each of the Citizenships in the current data file
    citizenships.forEach( function(citizenship, ind) {
        const optCitizenship = document.createElement("option");
        optCitizenship.textContent = citizenship.citizenshipName;
        optCitizenship.value = citizenship.citizenshipID;
        optCitizenship.classList.add('filter-option');
        selCitizenshipList.appendChild(optCitizenship);
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
