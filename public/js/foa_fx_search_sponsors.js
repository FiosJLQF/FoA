////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Scripts for the Sponsor Search Engine (client-side scripts)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   showSelectedSponsors
//   buildSponsorSearchResults
//      - buildSponsorSearchResultDiv
//      - buildSponsorPageNavigator
//   validateSponsorSearchCriteria
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////
// show selected sponsors (all or matched)
/////////////////////////////////////////////////////////////////////////////////////////////////
function showSelectedSponsors(sponsors, sponsorsAllOrMatched) {

    // clear any previous search results
    clearSearchResults();

    // load all sponsors
    buildSponsorSearchResults(sponsors, 1, false, sponsorsAllOrMatched);

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the sponsor search results divs
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildSponsorSearchResults(matchingSponsors, pageNumber, showMatchingCriteria, sponsorsAllOrMatched) {

    // local variables
    let featuredItemsCount = 0;
    let selectedItemSliceBegin = 0;
    let selectedItemSliceEnd = 0;

    // clear any previous search results
    clearSearchResults();
    document.querySelector('#searchresultsmaintitle').style.display = 'none';

    // find the main div for column 2 (i.e., the search results column)
    const divSearchResultsColumn = document.querySelector('#panel_body_right');
    const divSearchResultsDivs = document.createElement('div');
    divSearchResultsDivs.id = 'searchResults';

    ///////////////////////////////////////////////////////////
    // if building the 1st page, show the "featured" items first
    ///////////////////////////////////////////////////////////
    if ( pageNumber === 1 ) {

        const divFeaturedSponsorsBlock = buildFeaturedSponsorsBlock(matchingSponsors);
        divSearchResultsColumn.prepend(divFeaturedSponsorsBlock);

    }; // END:  If Page Number = 1, add Featured Item block

    ///////////////////////////////////////////////////////////
    // add the "Matched Items"
    ///////////////////////////////////////////////////////////

    // create the title (with hr break)
    const divMatchedItemsBlockTitle = document.createElement('div');
    divMatchedItemsBlockTitle.classList.add('bodylayout1col2title');
    if ( showMatchingCriteria == true ) {
        divMatchedItemsBlockTitle.textContent = 'Search Results (sorted by best match)';
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
    const selectedItems = matchingSponsors.slice( selectedItemSliceBegin, selectedItemSliceEnd);

    // for each selected item, build the initial display with the details hidden
    for (let selectedItem of selectedItems) {

        // build a Scholarship Search Result div
        const divItemSearchResult = buildSponsorSearchResultDiv(selectedItem);
        divSearchResultsDivs.appendChild(divItemSearchResult);

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
    const buildPageNavResult = buildSponsorPageNavigator(matchingSponsors, pageNumber);

    // scroll back to the top of the page
    window.scrollTo(0,0);

};


/////////////////////////////////////////////////////////////////////////////////////////////////
// build the pagination div
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildSponsorPageNavigator(matchingSponsors, pageNumberSelected) {

    const numberOfPages = Math.ceil(matchingSponsors.length / pageSponsorVolume);

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
            buildSponsorSearchResults(matchingSponsors, pageNumberToLoad, true);
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
// return a formatted <div> of the "Sponsor Summary Block"
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildSponsorSearchResultDiv(selectedSponsor) {

    const divSponsor = document.createElement('div');
    divSponsor.classList.add('row');

    // If the Sponsor is "Featured", change the div styling
    if ( selectedSponsor['SponsorIsFeatured'] ) {
        divSponsor.classList.add('featured-item-block'); /* change background color */
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
            spnScholarshipCount.innerHTML = '<br>Active Scholarships: ' + selectedSponsor['ScholarshipCountActive'];
            divSponsorRow1Col1.appendChild(spnScholarshipCount);
//        };
    
        divSponsor.appendChild(divSponsorRow1Col1);

        /////////////////////////////////////////////////////////////
        // build and add the third column to the first row (Sponsor Information)
        /////////////////////////////////////////////////////////////
        const divSponsorRow1Col3 = document.createElement('div');
        divSponsorRow1Col3.classList.add('searchresultscol3');
        divSponsorRow1Col3.classList.add('container');

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
                // Add the "Featured Sponsor" banner
                const imgSponsorIsFeatured = document.createElement('img');
                imgSponsorIsFeatured.src = "/img/imgFeaturedSponsor.png";
                imgSponsorIsFeatured.alt = "Featured Sponsor Badge";
                imgSponsorIsFeatured.classList.add('featured-sponsor-badge');
                divSponsorRow1Col3Row1.appendChild(imgSponsorIsFeatured);
                // Add the "Featured Sponsor" banner (Mobile Version)
                const imgSponsorIsFeaturedMobile = document.createElement('img');
                imgSponsorIsFeaturedMobile.src = "/img/imgFeaturedSponsor_Mobile.png";
                imgSponsorIsFeaturedMobile.alt = "Featured Sponsor Badge";
                imgSponsorIsFeaturedMobile.classList.add('featured-sponsor-badge-mobile');
                divSponsorRow1Col3Row1.appendChild(imgSponsorIsFeaturedMobile);
            };

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
            divSponsorRow1Col3Row3Col2.appendChild(lnkSponsorWebsite);

        divSponsorRow1Col3Row3.appendChild(divSponsorRow1Col3Row3Col2);

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

        divSponsorRow1Col3.appendChild(divSponsorRow1Col3Row4);
    
        ////////////////////////////////////////
        // Build and Add the "View Scholarships" link, if any active scholarships exist
        ////////////////////////////////////////

//        if ( intScholarships > 0 ) { // display the link if there are active scholarships
        if ( selectedSponsor['ScholarshipCountActive'] > 0 ) { // display the link if there are active scholarships

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


//////////////////////////////////////////////////////////////////////////////////////////
// validate Search Criteria
//////////////////////////////////////////////////////////////////////////////////////////
function validateSponsorSearchCriteria() {

    let errorCount = 0;
    let criteriaCount = 0;

    // Keywords
    const elKeywords = document.querySelector('#filterKeywordsInput');
    if ( elKeywords.value != '' ) {
        criteriaCount++;
    };

    // Sponsor
    const elSPN = document.querySelector('#filterSponsorNamesInput');
    if ( elSPN.value != '0' && elSPN.value.length != 0 ) {
        criteriaCount++;
    };

    // Sponsor Type
    const elST = document.querySelector('#filterSponsorTypeInput');
    if ( elST.value != '0' && elST.value.length != 0 ) {
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
