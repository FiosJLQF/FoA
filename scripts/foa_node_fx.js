//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

//const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
//const pageSponsorVolume = 15; // number of sponsors to be displayed on a page
const { ScholarshipsTableTest, ScholarshipsActive, ScholarshipsDDL, ScholarshipsAllDDL, ScholarshipsAllDDLTest,
    SponsorsTableTest, Sponsors, SponsorsDDL, SponsorsAllDDLTest, 
    GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
    EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
    FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
    UsersAllDDL, UserPermissionsActive, UserProfiles
} = require('../models/sequelize.js');


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
// Create a log entry
//////////////////////////////////////////////////////////////////////////////////////////
function createLogEntry(activityCode, activityUser, activityPage, sendEmail) {

    let createLogEntryResult = false;

    return createLogEntryResult;
    
};


//////////////////////////////////////////////////////////////////////////////////////////
// Format selected options in a SELECT control into a delimited string for database storage
// => server-side version (see public/js/foa_fx.js for client-side version)
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
// Get the Current User's Sponsor permissions
//////////////////////////////////////////////////////////////////////////////////////////
async function getSponsorPermissionsForUser( userPermissionsActive, sponsorIDRequested ) {

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
                sponsorIDDefault = 999999;
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

    } else if ( sponsorIDDefault !== 999999) { // Requested Sponsor ID does not exist - if there a default Sponsor ID
        console.log(`sponsorIDRequested does not exist - process default Sponsor ID: ${sponsorIDDefault}`);
        // Does the default Sponsor exist? Retrieve the Sponsor's details from the database.
        sponsorDetails = await SponsorsTableTest.findAll({ where: { SponsorID: sponsorIDDefault }});
        if ( typeof sponsorDetails[0] === 'undefined' ) {  // Sponsor ID does not exist
            doesSponsorExist = false;
        } else {
            doesSponsorExist = true;
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

    } else { // Current user can view all Sponsors
        doesSponsorExist = true;
        userCanReadSponsor = true;
        sponsorID = '';
    };
    console.log(`sponsorID returned: ${sponsorID}`);

    return { /* userPermissionsSponsorDDL, */ userCanReadSponsors, userCanCreateSponsors,
             /* userPermissionsSponsors, */ sponsorsAllowedDDL,
             sponsorID, sponsorDetails, doesSponsorExist,
             userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor };
};

