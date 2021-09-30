//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

//const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
//const pageSponsorVolume = 15; // number of sponsors to be displayed on a page
const { EventLogsTable, ScholarshipsTable, /* ScholarshipsTableTest, */ ScholarshipsActive,
        /* ScholarshipsActiveDDL, */ ScholarshipsAllDDL,
        /* ScholarshipsAllDDLTest, */ SponsorsTable, /* SponsorsTableTest, */ SponsorsAllDDL, Sponsors, SponsorsDDL,
        /* SponsorsAllDDLTest, */
        GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
        EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
        FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
        UsersAllDDL, UsersTable, UsersAllView, UserProfiles,
        UserPermissionsTable, UserPermissionsActive, UserPermissionCategoriesAllDDL, UserPermissionsAllView, UserPermissionsAllDDL,
        ScholarshipRecurrenceCategoriesDDL, ScholarshipsAllMgmtView /* ScholarshipsAllMgmtViewTest */
    } = require('../models/sequelize.js');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const nodemailer = require('nodemailer');  // allows SMPT push emails to be sent


//////////////////////////////////////////////////////////////////////////////////////////
// Create a log entry
//////////////////////////////////////////////////////////////////////////////////////////
async function logEvent(processName, eventObject, eventCode, eventStatus, eventDescription, eventDuration,
                        eventRows, eventUserID, sendEmailTo) {

    let logEventResult = false;
    console.log('Logging event now...');

//    async (req, res) => {
    try {
        console.log('Writing event to log...');
        const newEventLog = new EventLogsTable( {
            EventDate: Date().toString(),
            ProcessName: processName,
            EventObject: eventObject,
            EventStatus: eventStatus,
            EventDescription: eventDescription,
            EventDuration: eventDuration,
            EventRows: eventRows,
            EventUserID: eventUserID,
            EventCode: eventCode
        });
        await newEventLog.save();
        console.log('Event written to log...');
        logEventResult = true;
        console.log('Event logged.');
        if ( sendEmailTo.length !== 0 ) {
            let emailResultLogSuccess = sendEmail(sendEmailTo, `Event Logged (${eventStatus})`,
                `An event was logged for ${processName}:  ${eventDescription}`, '');
        };
    } catch (error) {
        let emailResultError = sendEmail(process.env.EMAIL_WEBMASTER_LIST, 'Event Log Error',
            `An error occurred logging an event: ${error}`, '');
        console.log(`Event not logged (${error})`);
    };
//    };
//    console.log(`Event Log Error (${error})`);

    return logEventResult;
    
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
    const userPermissionsSponsorDDL = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923003);

    // Can the current user view the Sponsors DDL?  What Sponsors can the current user see?
    if ( userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) {
        userCanReadSponsors = true;
        // What CRUD operations can the current user perform?
        userPermissionsSponsors = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923006);
        // Find the list of Sponsors the current user can see (for loading into the "Sponsors:" dropdown list)
        if ( userPermissionsSponsors.length > 0 && userPermissionsSponsors[0].CanRead ) {
            if ( userPermissionsSponsors[0].ObjectValues === '*' ) {
                sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll({});
                sponsorIDDefault = 999999;
            } else {  // Current user can only see specific Sponsor(s)
                sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll({ where: { optionid: userPermissionsSponsors[0].ObjectValues } });
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
        sponsorDetails = await SponsorsTable.findAll({ where: { SponsorID: sponsorIDRequested }});
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
        sponsorDetails = await SponsorsTable.findAll({ where: { SponsorID: sponsorIDDefault }});
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

    } else { // No specific Sponsor was requested, or user can read all Sponsors
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

    console.log(`sponsorID at Scholarships fx: ${sponsorID}`);

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
    const userPermissionsScholarshipDDL = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923005);

    // Can the current user view the Scholarships DDL?  What Scholarships can the current user see?
    if ( userPermissionsScholarshipDDL.length > 0 && userPermissionsScholarshipDDL[0].CanRead ) {
        userCanReadScholarships = true;
        console.log(`userCanReadScholarships: ${userCanReadScholarships}`);
        // What CRUD operations can the current user perform?
        userPermissionsScholarships = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923005);
        // Find the list of Scholarships the current user can see (for loading into the "Scholarships:" dropdown list)
        if ( userPermissionsScholarships.length > 0 && userPermissionsScholarships[0].CanRead ) {
            if ( sponsorID !== '' ) { // A specific Sponsor was requested - load Scholarships for that Sponsor
                if ( userPermissionsScholarships[0].ObjectValues === '*' ) { // wildcard is limited to a specific Sponsor only
                    scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { SponsorID: sponsorID } });
                    scholarshipIDDefault = 999999; // used ???
                } else {  // Current user can only see specific Scholarship(s)
// ToDo: expand for multiple specific Scholarships (eventually)
                    scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { optionid: userPermissionsScholarships[0].ObjectValues } });
                    // Assign the default ScholarshipID to be the sole Scholarship allowed (only one permitted at the moment)
                    scholarshipIDDefault = userPermissionsScholarships[0].ObjectValues; // Set the Scholarship ID to the only one Scholarship the User has permission to see
                };
            } else {  // Load a blank row of data
                scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { SponsorID: -1 } });
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
        scholarshipDetails = await ScholarshipsAllMgmtView.findAll({ where: { ScholarshipID: scholarshipIDRequested }});
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
        scholarshipDetails = await ScholarshipsAllMgmtView.findAll({ where: { ScholarshipID: scholarshipIDDefault }});
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

