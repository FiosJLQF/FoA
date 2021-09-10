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
    console.log('Before sorting results.');
    sponsors.sort( (a,b) => ( a.SponsorName.localeCompare(b.SponsorName) ));
    console.log('After sorting results.');
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
    const searchResults = document.querySelector('#searchResults');
    if (searchResults !== null) {
        document.querySelector('#sponsorsearchresultscolumn').removeChild(searchResults);
        document.querySelector('#sponsorsearchresultscolumn').removeChild(pagination);
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
        document.querySelector('#sponsorsearchresultscolumn').removeChild(searchResults);
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

    // clear any previous search results
    clearSponsorSearchResults();
    if ( showMatchingCriteria == true ) {
        document.querySelector('#searchResultsTitle').textContent = 'Search Results:';
    } else {
        document.querySelector('#searchResultsTitle').textContent = 'Showing All Sponsors';
    }

    // if a specific page number is displayed, extract just the scholarships to be built
    const selectedSponsors = matchingSponsors.slice(
        (pageNumber-1) * pageSponsorVolume,
        pageNumber * pageSponsorVolume);

    // reset the column for "search results"
    var divSearchResultsColumn = document.querySelector('#sponsorsearchresultscolumn');
    var divSearchResultsDivs = document.createElement('div');
    divSearchResultsDivs.id = 'searchResults';

    // for each selected sponsor, build the initial display with the details hidden
    for (let [i, selectedSponsor] of selectedSponsors.entries()) {

        //////////////////////////////////////////////////////////////////////
        // create a subset of the scholarships for the selected Sponsor
        //////////////////////////////////////////////////////////////////////
        const matchingScholarships = scholarships.filter( function(e) {
            return e.SponsorID == selectedSponsor['SponsorID'];
        });

        //////////////////////////////////////////////////////////////////////
        // build and add the sponsor summary block
        //////////////////////////////////////////////////////////////////////
        const divSponsor = createSponsorSummaryDiv(selectedSponsor, matchingScholarships.length);
        divSearchResultsDivs.appendChild(divSponsor);

        //////////////////////////////////////////////////////////////////////
        // build and add the scholarships block
        //////////////////////////////////////////////////////////////////////

        // create the <div> that will contain all the scholarship blocks
        const divScholarships = document.createElement('div');
        divScholarships.id = 'scholarshipsFor_' + selectedSponsor['SponsorID'];
        divScholarships.style.display = "none";  // hidden by default

        // for each matching scholarship, build the <div>
        for (let [i, matchingScholarship] of matchingScholarships.entries()) {

            const divScholarship = createScholarshipDiv(matchingScholarship);
    
            // add the scholarship block to the scholarships <div>
            divScholarships.appendChild(divScholarship);

        };  // End "Matching Scholarships" For Loop

        // add the scholarships divs to the search results div
        divSearchResultsDivs.appendChild(divScholarships);

        // add the sponsor break line to the search results div
        const hrSponsorBreak = document.createElement('hr');
        hrSponsorBreak.classList.add('bodycol2sponsorbreak');
        divSearchResultsDivs.appendChild(hrSponsorBreak);

    };  // End "Sponsor" For Loop

    //////////////////////////////////////////////////////////////////////
    // close and add all sponsor and scholarships blocks to the search results column
    //////////////////////////////////////////////////////////////////////
    divSearchResultsColumn.appendChild(divSearchResultsDivs);

    //////////////////////////////////////////////////////////////////////
    // add the page navigator bar after the results are built
    //////////////////////////////////////////////////////////////////////
    const buildPageNavResult = buildPageNavigator(matchingSponsors, scholarships, pageNumber);

    // scroll back to the top of the page
    window.scrollTo(0,0);

};


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the pagination div
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildPageNavigator(matchingSponsors, scholarships, pageNumberSelected) {

    const numberOfPages = Math.ceil(matchingSponsors.length / pageSponsorVolume);

    // find the "parent" div to which to add the pagination controls
    const divSearchResultsColumn = document.querySelector('#sponsorsearchresultscolumn');
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
//            clearSponsorSearchCriteria();
            clearSponsorSearchResults();
            buildSponsorSearchResults(matchingSponsors, scholarships, pageNumberToLoad, true);
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

        checkForOverflow();

    } else {  // if the current display is shown, then hide
        divDetails.style.display = "none";
        enableButton.classList.remove("fa-chevron-up");
        enableButton.classList.add("fa-chevron-down");
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
/*
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
*/
/////////////////////////////////////////////////////////////////////////////////////////////////
// return a formatted <div> of the "Sponsor Summary Block"
/////////////////////////////////////////////////////////////////////////////////////////////////
function createSponsorSummaryDiv(selectedSponsor, intScholarships) {

    const divSponsor = document.createElement('div');
    divSponsor.classList.add('row');
    divSponsor.classList.add('sponsorSearchResultsSummaryRow');

        /////////////////////////////////////////////////////////////
        // build and add the first column to the first row (Sponsor Logo and Scholarship Count)
        /////////////////////////////////////////////////////////////
        const divSponsorRow1Col1 = document.createElement('div');
        divSponsorRow1Col1.classList.add('sponsorsearchresultscol1');

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
        /////////////////////////////////////////////////////////////
        const divSponsorRow1Col2 = document.createElement('div');
        divSponsorRow1Col2.classList.add('sponsorsearchresultscol2');

        if (intScholarships > 0) {
            const iconExpand = document.createElement('i');
            iconExpand.id = "iconExpand_" + selectedSponsor['SponsorID'];
            iconExpand.classList.add('fas');
            iconExpand.classList.add('fa-chevron-down');
            iconExpand.addEventListener('click', function() {
                toggleShowSponsorDetails(iconExpand.id, 
                    "scholarshipsFor_" + selectedSponsor['SponsorID']);
            });
            divSponsorRow1Col2.appendChild(iconExpand);
        };

        divSponsor.appendChild(divSponsorRow1Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column to the first row (Sponsor Information)
        /////////////////////////////////////////////////////////////
        const divSponsorRow1Col3 = document.createElement('div');
        divSponsorRow1Col3.classList.add('sponsorsearchresultscol3');
        divSponsorRow1Col3.classList.add('container');
        const divSponsorRow1Col3Rows = document.createElement('div');
        divSponsorRow1Col3Rows.classList.add('row');

            ////////////////////////////////////////
            // Sponsor Name
            ////////////////////////////////////////
            const divSponsorRow1Col3Row1Col1 = document.createElement('div');
            divSponsorRow1Col3Row1Col1.classList.add('sponsorsearchresultscol3A');
            divSponsorRow1Col3Row1Col1.textContent = 'Sponsor:';

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row1Col1);

            const divSponsorRow1Col3Row1Col2 = document.createElement('div');
            divSponsorRow1Col3Row1Col2.classList.add('sponsorsearchresultscol3B');
            divSponsorRow1Col3Row1Col2.textContent = selectedSponsor['SponsorName'];

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row1Col2);

            ////////////////////////////////////////
            // Sponsor Description
            ////////////////////////////////////////
            const divSponsorRow1Col3Row2Col1 = document.createElement('div');
            divSponsorRow1Col3Row2Col1.classList.add('sponsorsearchresultscol3A');
            divSponsorRow1Col3Row2Col1.textContent = 'Description:';

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row2Col1);

            const divSponsorRow1Col3Row2Col2 = document.createElement('div');
            divSponsorRow1Col3Row2Col2.classList.add('sponsorsearchresultscol3B');
            divSponsorRow1Col3Row2Col2.classList.add('text-block');
