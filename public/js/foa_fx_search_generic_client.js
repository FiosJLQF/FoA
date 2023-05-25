////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Scripts for any Search Engine (client-side scripts)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   clearSearchResults
//   convertOptionsToDelimitedString
//   loadSelectedValues
//   buildFeaturedSponsorsBlock (used on both sponsor and scholarship search results pages)
//   buildFeaturedSponsorSearchResultDiv (used on both sponsor and scholarship search results pages)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////
const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
const pageSponsorVolume = 15; // number of sponsors to be displayed on a page


/////////////////////////////////////////////////////////////////////////////////////////////////
// clear Search Results
/////////////////////////////////////////////////////////////////////////////////////////////////
function clearSearchResults() {

    document.querySelector('#searchResultsTitle').textContent = 'Enter criteria and click "Search"';

    if ( document.querySelector('#featuredsponsors') !== null ) {
        document.querySelector('#panel_body_right').removeChild(featuredsponsors);
    };
    if ( document.querySelector('#featuredscholarships') !== null ) {
        document.querySelector('#panel_body_right').removeChild(featuredscholarships);
    };
    if ( document.querySelector('#searchResults') !== null ) {
        document.querySelector('#panel_body_right').removeChild(searchResults);
    };
    if ( document.querySelector('#pagination') !== null ) {
        document.querySelector('#panel_body_right').removeChild(pagination);
    };

}


//////////////////////////////////////////////////////////////////////////////////////////
// Format selected options in a SELECT control into a delimited string for database storage
// => client-side version (see scripts/common_fx_server.js for server-side version)
//////////////////////////////////////////////////////////////////////////////////////////
function convertOptionsToDelimitedString(optionsToConvert, delimiterToUse = "|", notSelectedValue, trimEdges) {

    let optionsOrig = optionsToConvert;
    let optionsFormatted = '';

    // If the SELECT control has a "Not Selected" option, and it should be removed
    if ( Array.isArray(optionsOrig) ) { // More than one options was selected
        if ( optionsOrig.indexOf(notSelectedValue) >= 0 ) { // Remove 'Not Selected'
            optionsOrig.splice(optionsOrig.indexOf(notSelectedValue), 1);
        };
    } else { // One or no options were selected
        if ( optionsOrig === notSelectedValue ) {  // 'Not Selected' was the only option selected
            optionsOrig = '';
        };
    };

    // Reformat the input Options list to a delimited string
    if ( Array.isArray(optionsOrig) ) { // More than one options was selected
        optionsFormatted = delimiterToUse + optionsOrig.join(delimiterToUse) + delimiterToUse;
    } else { // One or no options were selected
        if ( optionsOrig === '' ) {  // 'Not Selected' was the only option selected, or no options were selected
            optionsFormatted = '';    
        } else {
            optionsFormatted = delimiterToUse + optionsOrig + delimiterToUse;
        };
    };

    // If the function call requests the edges to be trimmed, remove the delimiter from the left and right edges
    if ( trimEdges === "true" ) {
        optionsFormatted = optionsFormatted.slice(delimiterToUse.length, optionsFormatted.length - delimiterToUse.length);
    };

    // Return the formatted string
    return optionsFormatted;
    
};

//////////////////////////////////////////////////////////////////////////////////////////
// parse the formatted SELECT object's "selected values"
//     input values string must be in the format:  "|value1|value2|...|"
//////////////////////////////////////////////////////////////////////////////////////////
function loadSelectedValues(selectEl, selectedValuesString, delimiterToUse) {

    // get the SELECT object
    var selectObject = document.getElementById(selectEl);

    // convert the "selected values" delimited string to an array
    var selectedValuesArray = selectedValuesString.split(delimiterToUse).slice(1, -1);

    // for each "selected value" find and mark it in the SELECT object
    if ( selectedValuesArray.length !== 0 ) {
      selectObject.options[0].selected = '';  // Remove the default 'Not Selected' option
      selectedValuesArray.forEach( function(selectedValue) {
        for ( i=0; i < selectObject.length; i++ ) {
          if ( selectObject.options[i].value === selectedValue ) {
            selectObject.options[i].selected = 'selected';
          }
        }
      });
    };
    
}