//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Website User Profile permissions
//   (permissions to let the Current User manage other website Users' profile)
//////////////////////////////////////////////////////////////////////////////////////////
async function getUserPermissionsForWebsiteUser( userPermissionsActive, userIDRequested ) {

    // declare and set local variables
    // User Profiles
    let userCanReadUsers = false; // DDL permission
    let userCanCreateUsers = false; // "Add User" link permission
    let userPermissionsUsers = [];
    let usersAllowedDDL = [];
    let userIDDefault = 0;
    let userID = 0;
    let userDetails = []; // User Profile data
    let doesUserExist = false;
    let userCanReadUser = false;
    let userCanUpdateUser = false;
    let userCanDeleteUser = false;

    // Get the list of user-related permissions for the current user
    const userPermissionsUserDDL = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923004);

    // Can the current user view the Users DDL?  What Users can the current user see?
    if ( userPermissionsUserDDL.length > 0 && userPermissionsUserDDL[0].CanRead ) {
        userCanReadUsers = true;
        // What CRUD operations can the current user perform?
        userPermissionsUsers = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923007);
        // Find the list of Users the current user can see (for loading into the "User:" dropdown list)
        if ( userPermissionsUsers.length > 0 && userPermissionsUsers[0].CanRead ) {
            if ( userPermissionsUsers[0].ObjectValues === '*' ) {
                usersAllowedDDL = await UsersAllDDL.findAndCountAll({});
                userIDDefault = 999999;
            } else {  // Current user can only see specific User(s)
                usersAllowedDDL = await UsersAllDDL.findAndCountAll({ where: { optionid: userPermissionsUsers[0].ObjectValues } });
// ToDo: expand for multiple Users (eventually)
                // Assign the default UserID to be the sole User allowed
                userIDDefault = userPermissionsUsers[0].ObjectValues; // Set the User ID to the only one User the User has permission to see
            };
        } else {  // The user can see the Users DDL, but has no Users assigned to them - hide the DDL
            userCanReadUsers = false;
        };
    };
    console.log(`userPermissionsUserDDL.length: ${userPermissionsUserDDL.length}`);
    console.log(`userPermissionsUserDDL[0].CanRead: ${userPermissionsUserDDL[0].CanRead}`);
    console.log(`userCanReadUsers: ${userCanReadUsers}`);

    // Can the current user create new Users?
    if ( userPermissionsUserDDL.length > 0 && userPermissionsUserDDL[0].CanCreate ) {
        userCanCreateUsers = true;
    };
    
    // If a querystring request was made for a specific User 
    if ( userIDRequested ) {
        console.log(`userIDRequested: ${userIDRequested}`);
        // Does the requested User exist? Retrieve the User's details from the database.
        userDetails = await UsersAllView.findAll({ where: { UserID: userIDRequested }});
        if ( typeof userDetails[0] === 'undefined' ) {  // User ID does not exist
            doesUserExist = false;
        } else { // User ID does exist
            doesUserExist = true;
            // Can current user view requested User (or permission to view all Users)?
            if ( userIDRequested === userPermissionsUsers[0].ObjectValues
                 || userPermissionsUsers[0].ObjectValues === '*' ) {
                userCanReadUser = userPermissionsUsers[0].CanRead;
                console.log(`userCanReadUser: ${userCanReadUser}`);
                userCanUpdateUser = userPermissionsUsers[0].CanUpdate;
                console.log(`userCanUpdateUser: ${userCanUpdateUser}`);
                userCanDeleteUser = userPermissionsUsers[0].CanDelete;
                console.log(`userCanDeleteUser: ${userCanDeleteUser}`);
            };
            userID = userIDRequested;
        };

    } else if ( userIDDefault !== 999999) { // Requested User ID does not exist - if there a default User ID
        console.log(`userIDRequested does not exist - process default User ID: ${userIDDefault}`);
        // Does the default User exist? Retrieve the User's details from the database.
        userDetails = await UsersAllView.findAll({ where: { UserID: userIDDefault }});
        if ( typeof userDetails[0] === 'undefined' ) {  // User ID does not exist
            doesUserExist = false;
        } else {
            doesUserExist = true;
            // Can current user view requested User (or permission to view all Users)?
            if ( userIDDefault === userPermissionsUsers[0].ObjectValues
                || userPermissionsUsers[0].ObjectValues === '*' ) {
               userCanReadUser = userPermissionsUsers[0].CanRead;
               console.log(`userCanReadUser: ${userCanReadUser}`);
               userCanUpdateUser = userPermissionsUsers[0].CanUpdate;
               console.log(`userCanUpdateUser: ${userCanUpdateUser}`);
               userCanDeleteUser = userPermissionsUsers[0].CanDelete;
               console.log(`userCanDeleteUser: ${userCanDeleteUser}`);
           };
           userID = userIDDefault;
        };

    } else { // No specific User was requested, or user can read all Users
        doesUserExist = true;
        userCanReadUser = true;
        userID = '';
    };
    console.log(`userID returned: ${userID}`);

    return { /* userPermissionsUserDDL, */ userCanReadUsers, userCanCreateUsers,
             /* userPermissionsUsers, */ usersAllowedDDL,
             userID, userDetails, doesUserExist,
             userCanReadUser, userCanUpdateUser, userCanDeleteUser };
};