//            divSponsorRow1Col3Row2Col2.classList.add('description-short');
            divSponsorRow1Col3Row2Col2.innerText = selectedSponsor['SponsorDescription'];

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row2Col2);

            ////////////////////////////////////////
            // Sponsor Website
            ////////////////////////////////////////
            const divSponsorRow1Col3Row3Col1 = document.createElement('div');
            divSponsorRow1Col3Row3Col1.classList.add('sponsorsearchresultscol3A');
            divSponsorRow1Col3Row3Col1.textContent = 'Sponsor Website:';

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row3Col1);

            const divSponsorRow1Col3Row3Col2 = document.createElement('div');
            divSponsorRow1Col3Row3Col2.classList.add('sponsorsearchresultscol3B');
            const lnkSponsorWebsite = document.createElement('a');
            lnkSponsorWebsite.id = "lnkSponsorWebsite_" + selectedSponsor['SponsorWebsite'];
            lnkSponsorWebsite.href = selectedSponsor['SponsorWebsite'];
            lnkSponsorWebsite.target = "_blank";
            lnkSponsorWebsite.innerText = selectedSponsor['SponsorWebsite'];
            lnkSponsorWebsite.classList.add('text-link');

            divSponsorRow1Col3Row3Col2.appendChild(lnkSponsorWebsite);

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row3Col2);

            ////////////////////////////////////////
            // Contact Info
            ////////////////////////////////////////
            const divSponsorRow1Col3Row4Col1 = document.createElement('div');
            divSponsorRow1Col3Row4Col1.classList.add('sponsorsearchresultscol3A');
            divSponsorRow1Col3Row4Col1.textContent = 'Contact Info:';

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row4Col1);

            const divSponsorRow1Col3Row4Col2 = document.createElement('div');
            divSponsorRow1Col3Row4Col2.classList.add('sponsorsearchresultscol3B');
            divSponsorRow1Col3Row4Col2.classList.add('text-block');
            divSponsorRow1Col3Row4Col2.innerHTML = selectedSponsor['SponsorContactInfoFormatted'];

        divSponsorRow1Col3Rows.appendChild(divSponsorRow1Col3Row4Col2);

        divSponsorRow1Col3.appendChild(divSponsorRow1Col3Rows);

    divSponsor.appendChild(divSponsorRow1Col3);

    return divSponsor;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// return a formatted <div> of the "Scholarship Summary Block" for all Scholarships
