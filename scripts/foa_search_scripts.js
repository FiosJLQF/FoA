//////////////////////////////////////////////////////////////////////////////////////////
// scripts used by the search engine
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
// format search engine criteria for use in SQL WHERE clause
//////////////////////////////////////////////////////////////////////
async function formatSearchCriteriaArray(searchCriteriaOriginal) {

    let searchCriteriaSearchFormat = '';
    let searchCriteriaLogFormat = '';
    console.log(`searchCriteriaOriginal (before): ${searchCriteriaOriginal}`);
    console.log(`searchCriteriaOriginal.length (before): ${searchCriteriaOriginal.length}`);

    // Reformat the selected values (if any) into a "LIKE ANY" parameter string
    if ( Array.isArray(searchCriteriaOriginal) ) { // More than one options was selected
        console.log(`searchCriteriaOriginal.indexOf(0): ${searchCriteriaOriginal.indexOf('0')}`);
        if ( searchCriteriaOriginal.indexOf('0') >= 0 ) { // Remove 'Not Selected'
            searchCriteriaOriginal.splice(searchCriteriaOriginal.indexOf('0'), 1);
        };
        if ( searchCriteriaOriginal.length > 0 ) {
            searchCriteriaSearchFormat = "{%" + searchCriteriaOriginal.join("%,%") + "%}";
        };
    } else { // One or no options were selected
        if ( searchCriteriaOriginal == 0 || searchCriteriaOriginal.length == 0 ) {  // 'Not Selected' was the only option selected, or none
            searchCriteriaSearchFormat = '{}';  // default the search criteria to any "always false" match
        } else {
            searchCriteriaSearchFormat = "{%" + searchCriteriaOriginal + "%}";
        };
    };
    
    // Reformat the selected values (if any) into a tilde-delimited string for logging and reporting
    searchCriteriaLogFormat = searchCriteriaSearchFormat.replace('{%','~').replace('%}','~').replace('%,%','~');

    console.log(`searchCriteriaSearchFormat: ${searchCriteriaSearchFormat}`);
    console.log(`searchCriteriaLogFormat: ${searchCriteriaLogFormat}`);

    // Return the formatted values
    return { searchCriteriaSearchFormat: searchCriteriaSearchFormat,
             searchCriteriaLogFormat: searchCriteriaLogFormat};

};


//////////////////////////////////////////////////////////////////////
// process scholarship search criteria and return formatted object for use
//////////////////////////////////////////////////////////////////////
async function processScholarshipSearchCriteria(reqBody) {

    // Local variables
    let fieldOfStudyCriteriaSearchFormatted = '';
    let fieldOfStudyCriteriaLogFormatted = '';






    // Return the formatted values
    return {
        fieldOfStudyCriteriaSearchFormatted
    };

};


module.exports = {
    formatSearchCriteriaArray
};