//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Scholarship permissions
//////////////////////////////////////////////////////////////////////////////////////////
async function getScholarshipPermissionsForUser( userPermissionsActive, sponsorID, scholarshipIDRequested ) {

    // declare and set local variables
    let userCanReadScholarships = false;
    let userCanCreateScholarships = false;
    let userPermissionsScholarships = []; // used??
    let scholarshipsAllowedDDL = [];
    let scholarshipIDDefault = 0; // used??
    let scholarshipID = 0;
    let scholarshipDetails = [];
    let doesScholarshipExist = false;
    let userCanReadScholarship = false;
    let userCanUpdateScholarship = false;
    let userCanDeleteScholarship = false;

    // Get the list of scholarship-related permissions for the current user
    const userPermissionsScholarshipDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-scholarships');

    // Can the current user view the Scholarships DDL?  What Scholarships can the current user see?
    if ( userPermissionsScholarshipDDL.length > 0 && userPermissionsScholarshipDDL[0].CanRead ) {
        userCanReadScholarships = true;
        console.log(`userCanReadScholarships: ${userCanReadScholarships}`);
        // What CRUD operations can the current user perform?
        userPermissionsScholarships = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'scholarships');
        // Find the list of Scholarships the current user can see (for loading into the "Scholarships:" dropdown list)
        if ( userPermissionsScholarships.length > 0 && userPermissionsScholarships[0].CanRead ) {
            if ( sponsorID !== '' ) { // A specific Sponsor was requested - load Scholarships for that Sponsor
                if ( userPermissionsScholarships[0].ObjectValues === '*' ) { // wildcard is limited to a specific Sponsor only
                    scholarshipsAllowedDDL = await ScholarshipsAllDDLTest.findAndCountAll({ where: { SponsorID: sponsorID } });
                    scholarshipIDDefault = 999999; // used ???
                } else {  // Current user can only see specific Scholarship(s)
// ToDo: expand for multiple specific Scholarships (eventually)
                    scholarshipsAllowedDDL = await ScholarshipsAllDDLTest.findAndCountAll({ where: { optionid: userPermissionsScholarships[0].ObjectValues } });
                    // Assign the default ScholarshipID to be the sole Scholarship allowed (only one permitted at the moment)
                    scholarshipIDDefault = userPermissionsScholarships[0].ObjectValues; // Set the Scholarship ID to the only one Scholarship the User has permission to see
                };
            } else {  // Load a blank row of data
                scholarshipsAllowedDDL = await ScholarshipsAllDDLTest.findAndCountAll({ where: { SponsorID: -1 } });
                scholarshipIDDefault = 999999; // used ???
            };
        } else {  // The user can see the Scholarships DDL, but has no Scholarships assigned to them - hide the DDL
            userCanReadScholarships = false;
        };
    };

    // Can the current user create new Scholarships?
    if ( userPermissionsScholarshipDDL.length > 0 && userPermissionsScholarshipDDL[0].CanCreate ) {
        userCanCreateScholarships = true;
    };
    
    // If a querystring request was made for a specific Scholarship
    if ( scholarshipIDRequested ) {
        console.log(`scholarshipIDRequested: ${scholarshipIDRequested}`);
        // Does the requested Scholarship exist? Retrieve the Scholarship's details from the database.
        scholarshipDetails = await ScholarshipsTableTest.findAll({ where: { ScholarshipID: scholarshipIDRequested }});
        if ( typeof scholarshipDetails[0] === 'undefined' ) {  // Scholarship ID does not exist
            doesScholarshipExist = false;
        } else { // Scholarship ID does exist
            doesScholarshipExist = true;
            // Can current user view requested Scholarship (or permission to view all Scholarships)?
            if ( scholarshipIDRequested === userPermissionsScholarships[0].ObjectValues
                 || userPermissionsScholarships[0].ObjectValues === '*' ) {
                userCanReadScholarship = userPermissionsScholarships[0].CanRead;
                console.log(`userCanReadScholarship: ${userCanReadScholarship}`);
                userCanUpdateScholarship = userPermissionsScholarships[0].CanUpdate;
                console.log(`userCanUpdateScholarship: ${userCanUpdateScholarship}`);
                userCanDeleteScholarship = userPermissionsScholarships[0].CanDelete;
                console.log(`userCanDeleteScholarship: ${userCanDeleteScholarship}`);
            };
            scholarshipID = scholarshipIDRequested;
        };

    } else if ( scholarshipIDDefault !== 999999) { // Requested Scholarship ID does not exist - if there a default Scholarship ID
        console.log(`scholarshipIDRequested does not exist - process default Scholarship ID: ${scholarshipIDDefault}`);
        // Does the default Scholarship exist? Retrieve the Scholarship's details from the database.
        scholarshipDetails = await ScholarshipsTableTest.findAll({ where: { ScholarshipID: scholarshipIDDefault }});
        if ( typeof scholarshipDetails[0] === 'undefined' ) {  // Scholarship ID does not exist
            doesScholarshipExist = false;
        } else {
            doesScholarshipExist = true;
            // Can current user view requested Scholarship (or permission to view all Scholarships)?
            if ( scholarshipIDDefault === userPermissionsScholarships[0].ObjectValues
                || userPermissionsScholarships[0].ObjectValues === '*' ) {
               userCanReadScholarship = userPermissionsScholarships[0].CanRead;
               console.log(`userCanReadScholarship: ${userCanReadScholarship}`);
               userCanUpdateScholarship = userPermissionsScholarships[0].CanUpdate;
               console.log(`userCanUpdateScholarship: ${userCanUpdateScholarship}`);
               userCanDeleteScholarship = userPermissionsScholarships[0].CanDelete;
               console.log(`userCanDeleteScholarship: ${userCanDeleteScholarship}`);
           };
           scholarshipID = scholarshipIDDefault;
        };

    } else { // Current user can view all Scholarships (or no Scholarships exist for the Sponsor)
        doesScholarshipExist = true;
        userCanReadScholarship = true;
        scholarshipID = '';
    };
    console.log(`scholarshipID returned: ${scholarshipID}`);

    return { userPermissionsScholarshipDDL, userCanReadScholarships, userCanCreateScholarships,
             userPermissionsScholarships, scholarshipsAllowedDDL,
             scholarshipID, scholarshipDetails, doesScholarshipExist,
             userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship };
};

module.exports = {
    convertOptionsToDelimitedString,
    getSponsorPermissionsForUser,
    getScholarshipPermissionsForUser
};