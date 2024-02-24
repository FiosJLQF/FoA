////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Scripts for the Scholarship Search Engine (client-side scripts)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   showSelectedScholarships
//   buildScholarshipSearchResults
//      - buildScholarshipSearchResultDiv (in this file)
//      - buildScholarshipPageNavigator (in this file)
//   toggleShowScholarshipDetails
//   toggleShowScholarshipDescDetails
//   validateScholarshipSearchCriteria
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////
// show selected scholarships (all or matched)
/////////////////////////////////////////////////////////////////////////////////////////////////
function showSelectedScholarships(scholarships, sponsors, scholarshipsAllOrMatched) {

    // clear any previous search results
    clearSearchResults();

    // load all scholarships
    buildScholarshipSearchResults(scholarships, sponsors, 1, false, scholarshipsAllOrMatched);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the scholarship search results divs
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildScholarshipSearchResults(matchingScholarships, sponsors, pageNumber,
             showMatchingCriteria, scholarshipsAllOrMatched) {

    // local variables
    let featuredItemsCount = 0;
    let selectedItemSliceBegin = 0;
    let selectedItemSliceEnd = 0;

    // clear any previous search results
    clearSearchResults();
    document.querySelector('#searchresultsmaintitle').style.display = 'none';

    // find the main <div> for column 2 (i.e., the search results column)
    const divSearchResultsColumn = document.querySelector('#panel_body_right');

    ///////////////////////////////////////////////////////////
    // if building the 1st page (and not filtered to one sponsor), show the "featured" items first
    ///////////////////////////////////////////////////////////
    if ( pageNumber === 1 && sponsors.length > 1 ) {

        //////////////////////////////////////////////////////////////////
        // build the "Featured Sponsor(s)" block, if any exist
        //////////////////////////////////////////////////////////////////
        const divFeaturedSponsorsBlock = buildFeaturedSponsorsBlock(sponsors);
        divSearchResultsColumn.prepend(divFeaturedSponsorsBlock);

        //////////////////////////////////////////////////////////////////
        // build the "Featured Scholarship(s)" block, if any exist
        //////////////////////////////////////////////////////////////////
        // extract the "featured" items
        const featuredItems = matchingScholarships.filter(
            obj => obj['ScholarshipIsFeatured']  /* featured scholarships */
        );
        featuredItemsCount = featuredItems.length;

        // if "featured" items were found, build the "Featured Scholarships" block
        if ( featuredItemsCount > 0 ) {

            // build a "featured results" div
            const divFeaturedResults = document.createElement('div');
            divFeaturedResults.id = 'featuredscholarships'
            divFeaturedResults.classList.add('featured-scholarships-block');

            // add the "Featured Scholarships" label (with break hr)
            const divFeaturedItemsBlockTitle = document.createElement('div');
            divFeaturedItemsBlockTitle.classList.add('bodylayout1col2title');
            divFeaturedItemsBlockTitle.innerText = "Featured Scholarships";
            divFeaturedResults.append(divFeaturedItemsBlockTitle);
            const hrFeaturedItemsBlockTitleBreak = document.createElement('hr');
            hrFeaturedItemsBlockTitleBreak.classList.add('searchresults-subblock-break-hr');
            divFeaturedResults.append(hrFeaturedItemsBlockTitleBreak);

            // for each featured item, build the initial display with the details hidden
            for (let featuredItem of featuredItems) {

                // build a Scholarship Search Result div
                const divItemSearchResult = buildScholarshipSearchResultDiv(featuredItem, showMatchingCriteria, true);
                divFeaturedResults.append(divItemSearchResult);

                // add the sub-block break line to the search results div
                const hrItemBreak = document.createElement('hr');
                hrItemBreak.classList.add('searchresults-subblock-break-hr');
                divFeaturedResults.append(hrItemBreak);

                // add all item search results divs to the body at the top of the search results column
//                divSearchResultsColumn.prepend(divFeaturedResults);
                divSearchResultsColumn.append(divFeaturedResults);

            };  // loop to the next featured item in the array

        }; // END: if any featured items were found

    }; // END:  Featured Items block (if page number is 1)

    ///////////////////////////////////////////////////////////
    // add the "Matched Items"
    ///////////////////////////////////////////////////////////

    // create the search results div for column 2
    const divSearchResultsDivs = document.createElement('div');
    divSearchResultsDivs.id = 'searchResults';

    // create the title (with hr break)
    const divMatchedItemsBlockTitle = document.createElement('div');
    divMatchedItemsBlockTitle.classList.add('bodylayout1col2title');
    if ( scholarshipsAllOrMatched === 'matched' ) {
        if ( matchingScholarships.length == 0 ) { // no matches found
            divMatchedItemsBlockTitle.textContent = 'No results found. Try changing the search criteria for better results.';
        } else {  // at least one match was found
            divMatchedItemsBlockTitle.textContent = 'Search Results (sorted by best match)';
        }
    } else {
        divMatchedItemsBlockTitle.textContent = 'Showing All Scholarships';
    }
    divSearchResultsDivs.append(divMatchedItemsBlockTitle);

    // if any matching scholarships were found, build the display blocks
    if ( matchingScholarships.length > 0 ) {
        console.log(`matching scholarships: ${matchingScholarships.length}`);

        // add the results title banner divider bar
        const hrMatchedItemsBlockTitleBreak = document.createElement('hr');
        hrMatchedItemsBlockTitleBreak.classList.add('searchresults-subblock-break-hr');
        divSearchResultsDivs.append(hrMatchedItemsBlockTitleBreak);
    
        // if a specific page number is displayed, extract just the items to be built
        selectedItemSliceBegin =  (pageNumber === 1) ? 0 : (((pageNumber-1) * pageScholarshipVolume) - featuredItemsCount);
        selectedItemSliceEnd = (pageNumber * pageScholarshipVolume) - featuredItemsCount;
        const selectedItems = matchingScholarships.slice( selectedItemSliceBegin, selectedItemSliceEnd);
    
        // for each selected item, build the initial display with the details hidden
        for (let selectedItem of selectedItems) {

            // build a Scholarship Search Result div
            const divItemSearchResult = buildScholarshipSearchResultDiv(selectedItem, showMatchingCriteria, false);
            divSearchResultsDivs.append(divItemSearchResult);

            // add the break line to the search results div
            const hrItemBreak = document.createElement('hr');
            hrItemBreak.classList.add('searchresults-subblock-break-hr');
            divSearchResultsDivs.appendChild(hrItemBreak);

        };  // loop to the next Item in the array
    
    };

    // add all search results divs to the body
    divSearchResultsColumn.appendChild(divSearchResultsDivs);

    // add the page navigator bar after the results are built
    if ( matchingScholarships.length > 0 ) {
        const buildPageNavResult = buildScholarshipPageNavigator(matchingScholarships, sponsors, pageNumber, showMatchingCriteria, scholarshipsAllOrMatched);
    };

    // scroll back to the top of the page
    window.scrollTo(0,0);

};


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the pagination div
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildScholarshipPageNavigator(matchingScholarships, sponsors, pageNumberSelected, showMatchingCriteria,
             scholarshipsAllOrMatched) {

//    let pageNumberToLoad = 0;
    const numberOfPages = Math.ceil(matchingScholarships.length / pageScholarshipVolume);

    // find the "parent" div to which to add the pagination controls
    const divSearchResultsColumn = document.querySelector('#panel_body_right');
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
            clearSearchResults();
            buildScholarshipSearchResults(matchingScholarships, sponsors, pageNumberToLoad, showMatchingCriteria, scholarshipsAllOrMatched);
        });

        lnkPageNumber.append(spanPageNumber);
        divPaginationNavBar.append(lnkPageNumber);
        divPaginationNavBar.append(spanPageNumber);

    };

    // add all scholarship search results divs to the body
    divSearchResultsColumn.append(divPaginationNavBar);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// when a user clicks on the "expand/collapse" button for a scholarship, show/hide the details
