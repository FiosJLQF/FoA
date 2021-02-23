//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
const pageSponsorVolume = 15; // number of sponsors to be displayed on a page


//////////////////////////////////////////////////////////////////////////////////////////
// Does the user have permission to access the page?
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
    
}

module.exports = {
    convertOptionsToDelimitedString
};