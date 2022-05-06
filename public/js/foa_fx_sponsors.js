////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Scripts for the Sponsor Search Engine (client-side scripts)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   showAllSponsors
//   clearSponsorSearchCriteria
//   clearSearchResults
//   findMatchingSponsors
//   buildSponsorSearchResults
//      - buildSponsorSearchResultDiv
//      - createScholarshipDiv (deprecated 1/26/22 by KK)
//      - buildSponsorPageNavigator
//   toggleShowSponsorDetails
//   toggleShowScholarshipDescDetails
//   checkForTextAreaOverflow
//   searchSponsors
//   validateSponsorSearchCriteria
//   openSponsorTab
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////
// show all sponsors
/////////////////////////////////////////////////////////////////////////////////////////////////
function showAllSponsors(sponsors, scholarships) {

    // clear any previous search results
    clearSponsorSearchResults();

    // clear any previous search criteria
    clearSponsorSearchCriteria();

    // load all sponsors
    // sort the sponsors by Sponsor Name
    sponsors.sort( (a,b) => ( a.SponsorName.localeCompare(b.SponsorName) ));
    // build "all sponsors results"
    buildSponsorSearchResults(sponsors, scholarships, 1, false);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear/reset the Sponsor Search Criteria
/////////////////////////////////////////////////////////////////////////////////////////////////
function clearSponsorSearchCriteria() {

    // reset all the search criteria selections

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterKeywordsIcon'),
        document.querySelector('#filterKeywordsInputBlock'),
        document.querySelector('#filterKeywordsInput'), 'hide');

    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterSponsorNamesIcon'),
        document.querySelector('#filterSponsorNamesInputBlock'),
        document.querySelector('#filterSponsorNamesInput'), 'hide');
        
    toggleSearchCriteriaInputBlock(
        document.querySelector('#filterSponsorTypeIcon'),
        document.querySelector('#filterSponsorTypeInputBlock'),
        document.querySelector('#filterSponsorTypeInput'), 'hide');

    // reset the search results column (if any results are showing)
    clearSponsorSearchResults();

    // scroll back to the top of the page
    window.scrollTo(0,0);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear Search Results
/////////////////////////////////////////////////////////////////////////////////////////////////
function clearSponsorSearchResults() {

    document.querySelector('#searchResultsTitle').textContent = 'Enter criteria and click "Search"';

    if ( document.querySelector('#featuredsponsors') !== null ) {
        document.querySelector('#searchresultscolumn').removeChild(featuredsponsors);
    };
    if ( document.querySelector('#searchResults') !== null ) {
        document.querySelector('#searchresultscolumn').removeChild(searchResults);
    };
    if ( document.querySelector('#pagination') !== null ) {
        document.querySelector('#searchresultscolumn').removeChild(pagination);
    };

}