//////////////////////////////////////////////////////////////////////////////////////////
// build the block(s) for any "Featured Sponsors"
//////////////////////////////////////////////////////////////////////////////////////////
function buildFeaturedSponsorsBlock(sponsors) {

    // local variables
    // build a "featured results" div, to return to the calling function
    const divFeaturedResults = document.createElement('div');
    divFeaturedResults.id = 'featuredsponsors'
    divFeaturedResults.classList.add('featured-sponsors-block');

    // extract the "featured" items
    const featuredItems = sponsors.filter( obj => obj['SponsorIsFeatured'] );
    featuredItemsCount = featuredItems.length;
    console.log(`number of featured sponsors: ${featuredItemsCount}`);

    // if "featured" items were found, build the "Featured Sponsors" block
    if ( featuredItemsCount > 0 ) {

        // add the "Featured Sponsors" label (with break hr)
        const divFeaturedItemsBlockTitle = document.createElement('div');
        divFeaturedItemsBlockTitle.classList.add('bodylayout1col2title');
        divFeaturedItemsBlockTitle.innerText = "Featured Sponsors";
        divFeaturedResults.append(divFeaturedItemsBlockTitle);
        const hrFeaturedItemsBlockTitleBreak = document.createElement('hr');
        hrFeaturedItemsBlockTitleBreak.classList.add('searchresults-subblock-break-hr');
        divFeaturedResults.append(hrFeaturedItemsBlockTitleBreak);

        // for each featured item, build the initial display with the details hidden
        for (let featuredItem of featuredItems) {

            // build a Sponsor Search Result div
            const divItemSearchResult = buildFeaturedSponsorSearchResultDiv(featuredItem);
            divFeaturedResults.append(divItemSearchResult);

            // add the sub-block break line to the search results div
            const hrItemBreak = document.createElement('hr');
            hrItemBreak.classList.add('searchresults-subblock-break-hr');
            divFeaturedResults.append(hrItemBreak);

        };  // loop to the next featured item in the array

    }; // END: if any featured items were found

//    return divFeaturedSponsorsBlock;
    return divFeaturedResults;
};


