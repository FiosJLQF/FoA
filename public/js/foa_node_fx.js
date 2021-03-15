//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

//const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
//const pageSponsorVolume = 15; // number of sponsors to be displayed on a page
const { ScholarshipsTable, ScholarshipsActive, ScholarshipsDDL, ScholarshipsAllDDL, ScholarshipsAllDDLTest,
    SponsorsTableTest, Sponsors, SponsorsDDL, SponsorsAllDDLTest, 
    GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
    EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
    FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
    UsersAllDDL, UserPermissionsActive, UserProfiles
} = require('../../models/sequelize.js');


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
    
};


//////////////////////////////////////////////////////////////////////////////////////////
// Create a log entry
//////////////////////////////////////////////////////////////////////////////////////////
function createLogEntry(activityCode, activityUser, activityPage, sendEmail) {

    let createLogEntryResult = false;

    return createLogEntryResult;
    
};


//////////////////////////////////////////////////////////////////////////////////////////
// Define a "Current User Profile" object
//////////////////////////////////////////////////////////////////////////////////////////
function CurrentUser( emailAddress ) {

    this.email = emailAddress;
    this.userID = 0;

    // Get the current user's profile
    async () => {
        const userProfiles = await UserProfiles.findAll( { where: { Username: emailAddress }});
        console.log(`userProfiles[0].UserID #1: ${userProfiles[0].UserID}`);
        this.userID = userProfiles[0].UserID;
        // Get the list of active permissions for the user
        //    const userPermissionsActive = await UserPermissionsActive.findAndCountAll( { where: { UserID: userProfiles[0].UserID }});
    };

};

//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's permissions
//////////////////////////////////////////////////////////////////////////////////////////
async function getUserPermissions( userPermissionsActive, sponsorIDRequested ) {

    // declare and set local variables
    let userCanReadSponsors = false;
    let userCanCreateSponsors = false;
    let userPermissionsSponsors = [];
    let sponsorsAllowedDDL = [];
    let sponsorIDDefault = 0;
    let sponsorID = 0;
    let sponsorDetails = [];
    let doesSponsorExist = false;
    let userCanReadSponsor = false;
    let userCanUpdateSponsor = false;
    let userCanDeleteSponsor = false;


    // Get the list of sponsor-related permissions for the current user
    const userPermissionsSponsorDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-sponsors');

    // Can the current user view the Sponsors DDL?  What Sponsors can the current user see?
    if ( userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) {
        userCanReadSponsors = true;
        // What CRUD operations can the current user perform?
        userPermissionsSponsors = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'sponsors');
        // Find the list of Sponsors the current user can see (for loading into the "Sponsors:" dropdown list)
        if ( userPermissionsSponsors.length > 0 && userPermissionsSponsors[0].CanRead ) {
            if ( userPermissionsSponsors[0].ObjectValues === '*' ) {
                sponsorsAllowedDDL = await SponsorsAllDDLTest.findAndCountAll({});
            } else {  // Current user can only see specific Sponsor(s)
                sponsorsAllowedDDL = await SponsorsAllDDLTest.findAndCountAll({ where: { optionid: userPermissionsSponsors[0].ObjectValues } });
// ToDo: expand for multiple Sponsors (eventually)
                // Assign the default SponsorID to be the sole Sponsor allowed
                sponsorIDDefault = userPermissionsSponsors[0].ObjectValues; // Set the Sponsor ID to the only one Sponsor the User has permission to see
            };
        } else {  // The user can see the Sponsors DDL, but has no Sponsors assigned to them - hide the DDL
            userCanReadSponsors = false;
        };
    };

    // Can the current user create new Sponsors?
    if ( userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanCreate ) {
        userCanCreateSponsors = true;
    };
    
    // If a querystring request was made for a specific Sponsor 
    if ( sponsorIDRequested ) {
        console.log(`sponsorIDRequested: ${sponsorIDRequested}`);
        // Does the requested Sponsor exist? Retrieve the Sponsor's details from the database.
        sponsorDetails = await SponsorsTableTest.findAll({ where: { SponsorID: sponsorIDRequested }});
        if ( typeof sponsorDetails[0] === 'undefined' ) {  // Sponsor ID does not exist
            doesSponsorExist = false;
        } else { // Sponsor ID does exist
            doesSponsorExist = true;
            // Can current user view requested sponsor (or permission to view all sponsors)?
            if ( sponsorIDRequested === userPermissionsSponsors[0].ObjectValues
                 || userPermissionsSponsors[0].ObjectValues === '*' ) {
                userCanReadSponsor = userPermissionsSponsors[0].CanRead;
                console.log(`userCanReadSponsor: ${userCanReadSponsor}`);
                userCanUpdateSponsor = userPermissionsSponsors[0].CanUpdate;
                console.log(`userCanUpdateSponsor: ${userCanUpdateSponsor}`);
                userCanDeleteSponsor = userPermissionsSponsors[0].CanDelete;
                console.log(`userCanDeleteSponsor: ${userCanDeleteSponsor}`);
            };
            sponsorID = sponsorIDRequested;
        };

    } else { // Requested Sponsor ID does not exist - check for a default Sponsor ID for the current user
        console.log(`sponsorIDRequested does not exist - process default Sponsor ID: ${sponsorIDDefault}`);
        // Does the default Sponsor exist? Retrieve the Sponsor's details from the database.
        sponsorDetails = await SponsorsTableTest.findAll({ where: { SponsorID: sponsorIDDefault }});
        if ( typeof sponsorDetails[0] === 'undefined' ) {  // Sponsor ID does not exist
            doesSponsorExist = false;
        } else {
            doesSponsorExist = true;
            // Can current user view requested sponsor?
            // Can current user view requested sponsor (or permission to view all sponsors)?
            if ( sponsorIDDefault === userPermissionsSponsors[0].ObjectValues
                || userPermissionsSponsors[0].ObjectValues === '*' ) {
               userCanReadSponsor = userPermissionsSponsors[0].CanRead;
               console.log(`userCanReadSponsor: ${userCanReadSponsor}`);
               userCanUpdateSponsor = userPermissionsSponsors[0].CanUpdate;
               console.log(`userCanUpdateSponsor: ${userCanUpdateSponsor}`);
               userCanDeleteSponsor = userPermissionsSponsors[0].CanDelete;
               console.log(`userCanDeleteSponsor: ${userCanDeleteSponsor}`);
           };
           sponsorID = sponsorIDDefault;
        };

    };
    console.log(`sponsorID returned: ${sponsorID}`);


    return { userPermissionsSponsorDDL, userCanReadSponsors, userCanCreateSponsors,
             userPermissionsSponsors, sponsorsAllowedDDL,
             sponsorID, sponsorDetails, doesSponsorExist,
             userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor };
};

module.exports = {
    convertOptionsToDelimitedString,
    CurrentUser,
    getUserPermissions
};