/////////////////////////////////////////////////////////////////////////////////////////////////
// find matching sponsors when the Search button is pressed
/////////////////////////////////////////////////////////////////////////////////////////////////
function findMatchingSponsors(sponsors, scholarships, pageNumber) {

//alert('Starting "findMatchingSponsors"!');

    ////////////////////////////////////////////////////////
    // clear the previous search results
    ////////////////////////////////////////////////////////
    clearSponsorSearchResults();

    ////////////////////////////////////////////////////////
    // variable declarations
    ////////////////////////////////////////////////////////
    const matchingSponsors = [];
    let matchedOn = '';  // what criteria was the matching on, in the format "Sponsor Type(s) (astronautics, air traffic control);"
    let matchResult = false; // the final determination of whether this sponsor matches any search criteria
    let matchCount = 0;   // the number of individual search criteria a sponsor matches on

    const keywordList = [];  // free text, comma-delimited
    let matchKeyword = false;
    let matchedOnKeyword = '';

    const sponsorList = [];  // multi-value SELECT
    let matchSponsor = false;
    let matchedOnSponsor = '';

    const sponsorTypeList = [];  // multi-value SELECT
    let matchSponsorType = false;
    let matchedOnSponsorType = '';

    // scroll to the top of the page
    window.scrollTo(0,0);

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
    // Prep: Sponsor Names (i.e., the Sponsor IDs)
    ///////////////////////////////////////////////////////////

    // format the Sponsor IDs for use in the matching logic
    let filterSponsorIDs = document.querySelector("#filterSponsorNamesInput").selectedOptions;

    [].forEach.call(filterSponsorIDs, sponsorID => {
        if ( sponsorID.value !== "0" ) {
            sponsorList.push(sponsorID.value);
        }
    })

    ///////////////////////////////////////////////////////////
    // Prep: Sponsor Type
    ///////////////////////////////////////////////////////////
    // format the Sponsor Type for use in the matching logic
    let filterSponsorTypeIDs = document.querySelector("#filterSponsorTypeInput").selectedOptions;
    [].forEach.call(filterSponsorTypeIDs, sponsorTypeID => {
        if ( sponsorTypeID.value !== "0" ) {
            sponsorTypeList.push('|' + sponsorTypeID.textContent.toLowerCase() + '|');
        }
    })

    ///////////////////////////////////////////////////////////
    // Create an array of matching sponsors
    ///////////////////////////////////////////////////////////
    for ( var i = 0; i < sponsors.length; i++ ) {

//        alert('Checking sponsor #' + i + ' of ' + sponsors.length);

        // reset the matching variables
        matchResult = false;
        matchedOn = '';
        matchCount = 0;

        matchKeyword = false;
        matchedOnKeyword = '';

        matchSponsor = false;
        matchedOnSponsor = '';

        matchSponsorType = false;
        matchedOnSponsorType = '';

        // check the Keyword(s)
        if ( keywordList.length === 0 ) {
            matchKeyword = true;
            matchCount++;
            matchedOnKeyword = 'Keyword(s) (Not Specified); ';
        } else {
            keywordList.forEach( function(keyword, ind, keywords) {
                if (keyword.length > 0) {
                    matchKeyword = matchKeyword || (
                        sponsors[i]['SponsorName'].toLowerCase().includes(keyword.toLowerCase())
                        || sponsors[i]['SponsorDescription'].toLowerCase().includes(keyword.toLowerCase())
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

        // check the Sponsor IDs
        if ( sponsorList.length === 0 ) { // don't need to check that the scholarship has a Sponsor - it's required
            matchSponsor = true;
            matchCount++;
            matchedOnSponsor = 'Sponsors (Not Specified); ';
        } else {
            sponsorList.forEach( function(sponsorID) {
                if ( sponsors[i]['SponsorIDMatching'].toLowerCase().includes(sponsorID) ) {
                    matchSponsor = true;
                    matchCount++;
                    if ( matchedOnSponsor.length === 0 ) {
                        matchedOnSponsor = 'Sponsor(s) (';
                    };
                    matchedOnSponsor += sponsors[i]['SponsorName'] + '; ';
                }
            });
            if ( matchSponsor ) {
                matchedOnSponsor = matchedOnSponsor.slice(0, -2);  // remove the trailing "; " characters
                matchedOnSponsor += '); ';  // close the list of matching values
            };
        }

        // check the Sponsor Type
        if ( sponsorTypeList.length === 0 || sponsors[i]['SponsorTypeMatchingText'].length === 0 ) {
            matchSponsorType = true;
            matchCount++;
            matchedOnSponsorType = 'Sponsor Type(s) (Not Specified); ';
        } else {
            sponsorTypeList.forEach( function(sponsorTypeText) {
                if ( sponsors[i]['SponsorTypeMatchingText'].toLowerCase().includes(sponsorTypeText) ) {
                    matchSponsorType = true;
                    matchCount++;
                    if ( matchedOnSponsorType.length === 0 ) {
                        matchedOnSponsorType = 'Sponsor Type(s) (';
                    };
                    matchedOnSponsorType += sponsorTypeText.replaceAll('|','') + '; ';
                }
            });
            if ( matchSponsorType ) {
                matchedOnSponsorType = matchedOnSponsorType.slice(0, -2);  // remove the trailing "; " characters
                matchedOnSponsorType += '); ';  // close the list of matching values
            };
        }

        ///////////////////////////////////////////////////////////
        // Does this scholarship match ANY of the search criteria?
        // Note that "AND" logic is used as blank Search Criteria is set to "True" for matching purposes.
        ///////////////////////////////////////////////////////////
        matchedOn = matchedOnKeyword + matchedOnSponsor + matchedOnSponsorType;
        if ( matchedOn.substring(0, 2) === '; ' ) { matchedOn = matchedOn.slice(2); };
        matchResult = (matchKeyword && matchSponsor && matchSponsorType);
         if ( matchResult ) {
            sponsors[i]['matchedOn'] = matchedOn;
            sponsors[i]['matchCount'] = matchCount;
            matchingSponsors.push(sponsors[i]);
        }

    } // end scholarships "for" loop


    ///////////////////////////////////////////////////////////
    // if matches found, build the search results; otherwise, show a message
    ///////////////////////////////////////////////////////////
    if (matchingSponsors.length === 0) {
        document.querySelector('#searchResultsTitle').textContent = 'No results found. Try changing the search criteria for better results.';
        const searchResults = document.querySelector('#searchResults');
        document.querySelector('#searchresultscolumn').removeChild(searchResults);
    } else {
        // sort the matching sponsors by Sponsor Name
        console.log('Before sorting results.');
        matchingSponsors.sort( (a,b) => ( a.SponsorName.localeCompare(b.SponsorName) ));
        console.log('After sorting results.');
        // build "sponsor search results"
        const createResults = buildSponsorSearchResults(matchingSponsors, scholarships, pageNumber, true);
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////
// build the sponsor search results divs
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildSponsorSearchResults(matchingSponsors, scholarships, pageNumber, showMatchingCriteria) {

    // local variables
    let featuredItemsCount = 0;
    let selectedItemSliceBegin = 0;
    let selectedItemSliceEnd = 0;

    // clear any previous search results
    clearSponsorSearchResults();
    document.querySelector('#searchresultsmaintitle').style.display = 'none';
//    if ( document.getElementById('featuredsponsors') != undefined ) {
//        document.getElementById('featuredsponsors').style.display = 'none';
//    };

    // create the main div for column 2 (i.e., the Search Results column)
    const divSearchResultsColumn = document.querySelector('#searchresultscolumn');
    const divSearchResultsDivs = document.createElement('div');
    divSearchResultsDivs.id = 'searchResults';

    ///////////////////////////////////////////////////////////
    // if building the 1st page, show the "featured" items first
    ///////////////////////////////////////////////////////////
    if ( pageNumber === 1 ) {

        const divFeaturedSponsorsBlock = buildFeaturedSponsorsBlock(matchingSponsors, scholarships);
        divSearchResultsColumn.prepend(divFeaturedSponsorsBlock);

    }; // END:  If Page Number = 1, add Featured Item block

    ///////////////////////////////////////////////////////////
    // add the "Matched Items"
    ///////////////////////////////////////////////////////////

    // create the title (with hr break)
    const divMatchedItemsBlockTitle = document.createElement('div');
    divMatchedItemsBlockTitle.classList.add('bodylayout1col2title');
    if ( showMatchingCriteria == true ) {
        divMatchedItemsBlockTitle.textContent = 'Search Results';
    } else {
        divMatchedItemsBlockTitle.textContent = 'Showing All Sponsors';
    }
    divSearchResultsDivs.append(divMatchedItemsBlockTitle);
    const hrMatchedItemsBlockTitleBreak = document.createElement('hr');
    hrMatchedItemsBlockTitleBreak.classList.add('searchresults-subblock-break-hr');
    divSearchResultsDivs.append(hrMatchedItemsBlockTitleBreak);

    // if a specific page number is displayed, extract just the items to be built
    selectedItemSliceBegin =  (pageNumber === 1) ? 0 : (((pageNumber-1) * pageSponsorVolume) - featuredItemsCount);
    selectedItemSliceEnd = (pageNumber * pageSponsorVolume) - featuredItemsCount;
//console.log(`pageNumber: ${pageNumber}; pageSponsorVolume: ${pageSponsorVolume}; featuredItemsCount: ${featuredItemsCount}`);
//console.log(`pull matching sponsors ${selectedItemSliceBegin} to ${selectedItemSliceEnd}`);
    const selectedItems = matchingSponsors.slice( selectedItemSliceBegin, selectedItemSliceEnd);
//console.log(`selectedItems.length: ${selectedItems.length}`);

    // for each selected item, build the initial display with the details hidden
//    for (let [i, selectedSponsor] of selectedSponsors.entries()) {
    for (let selectedItem of selectedItems) {

        // get the matching scholarships for "count" display
        const matchingScholarships = scholarships.filter( function(e) {
            return e.SponsorID == selectedItem['SponsorID'];
        });

        // build a Scholarship Search Result div
        const divItemSearchResult = buildSponsorSearchResultDiv(selectedItem, matchingScholarships.length);
        divSearchResultsDivs.appendChild(divItemSearchResult);

        // //////////////////////////////////////////////////////////////////////
        // // build and add the scholarships block
        // //////////////////////////////////////////////////////////////////////

        // // create the <div> that will contain all the scholarship blocks
        // const divScholarships = document.createElement('div');
        // divScholarships.id = 'scholarshipsFor_' + selectedSponsor['SponsorID'];
        // divScholarships.style.display = "none";  // hidden by default

        // // for each matching scholarship, build the <div>
        // for (let [i, matchingScholarship] of matchingScholarships.entries()) {

        //     const divScholarship = createScholarshipDiv(matchingScholarship);
    
        //     // add the scholarship block to the scholarships <div>
        //     divScholarships.appendChild(divScholarship);

        // };  // End "Matching Scholarships" For Loop

        // // add the scholarships divs to the search results div
        // divSearchResultsDivs.appendChild(divScholarships);

        // add the break line to the search results div
        const hrItemBreak = document.createElement('hr');
        hrItemBreak.classList.add('bodycol2break');
        divSearchResultsDivs.appendChild(hrItemBreak);

        // add all search results divs to the body
        divSearchResultsColumn.appendChild(divSearchResultsDivs);

        ///////////////////////////////////////////////////////////////////////////////
        // post-render scripts (None)
        ///////////////////////////////////////////////////////////////////////////////

    };  // loop to the next Item in the array

    // add the page navigator bar after the results are built
    const buildPageNavResult = buildSponsorPageNavigator(matchingSponsors, scholarships, pageNumber);

    // scroll back to the top of the page
    window.scrollTo(0,0);

};


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the pagination div
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildSponsorPageNavigator(matchingSponsors, scholarships, pageNumberSelected) {

    const numberOfPages = Math.ceil(matchingSponsors.length / pageSponsorVolume);

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
//            clearSponsorSearchCriteria();
            clearSponsorSearchResults();
            buildSponsorSearchResults(matchingSponsors, scholarships, pageNumberToLoad, true);
            window.scrollTo(0,0);
        });

        lnkPageNumber.append(spanPageNumber);
        divPaginationNavBar.append(lnkPageNumber);
        divPaginationNavBar.append(spanPageNumber);

    };

    // add all scholarship search results divs to the body
    divSearchResultsColumn.append(divPaginationNavBar);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// when a user clicks on the "expand/collapse" button for a sponsor, show/hide the details
/////////////////////////////////////////////////////////////////////////////////////////////////
function toggleShowSponsorDetails(buttonID, detailsID) {

    const enableButton = document.querySelector("#" + buttonID);
    const divDetails = document.querySelector("#" + detailsID);

    // if the current display is hidden, then show
    if ( divDetails.style.display !== "inline-block") {
        divDetails.style.display = "inline-block";
        enableButton.classList.remove("fa-chevron-down");
        enableButton.classList.add("fa-chevron-up");

        checkForTextAreaOverflow();

    } else {  // if the current display is shown, then hide
        divDetails.style.display = "none";
        enableButton.classList.remove("fa-chevron-up");
        enableButton.classList.add("fa-chevron-down");
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
// return a formatted <div> of the "Sponsor Summary Block"
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildSponsorSearchResultDiv(selectedSponsor, intScholarships) {

    const divSponsor = document.createElement('div');
    divSponsor.classList.add('row');

    // If the Sponsor is "Featured", change the div styling
    if ( selectedSponsor['SponsorIsFeatured'] ) {
        divSponsor.classList.add('searchresults-mainblock-featured'); /* change background color */
    } else {
        divSponsor.classList.add('searchresults-mainblock');
    };

        /////////////////////////////////////////////////////////////
        // build and add the first column to the first row (Sponsor Logo, and Scholarship Count)
        /////////////////////////////////////////////////////////////
        const divSponsorRow1Col1 = document.createElement('div');
        divSponsorRow1Col1.classList.add('searchresultscol1');

        const imgSponsorLogo = document.createElement('img');
        imgSponsorLogo.src = selectedSponsor['SponsorLogo'];
        imgSponsorLogo.classList.add('sponsorLogo');
        divSponsorRow1Col1.appendChild(imgSponsorLogo);

        // Add "Active Scholarships" count
//        if (intScholarships > 0) {
            const spnScholarshipCount = document.createElement('span');
            spnScholarshipCount.classList.add('scholarshipcount');
            spnScholarshipCount.innerHTML = '<br>Active Scholarships: ' + intScholarships;
            divSponsorRow1Col1.appendChild(spnScholarshipCount);
//        };
    
        divSponsor.appendChild(divSponsorRow1Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column to the first row (show/hide scholarships)
        // DEPRECATED 3/2022 (KK/RB)
        /////////////////////////////////////////////////////////////
//        const divSponsorRow1Col2 = document.createElement('div');
//        divSponsorRow1Col2.classList.add('searchresultscol2');

        // if (intScholarships > 0) {
        //     const iconExpand = document.createElement('i');
        //     iconExpand.id = "iconExpand_" + selectedSponsor['SponsorID'];
        //     iconExpand.classList.add('fas');
        //     iconExpand.classList.add('fa-chevron-down');
        //     iconExpand.addEventListener('click', function() {
        //         toggleShowSponsorDetails(iconExpand.id, 
        //             "scholarshipsFor_" + selectedSponsor['SponsorID']);
        //     });
        //     divSponsorRow1Col2.appendChild(iconExpand);
        // };

//        divSponsor.appendChild(divSponsorRow1Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column to the first row (Sponsor Information)
        /////////////////////////////////////////////////////////////
        const divSponsorRow1Col3 = document.createElement('div');
        divSponsorRow1Col3.classList.add('searchresultscol3');
        divSponsorRow1Col3.classList.add('container');

//        const divSponsorRow1Col3Rows = document.createElement('div');

        ////////////////////////////////////////
        // Build and Add the first row of the third column (Sponsor Name and "Is Featured" badge)
        ////////////////////////////////////////
        const divSponsorRow1Col3Row1 = document.createElement('div');
        divSponsorRow1Col3Row1.classList.add('row');

            ////////////////////////////////////////
            // Sponsor Name
            ////////////////////////////////////////
            const divSponsorRow1Col3Row1Col1 = document.createElement('div');
            divSponsorRow1Col3Row1Col1.classList.add('searchresultscol3A');
            divSponsorRow1Col3Row1Col1.textContent = 'Sponsor:';

        divSponsorRow1Col3Row1.appendChild(divSponsorRow1Col3Row1Col1);

            const divSponsorRow1Col3Row1Col2 = document.createElement('div');
            if ( selectedSponsor['SponsorIsFeatured'] ) { // Allow for "Is Featured" badge
                divSponsorRow1Col3Row1Col2.classList.add('searchresultscol3Bfeatured');
            } else {
                divSponsorRow1Col3Row1Col2.classList.add('searchresultscol3B');
            };
            divSponsorRow1Col3Row1Col2.textContent = selectedSponsor['SponsorName'];

        divSponsorRow1Col3Row1.appendChild(divSponsorRow1Col3Row1Col2);

            ////////////////////////////////////////
            // Sponsor "Is Featured" Flag
            ////////////////////////////////////////
            if ( selectedSponsor['SponsorIsFeatured'] ) {
                const imgSponsorIsFeatured = document.createElement('img');
                imgSponsorIsFeatured.src = "/img/imgFeaturedSponsor.png";
                imgSponsorIsFeatured.alt = "Featured Sponsor Badge";
                imgSponsorIsFeatured.classList.add('featured-sponsor-badge');
                divSponsorRow1Col3Row1.appendChild(imgSponsorIsFeatured);
            };

//        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row1);
            divSponsorRow1Col3.appendChild(divSponsorRow1Col3Row1);

        ////////////////////////////////////////
        // Build and Add the second row of the third column (Sponsor Description)
        ////////////////////////////////////////
        const divSponsorRow1Col3Row2 = document.createElement('div');
        divSponsorRow1Col3Row2.classList.add('row');

            ////////////////////////////////////////
            // Sponsor Description
            ////////////////////////////////////////
            const divSponsorRow1Col3Row2Col1 = document.createElement('div');
            divSponsorRow1Col3Row2Col1.classList.add('searchresultscol3A');
            divSponsorRow1Col3Row2Col1.textContent = 'Description:';

        divSponsorRow1Col3Row2.appendChild(divSponsorRow1Col3Row2Col1);

            const divSponsorRow1Col3Row2Col2 = document.createElement('div');
            if ( selectedSponsor['SponsorIsFeatured'] ) { // Allow for "Is Featured" badge
                divSponsorRow1Col3Row2Col2.classList.add('searchresultscol3Bfeatured');
            } else {
                divSponsorRow1Col3Row2Col2.classList.add('searchresultscol3B');
            };
            divSponsorRow1Col3Row2Col2.classList.add('text-block');
            divSponsorRow1Col3Row2Col2.innerText = selectedSponsor['SponsorDescription'];

        divSponsorRow1Col3Row2.appendChild(divSponsorRow1Col3Row2Col2);

//        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row2);
        divSponsorRow1Col3.appendChild(divSponsorRow1Col3Row2);

        ////////////////////////////////////////
        // Build and Add the third row of the third column (Sponsor Website)
        ////////////////////////////////////////
        const divSponsorRow1Col3Row3 = document.createElement('div');
        divSponsorRow1Col3Row3.classList.add('row');

            ////////////////////////////////////////
            // Sponsor Website
            ////////////////////////////////////////
            const divSponsorRow1Col3Row3Col1 = document.createElement('div');
            divSponsorRow1Col3Row3Col1.classList.add('searchresultscol3A');
            divSponsorRow1Col3Row3Col1.textContent = 'Sponsor Website:';

        divSponsorRow1Col3Row3.appendChild(divSponsorRow1Col3Row3Col1);

            const divSponsorRow1Col3Row3Col2 = document.createElement('div');
            divSponsorRow1Col3Row3Col2.classList.add('searchresultscol3B');
            divSponsorRow1Col3Row3Col2.classList.add('text-link');

            const lnkSponsorWebsite = document.createElement('a');
            lnkSponsorWebsite.id = "lnkSponsorWebsite_" + selectedSponsor['SponsorWebsite'];
            lnkSponsorWebsite.href = selectedSponsor['SponsorWebsite'];
            lnkSponsorWebsite.target = "_blank";
            lnkSponsorWebsite.innerText = selectedSponsor['SponsorWebsite'];
//            lnkSponsorWebsite.classList.add('text-link');
            divSponsorRow1Col3Row3Col2.appendChild(lnkSponsorWebsite);

        divSponsorRow1Col3Row3.appendChild(divSponsorRow1Col3Row3Col2);

//        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row3);
        divSponsorRow1Col3.appendChild(divSponsorRow1Col3Row3);

        ////////////////////////////////////////
        // Build and Add the fourth row of the third column (Sponsor Contact)
        ////////////////////////////////////////
        const divSponsorRow1Col3Row4 = document.createElement('div');
        divSponsorRow1Col3Row4.classList.add('row');

            ////////////////////////////////////////
            // Contact Info
            ////////////////////////////////////////
            const divSponsorRow1Col3Row4Col1 = document.createElement('div');
            divSponsorRow1Col3Row4Col1.classList.add('searchresultscol3A');
            divSponsorRow1Col3Row4Col1.textContent = 'Contact Info:';

        divSponsorRow1Col3Row4.appendChild(divSponsorRow1Col3Row4Col1);

            const divSponsorRow1Col3Row4Col2 = document.createElement('div');
            divSponsorRow1Col3Row4Col2.classList.add('searchresultscol3B');
            divSponsorRow1Col3Row4Col2.classList.add('text-block');
            divSponsorRow1Col3Row4Col2.innerHTML = selectedSponsor['SponsorContactInfoFormatted'];

        divSponsorRow1Col3Row4.appendChild(divSponsorRow1Col3Row4Col2);

//        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row4);
        divSponsorRow1Col3.appendChild(divSponsorRow1Col3Row4);
    
//        divSponsorRow1Col3.appendChild(divSponsorRow1Col3Rows);

        ////////////////////////////////////////
        // Build and Add the "View Scholarships" link, if any active scholarships exist
        ////////////////////////////////////////

        if ( intScholarships > 0 ) { // display the link if there are active scholarships

            // "View Scholarships" button
            const lnkViewScholarships = document.createElement('a');
            lnkViewScholarships.id = "lnkViewScholarships_" + selectedSponsor['SponsorID'];
            lnkViewScholarships.classList.add('sponsor-view-scholarships');
            lnkViewScholarships.href = "scholarships?sponsorid=" + selectedSponsor['SponsorID'];
            lnkViewScholarships.target = "_blank";

            const imgViewScholarships = document.createElement('img');
            imgViewScholarships.src = "/img/imgViewScholarships.png";
            imgViewScholarships.alt = "View Scholarship(s) for this Sponsor";
            imgViewScholarships.classList.add('sponsor-view-scholarships-img');
            lnkViewScholarships.appendChild(imgViewScholarships);

            divSponsorRow1Col3.appendChild(lnkViewScholarships);

        } else {

            const imgNoActiveScholarships = document.createElement('img');
            imgNoActiveScholarships.src = "/img/imgNoActiveScholarships.png";
            imgNoActiveScholarships.alt = "No Active Scholarships for this Sponsor";
            imgNoActiveScholarships.classList.add('sponsor-no-scholarships-img');
    
            divSponsorRow1Col3.appendChild(imgNoActiveScholarships);
    
        };

    divSponsor.appendChild(divSponsorRow1Col3);

    return divSponsor;
}


/////////////////////////////////////////////////////////////////////////////////////////////////
// return a formatted <div> of the "Scholarship Summary Block" for all Scholarships
/////////////////////////////////////////////////////////////////////////////////////////////////

function createScholarshipDiv(scholarship) {

    const divScholarship = document.createElement('div');

    // If the Sponsor or Scholarship is "Featured", change the div styling
    if ( scholarship['SponsorIsFeatured'] || scholarship['ScholarshipIsFeatured'] ) {
        divScholarship.classList.add('searchresults-mainblock-featured'); /* change background color */
    } else {
        divScholarship.classList.add('searchresults-mainblock');
    };

        //////////////////////////////////////////////////////////////////////
        // build the first row of the scholarship summary (the dividing line)
        //////////////////////////////////////////////////////////////////////
        const divScholarshipRow1 = document.createElement('div');
        divScholarshipRow1.classList.add('row');
        divScholarshipRow1.classList.add('searchresults-subblock-break');

            /////////////////////////////////////////////////////////////
            // build and add the first column to the first row (blank, to avoid repeating Sponsor Logo)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow1Col1 = document.createElement('div');
            divScholarshipRow1Col1.classList.add('searchresultscol1');
            divScholarshipRow1.appendChild(divScholarshipRow1Col1);

            /////////////////////////////////////////////////////////////
            // build and add the second column to the first row (blank, to avoid repeating show/hide chevron)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow1Col2 = document.createElement('div');
            divScholarshipRow1Col2.classList.add('searchresultscol2');
            divScholarshipRow1.appendChild(divScholarshipRow1Col2);

            /////////////////////////////////////////////////////////////
            // build and add the third column to the first row (preceding scholarship breaking line)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow1Col3 = document.createElement('div');
            divScholarshipRow1Col3.classList.add('searchresultscol3');
            const hrScholarshipBreak = document.createElement('hr');
            hrScholarshipBreak.classList.add('searchresults-subblock-break-hr');
            divScholarshipRow1Col3.appendChild(hrScholarshipBreak);
            divScholarshipRow1.appendChild(divScholarshipRow1Col3);

        divScholarship.appendChild(divScholarshipRow1);

    //////////////////////////////////////////////////////////////////////
    // build the second row of the scholarship summary (Scholarship Name)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow2 = document.createElement('div');
    divScholarshipRow2.classList.add('row');
     divScholarshipRow2.classList.add('searchresults-subblock');

        /////////////////////////////////////////////////////////////
        // build and add the first column (blank, to avoid repeating Sponsor Logo)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow2Col1 = document.createElement('div');
        divScholarshipRow2Col1.classList.add('searchresultscol1');
        divScholarshipRow2.appendChild(divScholarshipRow2Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow2Col2 = document.createElement('div');
        divScholarshipRow2Col2.classList.add('searchresultscol2');
        divScholarshipRow2.appendChild(divScholarshipRow2Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column (Scholarship Name) in a single row
        /////////////////////////////////////////////////////////////
        const divScholarshipRow2Col3 = document.createElement('div');
        divScholarshipRow2Col3.classList.add('searchresultscol3');
        divScholarshipRow2Col3.classList.add('container');

        const divScholarshipRow2Col3Row1 = document.createElement('div');
        divScholarshipRow2Col3Row1.classList.add('row');

            /////////////////////////////////////////
            // build and add the third column (3A) (Scholarship Name Label)
            /////////////////////////////////////////
            const divScholarshipRow2Col3A = document.createElement('div');
            divScholarshipRow2Col3A.classList.add('searchresultscol3A');
            divScholarshipRow2Col3A.textContent = 'Scholarship Name:';
            divScholarshipRow2Col3Row1.appendChild(divScholarshipRow2Col3A);

            /////////////////////////////////////////////////////////////
            // build and add the fourth column (3B) (Scholarship Name Text)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow2Col3B = document.createElement('div');
            // If the Scholarship is "Featured", change the div styling (shorten the text)
            if ( scholarship['ScholarshipIsFeatured'] ) {
                divScholarshipRow2Col3B.classList.add('searchresultscol3Bfeatured');
            } else {
                divScholarshipRow2Col3B.classList.add('searchresultscol3B');
            };
            divScholarshipRow2Col3B.textContent = scholarship['ScholarshipName'];
            divScholarshipRow2Col3Row1.appendChild(divScholarshipRow2Col3B);

            ////////////////////////////////////////
            // "Is Featured" Badge
            ////////////////////////////////////////
            if ( scholarship['ScholarshipIsFeatured'] ) {
                const imgScholarshipIsFeatured = document.createElement('img');
                imgScholarshipIsFeatured.src = "/img/imgFeaturedScholarship.png";
                imgScholarshipIsFeatured.alt = "Featured Scholarship Badge";
                imgScholarshipIsFeatured.classList.add('featured-scholarship-badge');
                divScholarshipRow2Col3Row1.appendChild(imgScholarshipIsFeatured);
            };

        divScholarshipRow2Col3.appendChild(divScholarshipRow2Col3Row1);
        divScholarshipRow2.appendChild(divScholarshipRow2Col3);
        divScholarship.appendChild(divScholarshipRow2);

    //////////////////////////////////////////////////////////////////////
    // build the third row of the scholarship summary (Scholarship Type)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow3 = document.createElement('div');
    divScholarshipRow3.classList.add('row');
    divScholarshipRow3.classList.add('searchresults-subblock');

        /////////////////////////////////////////////////////////////
        // build and add the first column (blank, to avoid repeating Sponsor Logo)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow3Col1 = document.createElement('div');
        divScholarshipRow3Col1.classList.add('searchresultscol1');
        divScholarshipRow3.appendChild(divScholarshipRow3Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow3Col2 = document.createElement('div');
        divScholarshipRow3Col2.classList.add('searchresultscol2');
        divScholarshipRow3.appendChild(divScholarshipRow3Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column (Scholarship Type) in a single row
        /////////////////////////////////////////////////////////////
        const divScholarshipRow3Col3 = document.createElement('div');
        divScholarshipRow3Col3.classList.add('searchresultscol3');
        divScholarshipRow3Col3.classList.add('container');

        const divScholarshipRow3Col3Row1 = document.createElement('div');
        divScholarshipRow3Col3Row1.classList.add('row');

            /////////////////////////////////////////
            // build and add the third column (3A) (Scholarship Type Label)
            /////////////////////////////////////////
            const divScholarshipRow3Col3A = document.createElement('div');
            divScholarshipRow3Col3A.classList.add('searchresultscol3A');
            divScholarshipRow3Col3A.textContent = 'Scholarship Type:';
            divScholarshipRow3Col3Row1.appendChild(divScholarshipRow3Col3A);

            /////////////////////////////////////////////////////////////
            // build and add the fourth column (3B) (Scholarship Type Text)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow3Col3B = document.createElement('div');
            // If the Scholarship is "Featured", change the div styling (shorten the text)
            if ( scholarship['ScholarshipIsFeatured'] ) {
                divScholarshipRow3Col3B.classList.add('searchresultscol3Bfeatured');
            } else {
                divScholarshipRow3Col3B.classList.add('searchresultscol3B');
            };
//            divScholarshipRow3Col3B.classList.add('searchresultscol3B');
            divScholarshipRow3Col3B.textContent = scholarship['Criteria_FieldOfStudyText'];
            divScholarshipRow3Col3Row1.appendChild(divScholarshipRow3Col3B);

        divScholarshipRow3Col3.appendChild(divScholarshipRow3Col3Row1);
        divScholarshipRow3.appendChild(divScholarshipRow3Col3);
        divScholarship.appendChild(divScholarshipRow3);

    //////////////////////////////////////////////////////////////////////
    // build the fourth row of the scholarship summary (Award Info)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow4 = document.createElement('div');
    divScholarshipRow4.classList.add('row');
    divScholarshipRow4.classList.add('searchresults-subblock');

        /////////////////////////////////////////////////////////////
        // build and add the first column (blank, to avoid repeating Sponsor Logo)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow4Col1 = document.createElement('div');
        divScholarshipRow4Col1.classList.add('searchresultscol1');
        divScholarshipRow4.appendChild(divScholarshipRow4Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow4Col2 = document.createElement('div');
        divScholarshipRow4Col2.classList.add('searchresultscol2');
        divScholarshipRow4.appendChild(divScholarshipRow4Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column (Award) in a single row
        /////////////////////////////////////////////////////////////
        const divScholarshipRow4Col3 = document.createElement('div');
        divScholarshipRow4Col3.classList.add('searchresultscol3');
        divScholarshipRow4Col3.classList.add('container');

        const divScholarshipRow4Col3Row1 = document.createElement('div');
        divScholarshipRow4Col3Row1.classList.add('row');

            /////////////////////////////////////////
            // build and add the third column (3A) (Award Label)
            /////////////////////////////////////////
            const divScholarshipRow4Col3A = document.createElement('div');
            divScholarshipRow4Col3A.classList.add('searchresultscol3A');
            divScholarshipRow4Col3A.textContent = 'Award(s):';
            divScholarshipRow4Col3Row1.appendChild(divScholarshipRow4Col3A);

            /////////////////////////////////////////////////////////////
            // build and add the fourth column (3B) (Award Text)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow4Col3B = document.createElement('div');
            divScholarshipRow4Col3B.classList.add('searchresultscol3B');
            divScholarshipRow4Col3B.textContent = scholarship['ScholarshipAward'];
            divScholarshipRow4Col3Row1.appendChild(divScholarshipRow4Col3B);

        divScholarshipRow4Col3.appendChild(divScholarshipRow4Col3Row1);
        divScholarshipRow4.appendChild(divScholarshipRow4Col3);
        divScholarship.appendChild(divScholarshipRow4);

    //////////////////////////////////////////////////////////////////////
    // build the fifth row of the scholarship summary (Scholarship Description)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow5 = document.createElement('div');
    divScholarshipRow5.classList.add('row');
    divScholarshipRow5.classList.add('searchresults-subblock');

        /////////////////////////////////////////////////////////////
        // build and add the first column
        /////////////////////////////////////////////////////////////
        const divScholarshipRow5Col1 = document.createElement('div');
        divScholarshipRow5Col1.classList.add('searchresultscol1');

        // Add "Female Applicants Only" marker
        if (scholarship['Criteria_FemaleApplicantsOnly_Text'].length > 0) {
                const spnFemaleApplicantsOnly = document.createElement('span');
                spnFemaleApplicantsOnly.classList.add('femaleapplicantsonly');
                spnFemaleApplicantsOnly.textContent = scholarship['Criteria_FemaleApplicantsOnly_Text'];
                divScholarshipRow5Col1.appendChild(spnFemaleApplicantsOnly);
        };

        divScholarshipRow5.appendChild(divScholarshipRow5Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow5Col2 = document.createElement('div');
        divScholarshipRow5Col2.classList.add('searchresultscol2');
        divScholarshipRow5.appendChild(divScholarshipRow5Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column (Scholarship Description) in a single row
        /////////////////////////////////////////////////////////////
        const divScholarshipRow5Col3 = document.createElement('div');
        divScholarshipRow5Col3.classList.add('searchresultscol3');
        divScholarshipRow5Col3.classList.add('container');

        const divScholarshipRow5Col3Row1 = document.createElement('div');
        divScholarshipRow5Col3Row1.classList.add('row');

            /////////////////////////////////////////
            // build and add the third column (3A) (Scholarship Description Label)
            /////////////////////////////////////////
            const divScholarshipRow5Col3A = document.createElement('div');
            divScholarshipRow5Col3A.classList.add('searchresultscol3A');
            divScholarshipRow5Col3A.textContent = 'Description:';
            divScholarshipRow5Col3Row1.appendChild(divScholarshipRow5Col3A);

            /////////////////////////////////////////////////////////////
            // build and add the fourth column (3B) (Scholarship Description Text)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow5Col3B = document.createElement('div');
            divScholarshipRow5Col3B.classList.add('searchresultscol3B');
            divScholarshipRow5Col3B.classList.add('text-block');

            const spanScholarshipDescription = document.createElement('span');
            spanScholarshipDescription.id = 'spanScholarshipDesc_' + scholarship['ScholarshipID'];
            spanScholarshipDescription.classList.add('description-short');
            spanScholarshipDescription.innerHTML = scholarship['ScholarshipDescription'];
            divScholarshipRow5Col3B.appendChild(spanScholarshipDescription);
    
            const iconDescExpand = document.createElement('i');
            iconDescExpand.id = "iconDescExpand_" + scholarship['ScholarshipID'];
            iconDescExpand.classList.add('fas');
            iconDescExpand.classList.add('fa-chevron-down');
            iconDescExpand.addEventListener('click', function() {
                toggleShowScholarshipDescDetails(iconDescExpand.id, spanScholarshipDescription.id);
            });
            divScholarshipRow5Col3B.appendChild(iconDescExpand);

            divScholarshipRow5Col3Row1.appendChild(divScholarshipRow5Col3B);

        divScholarshipRow5Col3.appendChild(divScholarshipRow5Col3Row1);
        divScholarshipRow5.appendChild(divScholarshipRow5Col3);

    divScholarship.appendChild(divScholarshipRow5);

    //////////////////////////////////////////////////////////////////////
    // Return the formatted <div> element
    //////////////////////////////////////////////////////////////////////
    return divScholarship;

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
// when a text block description is rendered, check for overflow and show/hide the chevron
/////////////////////////////////////////////////////////////////////////////////////////////////
function checkForTextAreaOverflow() {

    // for all "Scholarship Description" divs, if the text does not overflow, hide the chevron
    const scholarshipDescriptions = document.querySelectorAll('[id^=spanScholarshipDesc]');
//alert('scholarship blocks found: ' + scholarshipDescriptions.length);
    let scholarshipID = '';
    let spanID = '';
    for (var i=0; i < scholarshipDescriptions.length; i++) {
        spanID = scholarshipDescriptions[i].id;
        scholarshipID = spanID.split("_").pop();
//alert('scholarshipDescriptions[i].clientHeight: ' + scholarshipDescriptions[i].clientHeight);
//alert('scholarshipDescriptions[i].scrollHeight: ' + scholarshipDescriptions[i].scrollHeight);
        if ( scholarshipDescriptions[i].clientHeight >= scholarshipDescriptions[i].scrollHeight ) {
//            alert('scholarship ' + scholarshipID + ' overflows');
            document.getElementById('iconDescExpand_' + scholarshipID).style.display = 'none';
        };
    };

}


//////////////////////////////////////////////////////////////////////////////////////////
// process Search Criteria submission
//////////////////////////////////////////////////////////////////////////////////////////
function searchSponsors(sponsors, scholarships) {

    // clear any previous search results
    clearSponsorSearchResults();

    // validate the input values
    const dataAreValidated = validateSponsorSearchCriteria();
    if ( dataAreValidated ) {
        // validation passed => find and display sponsors
        findMatchingSponsors(sponsors, scholarships, 1);
    };

}


//////////////////////////////////////////////////////////////////////////////////////////
// validate Search Criteria
//////////////////////////////////////////////////////////////////////////////////////////
function validateSponsorSearchCriteria() {

    let errorCount = 0;

// TODO: Move all validation from "sponsor_crud_tabs.ejs"  to here
/*
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
  */
    if ( errorCount == 0 ) {
        return true;
    } else {
        return false;
    }

}


//////////////////////////////////////////////////////////////////////////////////////////
// on the data mgmt forms, show/hide the "Edit" or "Preview" tab, as indicated
//////////////////////////////////////////////////////////////////////////////////////////
function openSponsorTab(evt, tabName) {
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

    // Build the sponsor preview DIV
    if ( tabName === 'tabPreview') {
        // Clear any status messages
        if ( document.getElementById('statusMessage') ) {
            document.getElementById('statusMessage').innerText = '';
        };
        const divSponsorPreview = buildSponsorSearchResultDiv(sponsorData, sponsorData['ScholarshipCountActive']);
        document.getElementById('tabPreview').replaceChildren(divSponsorPreview);
        document.getElementById('iconExpand_undefined').classList.remove('fa-chevron-down');
    };

  } 