//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Website User's Permission permissions
//   (permissions to let the Current User manage other Website Users' permissions)
//////////////////////////////////////////////////////////////////////////////////////////
async function getUserPermissionsForWebsiteUserPermission( userPermissionsActive, userIDRequested, userPermissionIDRequested ) {

    console.log(`userIDRequested at Permissions fx: ${userIDRequested}`);

    // declare and set local variables
    // User Permissions (note individual website user permissions are not separated in authority; 
    // if the current user can see any user permission, they can see all user permissions)
    let userCanReadUserPermissions = false; // DDL permissions
    let userCanCreateUserPermissions = false; // "Add Permission" link permission
    let userPermissionsUserPermissions = [];  // Current User's permissions for requested Website User's permissions
    let userPermissionsAllowedDDL = [];
    let userPermissionIDDefault = 0;
    let userPermissionID = 0;  // same as used above
    let userPermissionDetails = []; // User Permissions data
    let doesUserPermissionExist = false;
    let userCanReadUserPermission = false;
    let userCanUpdateUserPermission = false;
    let userCanDeleteUserPermission = false;

    // Get the list of user permissions-related permissions for the current user
    const userPermissionsUserPermissionDDL = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923009);

    // Can the current user view the User Permissions DDL?  What User Permissions can the current user see?
    if ( userPermissionsUserPermissionDDL.length > 0 && userPermissionsUserPermissionDDL[0].CanRead ) {
        userCanReadUserPermissions = true;

        // What CRUD operations can the current user perform?
        userPermissionsUserPermissions = userPermissionsActive.rows.filter( permission => permission.PermissionCategoryID === 923008);
        // Find the list of User Permissions the current user can see (for loading into the "User:" dropdown list)
        if ( userPermissionsUserPermissions.length > 0 && userPermissionsUserPermissions[0].CanRead ) {
            if ( userIDRequested !== '' ) { // A specific User was requested - load User Permissions for that User
                if ( userPermissionsUserPermissions[0].ObjectValues === '*' ) {
                    userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll({ where: { UserID: userIDRequested } });
                    userPermissionIDDefault = 999999;
                } else {  // Current user can only see specific User Permission(s)
                    userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll({ where: { optionid: userPermissionsUserPermissions[0].ObjectValues } });
// ToDo: expand for multiple User Permissions (eventually)
                    // Assign the default UserPermissionID to be the sole User Permission allowed
                    userPermissionIDDefault = userPermissionsUserPermissions[0].ObjectValues; // Set the User Permission ID to the only one User Permission the User has permission to see
                };
            } else {  // Load a blank row of data
                userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll({ where: { UserID: -1 } });
                userPermissionIDDefault = 999999; // used ???
            };
        } else {  // The user can see the User Permissions DDL, but has no User Permissions assigned to them - hide the DDL
            userCanReadUserPermissions = false;
        };

    };
    console.log(`userPermissionsUserPermissionDDL.length: ${userPermissionsUserPermissionDDL.length}`);
    console.log(`record Permission Category ID: ${userPermissionsUserPermissionDDL[0].PermissionCategoryID}`);
    console.log(`userCanReadUserPermissions: ${userCanReadUserPermissions}`);

    // Can the current user create new User Permissions? (Current logic is always true for allowed User)
    if ( userPermissionsUserPermissionDDL.length > 0 && userPermissionsUserPermissionDDL[0].CanCreate ) {
        userCanCreateUserPermissions = true;
    };

    // If a querystring request was made for a specific User Permission
    if ( userPermissionIDRequested ) {
        console.log(`userPermissionIDRequested: ${userPermissionIDRequested}`);
        // Does the requested User Permission exist? Retrieve the User Permission's details from the database.
        userPermissionDetails = await UserPermissionsAllView.findAll({ where: { WebsiteUserPermissionID: userPermissionIDRequested }});
        if ( typeof userPermissionDetails[0] === 'undefined' ) {  // User Permission ID does not exist
            doesUserPermissionExist = false;
        } else { // User Permission ID does exist
            doesUserPermissionExist = true;
            // Can current user view requested User Permission (or permission to view all User Permissions)?
            if ( userPermissionIDRequested === userPermissionsUserPermissions[0].ObjectValues
                 || userPermissionsUserPermissions[0].ObjectValues === '*' ) {
                userCanReadUserPermission = userPermissionsUserPermissions[0].CanRead;
                console.log(`userCanReadUserPermission: ${userCanReadUserPermission}`);
                userCanUpdateUserPermission = userPermissionsUserPermissions[0].CanUpdate;
                console.log(`userCanUpdateUserPermission: ${userCanUpdateUserPermission}`);
                userCanDeleteUserPermission = userPermissionsUserPermissions[0].CanDelete;
                console.log(`userCanDeleteUserPermission: ${userCanDeleteUserPermission}`);
            };
            userPermissionID = userPermissionIDRequested;
        };

    } else if ( userPermissionIDDefault !== 999999) { // Requested User Permission ID does not exist - if there a default User Permission ID
        console.log(`userPermissionIDRequested does not exist - process default User Permission ID: ${userPermissionIDDefault}`);
        // Does the default User Permission exist? Retrieve the User Permission's details from the database.
        userPermissionDetails = await UserPermissionsAllView.findAll({ where: { WebsiteUserPermissionID: userPermissionIDDefault }});
        if ( typeof userPermissionDetails[0] === 'undefined' ) {  // User Permission ID does not exist
            doesUserPermissionExist = false;
        } else {
            doesUserPermissionExist = true;
            // Can current user view requested User Permission (or permission to view all User Permissions)?
            if ( userPermissionIDDefault === userPermissionsUserPermissions[0].ObjectValues
                || userPermissionsUserPermissions[0].ObjectValues === '*' ) {
               userCanReadUserPermission = userPermissionsUserPermissions[0].CanRead;
               console.log(`userCanReadUserPermission: ${userCanReadUserPermission}`);
               userCanUpdateUserPermission = userPermissionsUserPermissions[0].CanUpdate;
               console.log(`userCanUpdateUserPermission: ${userCanUpdateUserPermission}`);
               userCanDeleteUserPermission = userPermissionsUserPermissions[0].CanDelete;
               console.log(`userCanDeleteUserPermission: ${userCanDeleteUserPermission}`);
           };
           userPermissionID = userPermissionIDDefault;
        };

    } else { // No specific User Permission was requested, or user can read all User Permissions

        doesUserPermissionExist = true;
        userCanReadUserPermission = true;
        userPermissionID = '';

    };

    console.log(`userPermissionID returned: ${userPermissionID}`);

    return { userCanReadUserPermissions, userCanCreateUserPermissions, userPermissionsAllowedDDL,
             userPermissionID, userPermissionDetails, doesUserPermissionExist,
             userCanReadUserPermission, userCanUpdateUserPermission, userCanDeleteUserPermission };
};


