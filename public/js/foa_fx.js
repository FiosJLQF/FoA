//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

//const { eventNames } = require("../../app");
const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
const pageSponsorVolume = 15; // number of sponsors to be displayed on a page


//////////////////////////////////////////////////////////////////////////////////////////
 // load the options into a SELECT element
//////////////////////////////////////////////////////////////////////////////////////////
function loadSelectOptionsList(selectEl, notSelectedText, notSelectedValue, optionsArr, selectedValue = '') {

    // get a reference to the SELECT element
    const selectElement = document.querySelector("#" + selectEl);
    
    // create and add the "(Not Selected)" default option
    const optNotSelected = document.createElement("option");
    optNotSelected.textContent = notSelectedText;
    optNotSelected.value = notSelectedValue;
    selectElement.appendChild(optNotSelected);
    optNotSelected.selected = true;

    // add options
    optionsArr.forEach( function(option, ind) {
        const optionEl = document.createElement("option");
        optionEl.textContent = option['optiontext'];
        optionEl.value = option['optionid'];
        if (optionEl.value === selectedValue) {
//            alert(`optionEl.value: (${option['optionid']}); selectedValue: (${selectedValue})`);
            optionEl.selected = true;
        };
        optionEl.classList.add('filter-option');
        selectElement.appendChild(optionEl);
    });
    
}