/////////////////////////////////////////////////////////////////////////////////////////////////

function createScholarshipDiv(scholarship) {

        const divScholarship = document.createElement('div');

        //////////////////////////////////////////////////////////////////////
        // build the first row of the scholarship summary (the dividing line)
        //////////////////////////////////////////////////////////////////////
        const divScholarshipRow1 = document.createElement('div');
        divScholarshipRow1.classList.add('row');
        divScholarshipRow1.classList.add('scholarshipSearchResultsSummaryRow');

            /////////////////////////////////////////////////////////////
            // build and add the first column to the first row (blank, to avoid repeating Sponsor Logo)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow1Col1 = document.createElement('div');
            divScholarshipRow1Col1.classList.add('sponsorsearchresultscol1');
            divScholarshipRow1.appendChild(divScholarshipRow1Col1);

            /////////////////////////////////////////////////////////////
            // build and add the second column to the first row (blank, to avoid repeating show/hide chevron)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow1Col2 = document.createElement('div');
            divScholarshipRow1Col2.classList.add('sponsorsearchresultscol2');
            divScholarshipRow1.appendChild(divScholarshipRow1Col2);

            /////////////////////////////////////////////////////////////
            // build and add the third column to the first row (preceding scholarship breaking line)
            /////////////////////////////////////////////////////////////
            const divScholarshipRow1Col3 = document.createElement('div');
            divScholarshipRow1Col3.classList.add('sponsorsearchresultscol3');
            const hrScholarshipBreak = document.createElement('hr');
            hrScholarshipBreak.classList.add('bodycol2scholarshipbreak');
            divScholarshipRow1Col3.appendChild(hrScholarshipBreak);
            divScholarshipRow1.appendChild(divScholarshipRow1Col3);

        divScholarship.appendChild(divScholarshipRow1);

    //////////////////////////////////////////////////////////////////////
    // build the second row of the scholarship summary (Scholarship Name)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow2 = document.createElement('div');
    divScholarshipRow2.classList.add('row');
    divScholarshipRow2.classList.add('scholarshipSearchResultsSummaryRow');

        /////////////////////////////////////////////////////////////
        // build and add the first column to the second row (blank, to avoid repeating Sponsor Logo)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow2Col1 = document.createElement('div');
        divScholarshipRow2Col1.classList.add('sponsorsearchresultscol1');
        divScholarshipRow2.appendChild(divScholarshipRow2Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column to the second row (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow2Col2 = document.createElement('div');
        divScholarshipRow2Col2.classList.add('sponsorsearchresultscol2');
        divScholarshipRow2.appendChild(divScholarshipRow2Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column to the second row (Scholarship Name Label)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow2Col3 = document.createElement('div');
        divScholarshipRow2Col3.classList.add('sponsorsearchresultscol3');
        divScholarshipRow2Col3.classList.add('sponsorsearchresultscol3A');
        divScholarshipRow2Col3.textContent = 'Scholarship Name:';
        divScholarshipRow2.appendChild(divScholarshipRow2Col3);

        /////////////////////////////////////////////////////////////
        // build and add the fourth column to the second row (Scholarship Name Text)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow2Col4 = document.createElement('div');
        divScholarshipRow2Col4.classList.add('sponsorsearchresultscol4');
        divScholarshipRow2Col4.textContent = scholarship['ScholarshipName'];
        divScholarshipRow2.appendChild(divScholarshipRow2Col4);

        divScholarship.appendChild(divScholarshipRow2);

    //////////////////////////////////////////////////////////////////////
    // build the third row of the scholarship summary (Scholarship Type)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow3 = document.createElement('div');
    divScholarshipRow3.classList.add('row');
    divScholarshipRow3.classList.add('scholarshipSearchResultsSummaryRow');

        /////////////////////////////////////////////////////////////
        // build and add the first column (blank, to avoid repeating Sponsor Logo)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow3Col1 = document.createElement('div');
        divScholarshipRow3Col1.classList.add('sponsorsearchresultscol1');
        divScholarshipRow3.appendChild(divScholarshipRow3Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow3Col2 = document.createElement('div');
        divScholarshipRow3Col2.classList.add('sponsorsearchresultscol2');
        divScholarshipRow3.appendChild(divScholarshipRow3Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column (Scholarship Type Label)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow3Col3 = document.createElement('div');
        divScholarshipRow3Col3.classList.add('sponsorsearchresultscol3');
        divScholarshipRow3Col3.classList.add('sponsorsearchresultscol3A');
        divScholarshipRow3Col3.textContent = 'Scholarship Type:';
        divScholarshipRow3.appendChild(divScholarshipRow3Col3);

        /////////////////////////////////////////////////////////////
        // build and add the fourth column  (Scholarship Type Text)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow3Col4 = document.createElement('div');
        divScholarshipRow3Col4.classList.add('sponsorsearchresultscol4');
        divScholarshipRow3Col4.textContent = scholarship['Criteria_FieldOfStudyText'];
        divScholarshipRow3.appendChild(divScholarshipRow3Col4);

        divScholarship.appendChild(divScholarshipRow3);

    //////////////////////////////////////////////////////////////////////
    // build the fourth row of the scholarship summary (Award Info)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow4 = document.createElement('div');
    divScholarshipRow4.classList.add('row');
    divScholarshipRow4.classList.add('scholarshipSearchResultsSummaryRow');

        /////////////////////////////////////////////////////////////
        // build and add the first column (blank, to avoid repeating Sponsor Logo)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow4Col1 = document.createElement('div');
        divScholarshipRow4Col1.classList.add('sponsorsearchresultscol1');
        divScholarshipRow4.appendChild(divScholarshipRow4Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow4Col2 = document.createElement('div');
        divScholarshipRow4Col2.classList.add('sponsorsearchresultscol2');
        divScholarshipRow4.appendChild(divScholarshipRow4Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column (Award Label)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow4Col3 = document.createElement('div');
        divScholarshipRow4Col3.classList.add('sponsorsearchresultscol3');
        divScholarshipRow4Col3.classList.add('sponsorsearchresultscol3A');
        divScholarshipRow4Col3.textContent = 'Award(s):';
        divScholarshipRow4.appendChild(divScholarshipRow4Col3);

        /////////////////////////////////////////////////////////////
        // build and add the fourth column (Award Text)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow4Col4 = document.createElement('div');
        divScholarshipRow4Col4.classList.add('sponsorsearchresultscol4');
        divScholarshipRow4Col4.textContent = scholarship['ScholarshipAward'];
        divScholarshipRow4.appendChild(divScholarshipRow4Col4);

        divScholarship.appendChild(divScholarshipRow4);

    //////////////////////////////////////////////////////////////////////
    // build the fifth row of the scholarship summary (Scholarship Description)
    //////////////////////////////////////////////////////////////////////
    const divScholarshipRow5 = document.createElement('div');
    divScholarshipRow5.classList.add('row');
    divScholarshipRow5.classList.add('scholarshipSearchResultsSummaryRow');

        /////////////////////////////////////////////////////////////
        // build and add the first column
        /////////////////////////////////////////////////////////////
        const divScholarshipRow5Col1 = document.createElement('div');
        divScholarshipRow5Col1.classList.add('sponsorsearchresultscol1');

        // Add "Female Applicants Only" marker
        if (scholarship['Criteria_Gender_FemaleOnly'].length > 0) {
                const spnFemaleApplicantsOnly = document.createElement('span');
                spnFemaleApplicantsOnly.classList.add('femaleapplicantsonly');
                spnFemaleApplicantsOnly.textContent = scholarship['Criteria_Gender_FemaleOnly'];
                divScholarshipRow5Col1.appendChild(spnFemaleApplicantsOnly);
        };

        divScholarshipRow5.appendChild(divScholarshipRow5Col1);

        /////////////////////////////////////////////////////////////
        // build and add the second column (blank, to avoid repeating show/hide chevron)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow5Col2 = document.createElement('div');
        divScholarshipRow5Col2.classList.add('sponsorsearchresultscol2');
        divScholarshipRow5.appendChild(divScholarshipRow5Col2);

        /////////////////////////////////////////////////////////////
        // build and add the third column (Scholarship Description Label)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow5Col3 = document.createElement('div');
        divScholarshipRow5Col3.classList.add('sponsorsearchresultscol3');
        divScholarshipRow5Col3.classList.add('sponsorsearchresultscol3A');
        divScholarshipRow5Col3.textContent = 'Description:';
        divScholarshipRow5.appendChild(divScholarshipRow5Col3);

        /////////////////////////////////////////////////////////////
        // build and add the fourth column (Scholarship Description Text)
        /////////////////////////////////////////////////////////////
        const divScholarshipRow5Col4 = document.createElement('div');
        divScholarshipRow5Col4.classList.add('sponsorsearchresultscol4');
        divScholarshipRow5Col4.classList.add('text-block');

        const spanScholarshipDescription = document.createElement('span');
        spanScholarshipDescription.id = 'spanScholarshipDesc_' + scholarship['ScholarshipID'];
        spanScholarshipDescription.classList.add('description-short');
        spanScholarshipDescription.innerText = scholarship['ScholarshipDescription'];
        divScholarshipRow5Col4.appendChild(spanScholarshipDescription);

        const iconDescExpand = document.createElement('i');
        iconDescExpand.id = "iconDescExpand_" + scholarship['ScholarshipID'];
        iconDescExpand.classList.add('fas');
        iconDescExpand.classList.add('fa-chevron-down');
        iconDescExpand.addEventListener('click', function() {
            toggleShowScholarshipDescDetails(iconDescExpand.id, spanScholarshipDescription.id);
        });
        divScholarshipRow5Col4.appendChild(iconDescExpand);

        divScholarshipRow5.appendChild(divScholarshipRow5Col4);

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
function checkForOverflow() {

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