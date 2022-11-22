////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Scripts for the Scholarship Search Engine (client-side scripts)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   showSelectedScholarships
//   clearScholarshipSearchResults
//   buildScholarshipSearchResults
//      - buildScholarshipSearchResultDiv
//      - buildScholarshipPageNavigator
//   toggleShowScholarshipDetails
//   toggleShowScholarshipDescDetails

//   ToDo:  add checkForTextAreaOverflow (and abstract from individual uses)

//   validateScholarshipSearchCriteria
//   openScholarshipTab
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////
// show selected scholarships (all or matched)
/////////////////////////////////////////////////////////////////////////////////////////////////
function showSelectedScholarships(scholarships, sponsors, scholarshipsAllOrMatched) {

    // clear any previous search results
    clearScholarshipSearchResults();

    // load all scholarships
//    console.log(`showSelectedScholarships count: ${scholarships.length}`);
    buildScholarshipSearchResults(scholarships, sponsors, 1, false, scholarshipsAllOrMatched);
}


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear Search Results
/////////////////////////////////////////////////////////////////////////////////////////////////
function clearScholarshipSearchResults() {

    document.querySelector('#searchResultsTitle').textContent = 'Enter criteria and click "Search"';

    if ( document.querySelector('#featuredsponsors') !== null ) {
        document.querySelector('#searchresultscolumn').removeChild(featuredsponsors);
    };
    if ( document.querySelector('#featuredscholarships') !== null ) {
        document.querySelector('#searchresultscolumn').removeChild(featuredscholarships);
    };
    if ( document.querySelector('#searchResults') !== null ) {
        document.querySelector('#searchresultscolumn').removeChild(searchResults);
    };
    if ( document.querySelector('#pagination') !== null ) {
        document.querySelector('#searchresultscolumn').removeChild(pagination);
    };

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
    clearScholarshipSearchResults();
    document.querySelector('#searchresultsmaintitle').style.display = 'none';
//    if ( document.getElementById('featuredscholarships') != undefined ) {
//        document.getElementById('featuredscholarships').style.display = 'none';
//    };

    // create the main <div> for column 2
    const divSearchResultsColumn = document.querySelector('#searchresultscolumn');

    ///////////////////////////////////////////////////////////
    // if building the 1st page (and not filtered to one sponsor), show the "featured" items first
    ///////////////////////////////////////////////////////////
    console.log(`sponsors.count: ${sponsors.length}`);
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

                ///////////////////////////////////////////////////////////////////////////////
                // post-render scripts
                ///////////////////////////////////////////////////////////////////////////////
/*  // Deprecated 3/1/2022
                // if the "Scholarship Description" does not overflow, hide the "show/hide" chevron
                const spanScholarshipDescription = document.getElementById('pscholarshipdesc_' + featuredItem['ScholarshipID'] + 'F');
                if ( spanScholarshipDescription.clientHeight >= spanScholarshipDescription.scrollHeight ) {
                    document.getElementById('iconDescExpand_' + featuredItem['ScholarshipID'] + 'F').style.display = 'none';
                };
*/
            };  // loop to the next featured item in the array

        }; // END: if any featured items were found

