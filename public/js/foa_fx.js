//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

const { eventNames } = require("../../app");
const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
const pageSponsorVolume = 15; // number of sponsors to be displayed on a page
const nodemailer = require('nodemailer');  // allows SMPT push emails to be sent


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
// does the user have permission to access the page?
//////////////////////////////////////////////////////////////////////////////////////////
function userPermissions(permissionsList, userID, objectName, objectValue = '') {

// ToDo:  database call here with specifics to return T/F instead of this???

    // for each Permission in the Permissions List, is there a match to the current request?
    for (let permission of permissionsList) {
        console.log(permission.userid);
        console.log(permission.objectName);
        console.log(permission.objectValue);
        console.log(permission.canCreate);
        console.log(permission.canRead);
        console.log(permission.canUpdate);
        console.log(permission.canDelete);
    };

}


//////////////////////////////////////////////////////////////////////////////////////////
// Format selected options in a SELECT control into a delimited string for database storage
// => client-side version (see scripts/foa_fx.js for server-side version)
//////////////////////////////////////////////////////////////////////////////////////////
function convertOptionsToDelimitedString(optionsToConvert, delimiterToUse = "|", notSelectedValue) {

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