/////////////////////////////////////////////////////////////////////////////////////////////////
// builds a <div> of a "Featured Sponsor"
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildFeaturedSponsorSearchResultDiv(selectedSponsor) {

    // local variables
    let fieldOfStudyListCompiled = '';
    let numberOfFieldOfStudyColumns = 2; // default
    if ( window.innerWidth < 768 ) {  // mobile format only displays 1 column
        numberOfFieldOfStudyColumns = 1;
    };

    // create the empty <div> and apply styles
    const divFeaturedSponsor = document.createElement('div');
    divFeaturedSponsor.id = 'featured-sponsor';
    const divFeaturedSponsorContent = document.createElement('div');
    divFeaturedSponsorContent.id = 'featured_sponsor_content';
    divFeaturedSponsorContent.classList.add('row');
    divFeaturedSponsorContent.classList.add('featured-item-block'); /* change background color */

    /////////////////////////////////////////////////////////////
    // build and add the first column (Sponsor Logo, Sponsor Name, and Website)
    /////////////////////////////////////////////////////////////
    const divFeaturedSponsorContentCol1 = document.createElement('div');
    divFeaturedSponsorContentCol1.classList.add('featured-sponsor-col1');

    // Sponsor Website Link
    const lnkSponsorWebsite = document.createElement('a');
    lnkSponsorWebsite.id = "lnkSponsorWebsite_" + selectedSponsor['SponsorID'];
    lnkSponsorWebsite.href = selectedSponsor['SponsorWebsite'];
    lnkSponsorWebsite.target = "_blank";

    // Add Sponsor Logo to the link
    const imgSponsorLogo = document.createElement('img');
    imgSponsorLogo.src = selectedSponsor['SponsorLogo'];
    imgSponsorLogo.classList.add('featured-sponsor-logo');
    imgSponsorLogo.alt = "Link to the Sponsor's Website";
    lnkSponsorWebsite.appendChild(imgSponsorLogo);

    // Add Sponsor Name to the link
    const divSponsorName = document.createElement('div');
    divSponsorName.classList.add('featured-sponsor-name');
    divSponsorName.innerText = selectedSponsor['SponsorName'];
    lnkSponsorWebsite.appendChild(divSponsorName);

    // Add Sponsor Website Link to column 1
    divFeaturedSponsorContentCol1.appendChild(lnkSponsorWebsite);

    // add column 1 to the <div>
    divFeaturedSponsorContent.appendChild(divFeaturedSponsorContentCol1);

    /////////////////////////////////////////////////////////////
    // build and add the second column ("Featured" badge, scholarship type summary)
    /////////////////////////////////////////////////////////////
    const divFeaturedSponsorContentCol2 = document.createElement('div');
    divFeaturedSponsorContentCol2.classList.add('featured-sponsor-col2');

    // Sponsor "Is Featured" Flag
    const imgSponsorIsFeatured = document.createElement('img');
    imgSponsorIsFeatured.src = "/img/imgFeaturedSponsor.png";
    imgSponsorIsFeatured.alt = "Featured Sponsor Badge";
    imgSponsorIsFeatured.classList.add('featured-sponsor-badge');
    divFeaturedSponsorContentCol2.appendChild(imgSponsorIsFeatured);
    // Sponsor "Is Featured" Flag (Mobile Version)
    const imgSponsorIsFeaturedMobile = document.createElement('img');
    imgSponsorIsFeaturedMobile.src = "/img/imgFeaturedSponsor_Mobile.png";
    imgSponsorIsFeaturedMobile.alt = "Featured Sponsor Badge";
    imgSponsorIsFeaturedMobile.classList.add('featured-sponsor-badge-mobile');
    divFeaturedSponsorContentCol2.appendChild(imgSponsorIsFeaturedMobile);

    //////////////////////////////////////////////
    // build and add the "active scholarships profile" block, if there are active scholarships
    //////////////////////////////////////////////
    if ( selectedSponsor['ScholarshipCountActive'] > 0 ) {

        // add the header text "Offering ## scholarships in"
        const divFeaturedSponsorScholarshipCount = document.createElement('div');
        divFeaturedSponsorScholarshipCount.textContent = 'Offering ' + selectedSponsor['ScholarshipCountActive'] + ' scholarships in';
        divFeaturedSponsorContentCol2.appendChild(divFeaturedSponsorScholarshipCount);

        // add list of scholarship types
        const divScholarshipTypes = document.createElement('div');
        divScholarshipTypes.classList.add('featured-sponsor-fieldofstudy');
        fieldOfStudyListCompiled = selectedSponsor['SponsorFieldOfStudyList'];
        const fieldOfStudyListArray = fieldOfStudyListCompiled.split(';');
        const fieldOfStudyListUnique = fieldOfStudyListArray.filter((v, i, a) => a.indexOf(v) === i);
        fieldOfStudyListUnique.sort();

        // create the first of two columns of "Field of Study" categories
        const divScholarshipTypesCol1 = document.createElement('div');
        divScholarshipTypesCol1.classList.add('featured-sponsor-fieldofstudy-col1');
        for ( let i = 0; i <= Math.ceil((fieldOfStudyListUnique.length)/numberOfFieldOfStudyColumns)-1; i++ ) {
            divScholarshipTypesCol1.innerHTML += fieldOfStudyListUnique[i] + '<br>';
        };
        if ( divScholarshipTypesCol1.innerHTML.slice(-2) == '<br>' ) {
            divScholarshipTypesCol1.innerHTML = divScholarshipTypesCol1.substring(0, divScholarshipTypesCol1.length-4);
        };
        divScholarshipTypes.appendChild(divScholarshipTypesCol1);

        // create the second of two columns of "Field of Study" categories (if screen size allows)
        if ( numberOfFieldOfStudyColumns > 1 ) {
            const divScholarshipTypesCol2 = document.createElement('div');
            divScholarshipTypesCol2.classList.add('featured-sponsor-fieldofstudy-col2');
            for ( let i = Math.ceil((fieldOfStudyListUnique.length)/numberOfFieldOfStudyColumns); i < fieldOfStudyListUnique.length; i++ ) {
                divScholarshipTypesCol2.innerHTML += fieldOfStudyListUnique[i] + '<br>';
            };
            if ( divScholarshipTypesCol2.innerHTML.slice(-2) == '<br>' ) {
                divScholarshipTypesCol2.innerHTML = divScholarshipTypesCol2.substring(0, divScholarshipTypesCol2.length-4);
            };
            divScholarshipTypes.appendChild(divScholarshipTypesCol2);
        };

        // add the "Field of Study" category column(s) to its parent
        divFeaturedSponsorContentCol2.append(divScholarshipTypes);

    } else {  // no active scholarships

        // add the header text "Check back for upcoming scholarships"
        const divFeaturedSponsorScholarshipCount = document.createElement('div');
        divFeaturedSponsorScholarshipCount.textContent = 'Check back for upcoming scholarships!';
        divFeaturedSponsorContentCol2.appendChild(divFeaturedSponsorScholarshipCount);

    };

    /////////////////////////////////////////////////////////////
    // "View Scholarships" link, if there are active scholarships
    /////////////////////////////////////////////////////////////
    if ( selectedSponsor['ScholarshipCountActive'] > 0 ) {

        const lnkViewScholarships = document.createElement('a');
        lnkViewScholarships.id = "lnkViewScholarships_" + selectedSponsor['SponsorID'];
        lnkViewScholarships.classList.add('sponsor-view-scholarships');
        lnkViewScholarships.href = "scholarships?sponsorid=" + selectedSponsor['SponsorID'];
        lnkViewScholarships.target = "_blank";

        const imgViewScholarships = document.createElement('img');
        imgViewScholarships.src = "/img/imgViewScholarships.png";
        imgViewScholarships.alt = "View Scholarships for this Sponsor";
        imgViewScholarships.classList.add('sponsor-view-scholarships-img');
        lnkViewScholarships.appendChild(imgViewScholarships);

        divFeaturedSponsorContentCol2.appendChild(lnkViewScholarships);

    } else {

        const imgNoActiveScholarships = document.createElement('img');
        imgNoActiveScholarships.src = "/img/imgNoActiveScholarships.png";
        imgNoActiveScholarships.alt = "No Active Scholarships for this Sponsor";
        imgNoActiveScholarships.classList.add('sponsor-no-scholarships-img');

        divFeaturedSponsorContentCol2.appendChild(imgNoActiveScholarships);

    };
    
    /////////////////////////////////////////////////////////////
    // if mobile layout, add link to scholarship list for the sponsor
    /////////////////////////////////////////////////////////////
    if ( numberOfFieldOfStudyColumns == 1 ) {

        // const lnkViewScholarshipsPanel = document.createElement('a');
        // lnkViewScholarshipsPanel.id = "lnkViewScholarshipsPanel_" + selectedSponsor['SponsorID'];
        // lnkViewScholarshipsPanel.classList.add('sponsor-view-scholarships');
        // lnkViewScholarshipsPanel.href = "scholarships?sponsorid=" + selectedSponsor['SponsorID'];
        // lnkViewScholarshipsPanel.target = "_blank";
        // lnkViewScholarshipsPanel.appendChild(divFeaturedSponsorContent);
        // divFeaturedSponsor.appendChild(lnkViewScholarshipsPanel);

//        divFeaturedSponsorContentCol2.onclick = 'location.href="scholarships?sponsorid=' + selectedSponsor['SponsorID'] + '"';
//        divFeaturedSponsorContentCol2.setAttribute("onclick",
//            'location.href="scholarships?sponsorid=' + selectedSponsor['SponsorID'] + '";' +
//            'location.target=\'_blank\'');
            divFeaturedSponsorContentCol2.setAttribute("onclick",
            "window.open('scholarships?sponsorid=" + selectedSponsor['SponsorID'] + "', '_blank')");

    };

    // add column 2 to the <div>
    divFeaturedSponsorContent.appendChild(divFeaturedSponsorContentCol2);

    // add the content to the Featured Sponsor div
    divFeaturedSponsor.appendChild(divFeaturedSponsorContent);

    return divFeaturedSponsor;
}