/////////////////////////////////////////////////////////////////////////////////////////////////
function toggleShowScholarshipDetails(buttonIDShow, buttonIDHide, detailsID) {

    const showButton = document.querySelector("#" + buttonIDShow);
    const hideButton = document.querySelector("#" + buttonIDHide);
    const divDetails = document.querySelector("#" + detailsID);

//    alert('div.display: ' + divDetails.style.display);

    // if the current display is hidden, then show
    if ( divDetails.style.display !== "flex") {
        divDetails.style.display = "flex";
        // enableButton.classList.remove("fa-chevron-down");
        // enableButton.classList.add("fa-chevron-up");
        showButton.style.display = "none";
        hideButton.style.display = "flex";
    } else {
        divDetails.style.display = "none";
        // enableButton.classList.remove("fa-chevron-up");
        // enableButton.classList.add("fa-chevron-down");
        showButton.style.display = "flex";
        hideButton.style.display = "none";
    }
}


//////////////////////////////////////////////////////////////////////////////////////////
// validate Search Criteria
//////////////////////////////////////////////////////////////////////////////////////////
function validateScholarshipSearchCriteria() {

    let errorCount = 0;
    let criteriaCount = 0;

    // Field of Study
    const elFOS = document.querySelector('#filterFieldOfStudyInput');
    if ( elFOS.value != '0' && elFOS.value.length != 0 ) {
        criteriaCount++;
    };

    // Sponsor
    const elSPN = document.querySelector('#filterSponsorNamesInput');
    if ( elSPN.value != '0' && elSPN.value.length != 0 ) {
        criteriaCount++;
    };

    // Age
    const elAge = document.querySelector('#filterAgeInput');
    const elAgeError = document.querySelector('#filterAgeInputError');
    if ( elAge.value.length == 0 ) {
        elAgeError.textContent = '';
        elAgeError.classList.remove('input-error');
    } else if ( validator.isInt(elAge.value, { min: 16, max: 99}) ) {
        elAgeError.textContent = '';
        elAgeError.classList.remove('input-error');
        criteriaCount++;
    } else {
        errorCount++;
        elAgeError.textContent = 'Age must be between 16 and 99';
        elAgeError.classList.add('input-error');
    }

    // Citizenship
    const elCIT = document.querySelector('#filterCitizenshipInput');
    if ( elCIT.value != '0' && elCIT.value.length != 0 ) {
        criteriaCount++;
    };

    // Year of Need
    const elYON = document.querySelector('#filterYearOfNeedInput');
    if ( elYON.value != '0' && elYON.value.length != 0 ) {
        criteriaCount++;
    };

    // Keywords
    const elKeywords = document.querySelector('#filterKeywordsInput');
    if ( elKeywords.value != '' ) {
        criteriaCount++;
    };

    // Gender / Female Applicant
    const elFemale = document.querySelector('#filterGenderInput');
    if ( elFemale.value != '0' && elFemale.value.length != 0 ) {
        criteriaCount++;
    };

    // Enrollment Status
    const elEnrollment = document.querySelector('#filterEnrollmentStatusInput');
    if ( elEnrollment.value != '0' && elEnrollment.value.length != 0 ) {
        criteriaCount++;
    };

    // GPA
    const elGPA = document.querySelector('#filterGPAInput');
    const elGPAError = document.querySelector('#filterGPAInputError');
    if ( elGPA.value.length == 0 ) {
        elGPAError.textContent = '';
        elGPAError.classList.remove('input-error');
    } else if ( validator.isFloat(elGPA.value, { min: 0, max: 4}) ) {
        elGPAError.textContent = '';
        elGPAError.classList.remove('input-error');
        criteriaCount++;
    } else {
        errorCount++;
        elGPAError.textContent = 'GPA must be between 0.00 and 4.00';
        elGPAError.classList.add('input-error');
    }

    // Military Service
    const elUSMS = document.querySelector('#filterUSMilitaryServiceInput');
    if ( elUSMS.value != '0' && elUSMS.value.length != 0 ) {
        criteriaCount++;
    };

    // FAA Pilot Certificate
    const elFAAPC = document.querySelector('#filterFAAPilotCertificateInput');
    if ( elFAAPC.value != '0' && elFAAPC.value.length != 0 ) {
        criteriaCount++;
    };

    // FAA Pilot Rating
    const elFAAPR = document.querySelector('#filterFAAPilotRatingInput');
    if ( elFAAPR.value != '0' && elFAAPR.value.length != 0 ) {
        criteriaCount++;
    };

    // FAA Mechanic Certificate/Rating
    const elFAAMC = document.querySelector('#filterFAAMechanicCertRatingInput');
    if ( elFAAMC.value != '0' && elFAAMC.value.length != 0 ) {
        criteriaCount++;
    };

    // Return the value to be processed
    if ( criteriaCount == 0 ) {
        return "none";
    } else if ( errorCount == 0 ) {
        return "validated";
    } else {
        return "errors";
    }

}