//////////////////////////////////////////////////////////////////////////////////////////
// Send email
//////////////////////////////////////////////////////////////////////////////////////////
function sendEmail(emailRecipient, emailSubject, emailBody, emailBodyHTML) {

    // create message
    var msg = {
        to: emailRecipient,
        from: process.env.EMAIL_SENDER,
        subject: emailSubject,
        text: emailBody,
        html: emailBodyHTML
    };

    // send the message
    // nodemailer example
    var transporter = nodemailer.createTransport( {  // the email account to send SMTP emails
//        service: 'smtp.fatcow.com',
        host: 'smtp.gmail.com',
        port: 465, // 587 without SSL
        secure: true,
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_SENDER,
            clientId: process.env.EMAIL_OAUTH_CLIENTID,
            clientSecret: process.env.EMAIL_OAUTH_CLIENTSECRET,
            refreshToken: process.env.EMAIL_OAUTH_REFRESHTOKEN
        },
    });
    transporter.sendMail( msg, function (error, info) {
        if (error) {
            console.log(error);
            // ToDo: log error in "events" table
        } else {
            console.log('Email sent: ' + info.response);
            // ToDo: log event in "events" table
        }
    });
/*
    // sendGrid example
    sendgrid
      .send(msg)
      .then((resp) => {
        console.log('Email sent\n', resp)
        // ToDo: log event in "events" table
        })
      .catch((error) => {
        console.error(error)
        // ToDo: log error in "events" table
        });
*/

}; // end "sendEmail"


module.exports = {
    convertOptionsToDelimitedString,
    getSponsorPermissionsForUser,
    getScholarshipPermissionsForUser,
    getUserPermissionsForWebsiteUser,
    getUserPermissionsForWebsiteUserPermission,
    sendEmail,
    logEvent
};