//    } else { // page number is greater than 1, so remove the "featured item" block

        // if ( document.getElementById('featuredresults') != undefined ) {
        //     document.getElementById('featuredresults').style.display = 'none';
        // };

    }; // END:  Featured Items block (if page number is 1)

    ///////////////////////////////////////////////////////////
    // add the "Matched Items"
    ///////////////////////////////////////////////////////////
    console.log(`matchingScholarships.length: ${matchingScholarships.length}`);

    // create the search results div for column 2
    const divSearchResultsDivs = document.createElement('div');
    divSearchResultsDivs.id = 'searchResults';

    // create the title (with hr break)
    const divMatchedItemsBlockTitle = document.createElement('div');
    divMatchedItemsBlockTitle.classList.add('bodylayout1col2title');
    console.log(`scholarshipsAllOrMatched: ${scholarshipsAllOrMatched}`);
    if ( scholarshipsAllOrMatched === 'matched' ) {
        if ( matchingScholarships.length == 0 ) { // no matches found
            divMatchedItemsBlockTitle.textContent = 'No results found. Try changing the search criteria for better results.';
        } else {  // at least one match was found
            divMatchedItemsBlockTitle.textContent = 'Search Results';
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

//            // add all search results divs to the body
//            divSearchResultsColumn.appendChild(divSearchResultsDivs);

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
    const divSearchResultsColumn = document.querySelector('#searchresultscolumn');
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

//    alert('Error Count: ' + errorCount);
//    alert('Criteria Count: ' + criteriaCount);

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
//    console.log(`scholarshipID to build: ${scholarshipID}`);
    const divScholarship = document.createElement('div');

    /////////////////////////////////////////////////////////////
    // build and add the first row (scholarship summary information)
    /////////////////////////////////////////////////////////////
    const divScholarshipRow1 = document.createElement('div');
    divScholarshipRow1.classList.add('row');

    // If the Sponsor or Scholarship is "Featured", change the div styling
//    if ( scholarship['SponsorIsFeatured'] || scholarship['ScholarshipIsFeatured'] ) {
    if ( scholarship['ScholarshipIsFeatured'] ) {
        divScholarshipRow1.classList.add('searchresults-mainblock-featured'); /* change background color */
    } else {
        divScholarshipRow1.classList.add('searchresults-mainblock');
    };

        //////////////////////////////////////////////
        // build and add the first column to the first row
        //////////////////////////////////////////////
        const divScholarshipRow1Col1 = document.createElement('div');
        divScholarshipRow1Col1.classList.add('searchresultscol1');

        const imgSponsorLogo = document.createElement('img');
        imgSponsorLogo.src = scholarship['SponsorLogo'];
        imgSponsorLogo.classList.add('sponsorLogo');

        divScholarshipRow1Col1.appendChild(imgSponsorLogo);

        // Add "Female Applicants Only" marker
        if (scholarship['Criteria_FemaleApplicantsOnly_Text'].length > 0) {
            const spnFemaleApplicantsOnly = document.createElement('span');
            spnFemaleApplicantsOnly.classList.add('femaleapplicantsonly');
            spnFemaleApplicantsOnly.textContent = scholarship['Criteria_FemaleApplicantsOnly_Text'];
            divScholarshipRow1Col1.appendChild(spnFemaleApplicantsOnly);
        };

        divScholarshipRow1.append(divScholarshipRow1Col1);

/*
        //////////////////////////////////////////////
        // build and add the second column to the first row
        //////////////////////////////////////////////
        const divScholarshipRow1Col2 = document.createElement('div');
        divScholarshipRow1Col2.classList.add('searchresultscol2');

            const iconExpand = document.createElement('i');
            iconExpand.id = "iconExpand_" + scholarship['ScholarshipID'];
            iconExpand.classList.add('fas');
            iconExpand.classList.add('fa-chevron-down');
            iconExpand.addEventListener('click', function() {
                toggleShowScholarshipDetails(iconExpand.id, 
                    "scholarshipDetails_" + scholarship['ScholarshipID']);
            });

        divScholarshipRow1Col2.appendChild(iconExpand);

        divScholarshipRow1.append(divScholarshipRow1Col2);
*/

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
            divScholarshipRow1Col3Row1Col1.textContent = 'Sponsor:';

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row1Col1);

            const divScholarshipRow1Col3Row1Col2 = document.createElement('div');
            // If the Sponsor or Scholarship is "Featured", change the div styling
//            if ( scholarship['SponsorIsFeatured'] || scholarship['ScholarshipIsFeatured'] ) {
            if ( scholarship['ScholarshipIsFeatured'] ) {
                divScholarshipRow1Col3Row1Col2.classList.add('searchresultscol3Bfeatured');
            } else {
                divScholarshipRow1Col3Row1Col2.classList.add('searchresultscol3B');
            };
            divScholarshipRow1Col3Row1Col2.textContent = scholarship['SponsorName'];

        divScholarshipRow1Col3Rows.appendChild(divScholarshipRow1Col3Row1Col2);

            ////////////////////////////////////////
            // "Is Featured" Badge
            ////////////////////////////////////////
//console.log(`SponsorIsFeatured: ${scholarship['SponsorIsFeatured']}`);
//            if ( scholarship['SponsorIsFeatured'] ) {
//                const imgSponsorIsFeatured = document.createElement('img');
//                imgSponsorIsFeatured.src = "/img/imgFeaturedSponsor.png";
//                imgSponsorIsFeatured.alt = "Featured Sponsor Badge";
//                imgSponsorIsFeatured.classList.add('featured-sponsor-badge');
//                divScholarshipRow1Col3Rows.appendChild(imgSponsorIsFeatured);
/*            } else */ if ( scholarship['ScholarshipIsFeatured'] ) {
                const imgScholarshipIsFeatured = document.createElement('img');
                imgScholarshipIsFeatured.src = "/img/imgFeaturedScholarship.png";
                imgScholarshipIsFeatured.alt = "Featured Scholarship Badge";
                imgScholarshipIsFeatured.classList.add('featured-scholarship-badge');
                divScholarshipRow1Col3Rows.appendChild(imgScholarshipIsFeatured);
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
            iconShow.classList.add('fas');
            iconShow.classList.add('fa-chevron-down');
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
//            if ( scholarship['SponsorIsFeatured'] || scholarship['ScholarshipIsFeatured'] ) {
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
            // divScholarshipRow1Col3Row3Col2.classList.add('searchresultscol3B');
            if ( scholarship['ScholarshipIsFeatured'] ) {
                divScholarshipRow1Col3Row3Col2.classList.add('searchresultscol3Bfeatured');
            } else {
                divScholarshipRow1Col3Row3Col2.classList.add('searchresultscol3B');
            };
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
            divScholarshipRow1Col3Row5Col2.classList.add('searchresultscol3B');
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
//    if ( scholarship['SponsorIsFeatured'] || scholarship['ScholarshipIsFeatured'] ) {
    if ( scholarship['ScholarshipIsFeatured'] ) {
        divScholarshipRow2.classList.add('searchresults-mainblock-featured'); /* change background color */
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
        lnkApply.href = scholarship['ScholarshipLink'];
        lnkApply.target = "_blank";

        const imgApply = document.createElement('img');
        imgApply.src = "../img/imgApplyButton.png";
        imgApply.classList.add('button-apply');

        lnkApply.appendChild(imgApply);
        divScholarshipRow2Col1.appendChild(lnkApply);

    divScholarshipRow2.appendChild(divScholarshipRow2Col1);

/*        
        //////////////////////////////////////////////
        // build and add the second column to the second row (empty)
        //////////////////////////////////////////////
        const divScholarshipRow2Col2 = document.createElement('div');
        divScholarshipRow2Col2.classList.add('searchresultscol2');

        divScholarshipRow2.appendChild(divScholarshipRow2Col2);
*/

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
            iconHide.classList.add('fas');
            iconHide.classList.add('fa-chevron-up');
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
//            spanScholarshipDescription.classList.add('description-short');
            spanScholarshipDescription.classList.add('description-long');
            spanScholarshipDescription.innerHTML = scholarship['ScholarshipDescription'];

            divScholarshipRow2Col3Row1Col2.appendChild(spanScholarshipDescription);

/*  // Deprecated 3/1/2022
            const iconDescExpand = document.createElement('i');
            iconDescExpand.id = "iconDescExpand_" + scholarshipID;
            iconDescExpand.classList.add('fas');
            iconDescExpand.classList.add('fa-chevron-down');
            iconDescExpand.addEventListener('click', function() {
                toggleShowScholarshipDescDetails(iconDescExpand.id, spanScholarshipDescription.id);
            });

            divScholarshipRow2Col3Row1Col2.appendChild(iconDescExpand);
*/
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

//////////////////////////////////////////////////////////////////////////////////////////
// on the data mgmt forms, show/hide the "Edit" or "Preview" tab, as indicated
//////////////////////////////////////////////////////////////////////////////////////////
function openScholarshipTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Build the scholarship preview DIV
    if ( tabName === 'tabPreview') {
        // Clear any status messages
        if ( document.getElementById('statusMessage') ) {
            document.getElementById('statusMessage').innerText = '';
        };
        const divScholarshipPreview = buildScholarshipSearchResultDiv(scholarshipData, false, false);
        document.getElementById('tabPreview').replaceChildren(divScholarshipPreview);
    };

  } 