//////////////////////////////////////////////////////////////////////////////////////////
// toggle the Search Critera input elements, when the icon is clicked
//////////////////////////////////////////////////////////////////////////////////////////
function toggleSearchCriteriaInputBlock(elIcon, elBlock, elInput, statusToSet) {
    // if the current display is hidden and the forced statusToSet <> "hide", then show

    if (statusToSet !== "hide" && elBlock.style.display !== "block") {
        elBlock.style.display = "block";
        elIcon.classList.remove("fa-chevron-down");
        elIcon.classList.add("fa-chevron-up");
    } else {
        if (elInput !== "") {
            switch (elInput.nodeName.toLowerCase()) {
                case "input":
                    elInput.value = "";
                    break;
                case "select":
                    elInput.value = 0;
                    break;
               default:
                elInput.value = "";
            };
        };
        elBlock.style.display = "none";
        elIcon.classList.remove("fa-chevron-up");
        elIcon.classList.add("fa-chevron-down");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// toggle the Advanced Search Critera input elements, when the icon is clicked
//////////////////////////////////////////////////////////////////////////////////////////
function toggleAdvancedSearchCriteriaInputBlock(elIcon, elBlock, elInput, statusToSet) {
    // if the current display is hidden and the forced statusToSet <> "hide", then show
    if (statusToSet !== "hide" && elBlock.style.display !== "block") {
        elBlock.style.display = "block";
        elIcon.classList.remove("fa-angle-double-down");
        elIcon.classList.add("fa-angle-double-up");
    } else {
        if (elInput !== "") {
            switch (elInput.nodeName.toLowerCase()) {
                case "input":
                    elInput.value = "";
                    break;
                case "select":
                    elInput.value = 0;
                    break;
               default:
                elInput.value = "";
            }
        }
        elBlock.style.display = "none";
        elIcon.classList.remove("fa-angle-double-up");
        elIcon.classList.add("fa-angle-double-down");
    }
}


//////////////////////////////////////////////////////////////////////////////////////////
// Format selected options in a SELECT control into a delimited string for database storage
// => client-side version (see scripts/foa_fx.js for server-side version)
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
//////////////////////////////////////////////////////////////////////////////////////////
function loadSelectedValues(selectEl, selectedValuesString) {

    // get the SELECT object
    var selectObject = document.getElementById(selectEl);

    // convert the "selected values" delimited string to an array
    var selectedValuesArray = selectedValuesString.split('|').slice(1, -1);

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
// parse the formatted SELECT object's "selected values"
//////////////////////////////////////////////////////////////////////////////////////////
function buildFeaturedSponsorsBlock(sponsors, scholarships) {

    // local variables
    // build a "featured results" div, to return to the calling function
    const divFeaturedResults = document.createElement('div');
    divFeaturedResults.id = 'featuredsponsors'
    divFeaturedResults.classList.add('featured-sponsors-block');
//    const divFeaturedSponsorsBlock = document.createElement('div');
//    divFeaturedSponsorsBlock.classList.add('featured-block');

    // extract the "featured" items
    const featuredItems = sponsors.filter( obj => obj['SponsorIsFeatured'] );
    featuredItemsCount = featuredItems.length;
    console.log(`number of featured sponsors: ${featuredItemsCount}`);

    // if "featured" items were found, build the "Featured Scholarships" block
    if ( featuredItemsCount > 0 ) {

        // add the "Featured Scholarships" label (with break hr)
        const divFeaturedItemsBlockTitle = document.createElement('div');
        divFeaturedItemsBlockTitle.classList.add('bodylayout1col2title');
        divFeaturedItemsBlockTitle.innerText = "Featured Sponsors";
        divFeaturedResults.append(divFeaturedItemsBlockTitle);
        const hrFeaturedItemsBlockTitleBreak = document.createElement('hr');
        hrFeaturedItemsBlockTitleBreak.classList.add('searchresults-subblock-break-hr');
        divFeaturedResults.append(hrFeaturedItemsBlockTitleBreak);

        // for each featured item, build the initial display with the details hidden
        for (let featuredItem of featuredItems) {

            // get the matching scholarships for "count" display
            const matchingScholarships = scholarships.filter( function(e) {
                return e.SponsorID == featuredItem['SponsorID'];
            });

            // build a Sponsor Search Result div
            const divItemSearchResult = buildFeaturedSponsorSearchResultDiv(featuredItem, matchingScholarships);
            divFeaturedResults.append(divItemSearchResult);

            // add the sub-block break line to the search results div
            const hrItemBreak = document.createElement('hr');
            hrItemBreak.classList.add('searchresults-subblock-break-hr');
            divFeaturedResults.append(hrItemBreak);

//            // add all item search results divs to the body at the top of the search results column
//            divFeaturedSponsorsBlock.prepend(divFeaturedResults);

        };  // loop to the next featured item in the array

    }; // END: if any featured items were found

//    return divFeaturedSponsorsBlock;
    return divFeaturedResults;
};


/////////////////////////////////////////////////////////////////////////////////////////////////
// builds a <div> of a "Featured Sponsor"
/////////////////////////////////////////////////////////////////////////////////////////////////
function buildFeaturedSponsorSearchResultDiv(selectedSponsor, matchingScholarships) {

    // local variables
    let fieldOfStudyListCompiled = '';

    // create the empty <div> and apply styles
    const divFeaturedSponsor = document.createElement('div');
    divFeaturedSponsor.classList.add('row');
    divFeaturedSponsor.classList.add('searchresults-mainblock-featured'); /* change background color */

    /////////////////////////////////////////////////////////////
    // build and add the first column (Sponsor Logo, Sponsor Name, and Website)
    /////////////////////////////////////////////////////////////
    const divFeaturedSponsorCol1 = document.createElement('div');
    divFeaturedSponsorCol1.classList.add('featured-sponsor-col1');

    // Sponsor logo
    const lnkSponsorLogo = document.createElement('a');
    lnkSponsorLogo.id = "lnkSponsorLogo_" + selectedSponsor['SponsorID'];
//    lnkSponsorLogo.classList.add('sponsor-view-scholarships');
    lnkSponsorLogo.href = selectedSponsor['SponsorWebsite'];
    lnkSponsorLogo.target = "_blank";

    const imgSponsorLogo = document.createElement('img');
    imgSponsorLogo.src = selectedSponsor['SponsorLogo'];
    imgSponsorLogo.classList.add('featured-sponsor-logo');
    imgSponsorLogo.alt = "Link to the Sponsor's Website";
    lnkSponsorLogo.appendChild(imgSponsorLogo);

    divFeaturedSponsorCol1.appendChild(lnkSponsorLogo);

    // Sponsor Name
    const divSponsorName = document.createElement('div');
    divSponsorName.classList.add('featured-sponsor-name');
    divSponsorName.innerText = selectedSponsor['SponsorName'];
    divFeaturedSponsorCol1.appendChild(divSponsorName);

    // Sponsor Website (deprecated 2/2022 by RB)
//    const lnkSponsorWebsite = document.createElement('a');
//    lnkSponsorWebsite.id = "lnkSponsorWebsite_" + selectedSponsor['SponsorWebsite'];
//    lnkSponsorWebsite.classList.add('featured-sponsor-website');
//    lnkSponsorWebsite.href = selectedSponsor['SponsorWebsite'];
//    lnkSponsorWebsite.target = "_blank";
//    lnkSponsorWebsite.innerText = selectedSponsor['SponsorWebsite'];
//    divFeaturedSponsorCol1.appendChild(lnkSponsorWebsite);

    // add column 1 to the <div>
    divFeaturedSponsor.appendChild(divFeaturedSponsorCol1);

    /////////////////////////////////////////////////////////////
    // build and add the second column ("Featured" badge, scholarship type summary)
    /////////////////////////////////////////////////////////////
    const divFeaturedSponsorCol2 = document.createElement('div');
    divFeaturedSponsorCol2.classList.add('featured-sponsor-col2');

    // Sponsor "Is Featured" Flag
    const imgSponsorIsFeatured = document.createElement('img');
    imgSponsorIsFeatured.src = "/img/imgFeaturedSponsor.png";
    imgSponsorIsFeatured.alt = "Featured Sponsor Badge";
    imgSponsorIsFeatured.classList.add('featured-sponsor-badge');
    divFeaturedSponsorCol2.appendChild(imgSponsorIsFeatured);

    //////////////////////////////////////////////
    // build and add the "active scholarships profile" block, if there are active scholarships
    //////////////////////////////////////////////
    if ( matchingScholarships.length > 0 ) {
        // add the header text "Offering ## scholarships in"
        const divFeaturedSponsorScholarshipCount = document.createElement('div');
//        divFeaturedSponsorScholarshipCount.classList.add('searchresultscol3A');
        divFeaturedSponsorScholarshipCount.textContent = 'Offering ' + matchingScholarships.length + ' scholarships in';
        divFeaturedSponsorCol2.appendChild(divFeaturedSponsorScholarshipCount);

        // add list of scholarship types (2 columns)
        const divScholarshipTypes = document.createElement('div');
        divScholarshipTypes.classList.add('featured-sponsor-fieldofstudy');

        // compile a list of all Field of Study categories
        for ( let i = 0; i < matchingScholarships.length; i++ ) {
            fieldOfStudyListCompiled += matchingScholarships[i]['Criteria_FieldOfStudyText'] + '; ';
        }
        fieldOfStudyListCompiled = fieldOfStudyListCompiled.substring(0, fieldOfStudyListCompiled.length-2);
        console.log(`FoS Raw: ${fieldOfStudyListCompiled}`);
        const fieldOfStudyListArray = fieldOfStudyListCompiled.split('; ');
        console.log(`FoS Count Raw: ${fieldOfStudyListArray.length}`);
        const fieldOfStudyListUnique = fieldOfStudyListArray.filter((v, i, a) => a.indexOf(v) === i);
        fieldOfStudyListUnique.sort();
        console.log(`FoS Count Unique: ${fieldOfStudyListUnique.length}`);
        console.log(`FoS Unique: ${fieldOfStudyListUnique}`);

        // create the first of two columns of "Field of Study" categories
        const divScholarshipTypesCol1 = document.createElement('div');
        divScholarshipTypesCol1.classList.add('featured-sponsor-fieldofstudy-col1');
        for ( let i = 0; i <= Math.ceil((fieldOfStudyListUnique.length)/2)-1; i++ ) {
            divScholarshipTypesCol1.innerHTML += '<br>' + fieldOfStudyListUnique[i];
        }
        divScholarshipTypes.appendChild(divScholarshipTypesCol1);

        // create the second of two columns of "Field of Study" categories
        const divScholarshipTypesCol2 = document.createElement('div');
        divScholarshipTypesCol2.classList.add('featured-sponsor-fieldofstudy-col2');
        for ( let i = Math.ceil((fieldOfStudyListUnique.length)/2); i < fieldOfStudyListUnique.length; i++ ) {
            divScholarshipTypesCol2.innerHTML += '<br>' + fieldOfStudyListUnique[i];
        }
        divScholarshipTypes.appendChild(divScholarshipTypesCol2);

        // add the two "Field of Study" category columns to its parent
        divFeaturedSponsorCol2.append(divScholarshipTypes);

    } else {  // no active scholarships

        // add the header text "Check back for upcoming scholarships"
        const divFeaturedSponsorScholarshipCount = document.createElement('div');
        divFeaturedSponsorScholarshipCount.textContent = 'Check back for upcoming scholarships!';
        divFeaturedSponsorCol2.appendChild(divFeaturedSponsorScholarshipCount);

    };

    /////////////////////////////////////////////////////////////
    // "View Scholarships" button, if there are active scholarships
    /////////////////////////////////////////////////////////////
    if ( matchingScholarships.length > 0 ) {

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

        divFeaturedSponsorCol2.appendChild(lnkViewScholarships);

    } else {

        const imgNoActiveScholarships = document.createElement('img');
        imgNoActiveScholarships.src = "/img/imgNoActiveScholarships.png";
        imgNoActiveScholarships.alt = "No Active Scholarships for this Sponsor";
        imgNoActiveScholarships.classList.add('sponsor-no-scholarships-img');

        divFeaturedSponsorCol2.appendChild(imgNoActiveScholarships);

    };
    
    // add column 2 to the <div>
    divFeaturedSponsor.appendChild(divFeaturedSponsorCol2);

    return divFeaturedSponsor;
}