//////////////////////////////////////////////////////////////////////////////////////////
// build a Scholarship Search Result "main div" element
//////////////////////////////////////////////////////////////////////////////////////////
function buildScholarshipSearchResultDiv(scholarship, showMatchingCriteria, isFeaturedBlock) {

    const scholarshipID = scholarship['ScholarshipID'] + (isFeaturedBlock ? 'F' : '');
    const divScholarship = document.createElement('div');

    /////////////////////////////////////////////////////////////
    // build and add the first row (scholarship summary information)
    /////////////////////////////////////////////////////////////
    const divScholarshipRow1 = document.createElement('div');
    divScholarshipRow1.classList.add('row');

    // If the Sponsor or Scholarship is "Featured", change the div styling
    if ( scholarship['ScholarshipIsFeatured'] ) {
        divScholarshipRow1.classList.add('featured-item-block'); /* change background color */
    } else {
        divScholarshipRow1.classList.add('searchresults-mainblock');
    };

        //////////////////////////////////////////////
        // build and add the first column to the first row
        //////////////////////////////////////////////
        const divScholarshipRow1Col1 = document.createElement('div');
        divScholarshipRow1Col1.classList.add('searchresultscol1');

        // Sponsor Website Link
        const lnkSponsorWebsite = document.createElement('a');
        lnkSponsorWebsite.id = "lnkSponsorWebsite_" + scholarship['SponsorID'];
        lnkSponsorWebsite.href = scholarship['SponsorWebsite'];
        lnkSponsorWebsite.target = "_blank";

        // Add Sponsor Logo to the link
        const imgSponsorLogo = document.createElement('img');
        imgSponsorLogo.src = scholarship['SponsorLogo'];
        imgSponsorLogo.classList.add('featured-sponsor-logo');
        imgSponsorLogo.alt = "Link to the Sponsor's Website";
        lnkSponsorWebsite.appendChild(imgSponsorLogo);

        // Sponsor Name (mobile version only)
        const divSponsorName = document.createElement('div');
        divSponsorName.classList.add('sponsor-name-col1');
        divSponsorName.innerText = scholarship['SponsorName'];
        lnkSponsorWebsite.appendChild(divSponsorName);

        // Add link to column 1
        divScholarshipRow1Col1.appendChild(lnkSponsorWebsite);

        // Add "Female Applicants Only" marker
        if (scholarship['Criteria_FemaleApplicantsOnly_Text'].length > 0) {
            const spnFemaleApplicantsOnly = document.createElement('span');
            spnFemaleApplicantsOnly.classList.add('femaleapplicantsonly');
            spnFemaleApplicantsOnly.textContent = scholarship['Criteria_FemaleApplicantsOnly_Text'];
            divScholarshipRow1Col1.appendChild(spnFemaleApplicantsOnly);
        };

        divScholarshipRow1.append(divScholarshipRow1Col1);

        //////////////////////////////////////////////
        // build and add the third column to the first row
        //////////////////////////////////////////////
        const divScholarshipRow1Col3 = document.createElement('div');
        divScholarshipRow1Col3.classList.add('searchresultscol3');
        divScholarshipRow1Col3.classList.add('container');
        const divScholarshipRow1Col3Rows = document.createElement('div');
        divScholarshipRow1Col3Rows.classList.add('row');

            ////////////////////////////////////////
            // Sponsor Name
            ////////////////////////////////////////
            const divScholarshipRow1Col3Row1Col1 = document.createElement('div');
            divScholarshipRow1Col3Row1Col1.classList.add('searchresultscol3A');
            divScholarshipRow1Col3Row1Col1.classList.add('sponsor-name-col2');
            divScholarshipRow1Col3Row1Col1.textContent = 'Sponsor:';

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row1Col1);

            const divScholarshipRow1Col3Row1Col2 = document.createElement('div');

            // If the Sponsor or Scholarship is "Featured", change the div styling
            if ( scholarship['ScholarshipIsFeatured'] ) {
                divScholarshipRow1Col3Row1Col2.classList.add('searchresultscol3Bfeatured');
            } else {
                divScholarshipRow1Col3Row1Col2.classList.add('searchresultscol3B');
            };
            divScholarshipRow1Col3Row1Col2.classList.add('sponsor-name-col2');
            divScholarshipRow1Col3Row1Col2.textContent = scholarship['SponsorName'];

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row1Col2);

            ////////////////////////////////////////
            // Scholarship "Is Featured" Flag
            ////////////////////////////////////////
            if ( scholarship['ScholarshipIsFeatured'] ) {
                // Add the "Featured Scholarship" banner
                const imgScholarshipIsFeatured = document.createElement('img');
                imgScholarshipIsFeatured.src = "/img/imgFeaturedScholarship.png";
                imgScholarshipIsFeatured.alt = "Featured Scholarship Badge";
                imgScholarshipIsFeatured.classList.add('featured-scholarship-badge');
                divScholarshipRow1Col3Rows.appendChild(imgScholarshipIsFeatured);
                // Add the "Featured Scholarship" banner (Mobile Version)
                const imgScholarshipIsFeaturedMobile = document.createElement('img');
                imgScholarshipIsFeaturedMobile.src = "/img/imgFeaturedScholarship_Mobile.png";
                imgScholarshipIsFeaturedMobile.alt = "Featured Scholarship Badge";
                imgScholarshipIsFeaturedMobile.classList.add('featured-scholarship-badge-mobile');
                divScholarshipRow1Col3Rows.appendChild(imgScholarshipIsFeaturedMobile);
            };

            ////////////////////////////////////////
            // Expand Chevron To See Scholarship Details
            ////////////////////////////////////////
            // "Hide" icon instantiated here to get ID
            const iconHide = document.createElement('i');
            iconHide.id = "iconHide_" + scholarshipID;
            // Create "Show" icon
            const iconShow = document.createElement('i');
            iconShow.id = "iconShow_" + scholarshipID;
            // iconShow.classList.add('fas');
            iconShow.classList.add('chevron-scholarship-details-down');
            iconShow.classList.add('scholarship-results-expandchevron');
            iconShow.addEventListener('click', function() {
                toggleShowScholarshipDetails(iconShow.id, iconHide.id,
                    "scholarshipDetails_" + scholarshipID);
            });

            divScholarshipRow1Col3Rows.appendChild(iconShow);

            ////////////////////////////////////////
            // Scholarship Name
            ////////////////////////////////////////
            const divScholarshipRow1Col3Row2Col1 = document.createElement('div');
            divScholarshipRow1Col3Row2Col1.classList.add('searchresultscol3A');
            divScholarshipRow1Col3Row2Col1.textContent = 'Scholarship:';

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row2Col1);

            const divScholarshipRow1Col3Row2Col2 = document.createElement('div');
            // If the Sponsor or Scholarship is "Featured", change the div styling
            if ( scholarship['ScholarshipIsFeatured'] ) {
                divScholarshipRow1Col3Row2Col2.classList.add('searchresultscol3Bfeatured');
            } else {
                divScholarshipRow1Col3Row2Col2.classList.add('searchresultscol3B');
            };
            divScholarshipRow1Col3Row2Col2.textContent = scholarship['ScholarshipName'];

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row2Col2);

            ////////////////////////////////////////
            // Scholarship Type (Field of Study)
            ////////////////////////////////////////
            const divScholarshipRow1Col3Row3Col1 = document.createElement('div');
            divScholarshipRow1Col3Row3Col1.classList.add('searchresultscol3A');
            divScholarshipRow1Col3Row3Col1.textContent = 'Scholarship Type:';

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row3Col1);

            const divScholarshipRow1Col3Row3Col2 = document.createElement('div');
            divScholarshipRow1Col3Row3Col2.classList.add('searchresultscol3B');
            divScholarshipRow1Col3Row3Col2.textContent = scholarship['Criteria_FieldOfStudyText'];

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row3Col2);

            ////////////////////////////////////////
            // Application Dates
            ////////////////////////////////////////
            const divScholarshipRow1Col3Row4Col1 = document.createElement('div');
            divScholarshipRow1Col3Row4Col1.classList.add('searchresultscol3A');
            divScholarshipRow1Col3Row4Col1.textContent = 'Application Dates:';

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row4Col1);

            const divScholarshipRow1Col3Row4Col2 = document.createElement('div');
            divScholarshipRow1Col3Row4Col2.classList.add('searchresultscol3B');
            divScholarshipRow1Col3Row4Col2.textContent = scholarship['ScholarshipApplDatesText'];

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row4Col2);

            ////////////////////////////////////////
            // Award Amount / Quantity
            ////////////////////////////////////////
            const divScholarshipRow1Col3Row5Col1 = document.createElement('div');
            divScholarshipRow1Col3Row5Col1.classList.add('searchresultscol3A');
            divScholarshipRow1Col3Row5Col1.textContent = 'Award:';

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row5Col1);

            const divScholarshipRow1Col3Row5Col2 = document.createElement('div');
            divScholarshipRow1Col3Row5Col2.classList.add('searchresultscol3B-award');
            divScholarshipRow1Col3Row5Col2.textContent = scholarship['ScholarshipAward'];

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row5Col2);

        divScholarshipRow1Col3.append(divScholarshipRow1Col3Rows);

    divScholarshipRow1.appendChild(divScholarshipRow1Col3);

    // add the row to the search results div
    divScholarship.appendChild(divScholarshipRow1);

    /////////////////////////////////////////////////////////////
    // build and add the second row (scholarship detail information)
    /////////////////////////////////////////////////////////////
    const divScholarshipRow2 = document.createElement('div');
    divScholarshipRow2.id = "scholarshipDetails_" + scholarshipID;
    divScholarshipRow2.classList.add('row');

    // If the Sponsor or Scholarship is "Featured", change the div styling
    if ( scholarship['ScholarshipIsFeatured'] ) {
        divScholarshipRow2.classList.add('featured-item-block'); /* change background color */
    } else {
        divScholarshipRow2.classList.add('searchresults-mainblock');
    };

        //////////////////////////////////////////////
        // build and add the first column to the second row
        //////////////////////////////////////////////
        const divScholarshipRow2Col1 = document.createElement('div');
        divScholarshipRow2Col1.classList.add('searchresultscol1');
        divScholarshipRow2Col1.classList.add('apply');
        
        const lnkApply = document.createElement('a');
        lnkApply.id = "lnkApply_" + scholarshipID;
        lnkApply.href = "./scholarshipapply?scholarshipid=" + scholarship['ScholarshipID'];
        lnkApply.target = "_blank";

        const imgApply = document.createElement('img');
        imgApply.src = "../img/imgApplyButton.png";
        imgApply.classList.add('button-apply');

        lnkApply.appendChild(imgApply);
        divScholarshipRow2Col1.appendChild(lnkApply);

    divScholarshipRow2.appendChild(divScholarshipRow2Col1);

        //////////////////////////////////////////////
        // build and add the third column to the second row
        //////////////////////////////////////////////
        const divScholarshipRow2Col3 = document.createElement('div');
        divScholarshipRow2Col3.classList.add('searchresultscol3');
        divScholarshipRow2Col3.classList.add('container');
        const divScholarshipRow2Col3Rows = document.createElement('div');
        divScholarshipRow2Col3Rows.classList.add('row');

            ////////////////////////////////////////
            // Expand Chevron To See Scholarship Details
            // Note: Object instantiated up in the "icon Show" declaration
            ////////////////////////////////////////
            // iconHide.classList.add('fas');
            iconHide.classList.add('chevron-scholarship-details-up');
            iconHide.classList.add('scholarship-results-expandchevron');
            iconHide.addEventListener('click', function() {
                toggleShowScholarshipDetails(iconShow.id, iconHide.id, 
                    "scholarshipDetails_" + scholarshipID);
            });

            divScholarshipRow2Col3Rows.appendChild(iconHide);

            ////////////////////////////////////////
            // Scholarship Description
            ////////////////////////////////////////
            const divScholarshipRow2Col3Row1Col1 = document.createElement('div');
            divScholarshipRow2Col3Row1Col1.classList.add('searchresultscol3A');
            divScholarshipRow2Col3Row1Col1.textContent = 'Description:';

        divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row1Col1);

            const divScholarshipRow2Col3Row1Col2 = document.createElement('div');
            divScholarshipRow2Col3Row1Col2.classList.add('searchresultscol3B');
            divScholarshipRow2Col3Row1Col2.classList.add('text-block');

            const spanScholarshipDescription = document.createElement('span');
            spanScholarshipDescription.id = 'pscholarshipdesc_' + scholarshipID;
            spanScholarshipDescription.classList.add('description-long');
            spanScholarshipDescription.innerHTML = scholarship['ScholarshipDescription'];

            divScholarshipRow2Col3Row1Col2.appendChild(spanScholarshipDescription);

        divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row1Col2);

            ////////////////////////////////////////
            // Eligibility Requirements
            ////////////////////////////////////////
            const divScholarshipRow2Col3Row2Col1 = document.createElement('div');
            divScholarshipRow2Col3Row2Col1.classList.add('searchresultscol3A');
            divScholarshipRow2Col3Row2Col1.classList.add('text-block');
            divScholarshipRow2Col3Row2Col1.textContent = 'Eligibility Requirements:';

        divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row2Col1);

            const divScholarshipRow2Col3Row2Col2 = document.createElement('div');
            divScholarshipRow2Col3Row2Col2.classList.add('searchresultscol3B');
            divScholarshipRow2Col3Row2Col2.classList.add('text-block');
            divScholarshipRow2Col3Row2Col2.innerHTML = scholarship['ScholarshipEligibilityReqs'];

        divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row2Col2);

            ////////////////////////////////////////
            // Contact Info
            ////////////////////////////////////////
            const divScholarshipRow2Col3Row3Col1 = document.createElement('div');
            divScholarshipRow2Col3Row3Col1.classList.add('searchresultscol3A');
            divScholarshipRow2Col3Row3Col1.textContent = 'Contact Info:';

        divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row3Col1);

            const divScholarshipRow2Col3Row3Col2 = document.createElement('div');
            divScholarshipRow2Col3Row3Col2.classList.add('searchresultscol3B');
            divScholarshipRow2Col3Row3Col2.classList.add('text-block');
            divScholarshipRow2Col3Row3Col2.innerHTML = scholarship['ScholarshipContactInfoFormatted'];

        divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row3Col2);

            ////////////////////////////////////////
            // only show matching criteria if requested by the calling script
            ////////////////////////////////////////
            if (showMatchingCriteria) {

                // Matching Search Criteria (Exact)
                const divScholarshipRow2Col3Row4Col1 = document.createElement('div');
                divScholarshipRow2Col3Row4Col1.classList.add('searchresultscol3A');
                divScholarshipRow2Col3Row4Col1.innerText = 'Criteria Match:';

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row4Col1);

                const divScholarshipRow2Col3Row4Col2 = document.createElement('div');
                divScholarshipRow2Col3Row4Col2.classList.add('searchresultscol3B');
                divScholarshipRow2Col3Row4Col2.classList.add('text-block');
                if ( scholarship['matchCountExact'] === 0 ) {
                    divScholarshipRow2Col3Row4Col2.innerHTML = 'No exact criteria was selected.';
                } else {
                    divScholarshipRow2Col3Row4Col2.innerHTML =  scholarship['matchCountExact'] + ' Criteria: ' + scholarship['matchedOnTextExact'];
                }

            divScholarshipRow2Col3Rows.appendChild(divScholarshipRow2Col3Row4Col2);

        };

        divScholarshipRow2Col3.appendChild(divScholarshipRow2Col3Rows);

        divScholarshipRow2.appendChild(divScholarshipRow2Col3);

        // the expanded details are initially hidden
        divScholarshipRow2.style.display = "none"; // initially hidden

    // add the second row to the search results div
    divScholarship.appendChild(divScholarshipRow2);

    return divScholarship;

}
