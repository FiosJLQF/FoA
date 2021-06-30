//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

//const pageScholarshipVolume = 15; // number of scholarships to be displayed on a page
//const pageSponsorVolume = 15; // number of sponsors to be displayed on a page
const { EventLogsTable, ScholarshipsTableTest, ScholarshipsActive, ScholarshipsActiveDDL, ScholarshipsAllDDL,
        ScholarshipsAllDDLTest, SponsorsTableTest, Sponsors, SponsorsDDL, SponsorsAllDDLTest, 
        GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
        EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
        FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
        UsersAllDDL, UsersTable, UserPermissionsActive, UserProfiles,
        ScholarshipRecurrenceCategoriesDDL, ScholarshipsAllMgmtViewTest
    } = require('../models/sequelize.js');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const nodemailer = require('nodemailer');  // allows SMPT push emails to be sent

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
                `An event was logged for ${processName}:  ${eventDescription}`);
            };
        } catch (error) {
            let emailResultError = sendEmail(process.env.EMAIL_WEBMASTER_LIST, 'Event Log Error',
            `An error occurred logging an event: ${error}`);
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
    const userPermissionsSponsorDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === '923003');

    // Can the current user view the Sponsors DDL?  What Sponsors can the current user see?
    if ( userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) {
        userCanReadSponsors = true;
        // What CRUD operations can the current user perform?
        userPermissionsSponsors = userPermissionsActive.rows.filter( permission => permission.ObjectName === '923006');
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
    const userPermissionsScholarshipDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === '923005');

    // Can the current user view the Scholarships DDL?  What Scholarships can the current user see?
    if ( userPermissionsScholarshipDDL.length > 0 && userPermissionsScholarshipDDL[0].CanRead ) {
        userCanReadScholarships = true;
        console.log(`userCanReadScholarships: ${userCanReadScholarships}`);
        // What CRUD operations can the current user perform?
        userPermissionsScholarships = userPermissionsActive.rows.filter( permission => permission.ObjectName === '923005');
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
        scholarshipDetails = await ScholarshipsAllMgmtViewTest.findAll({ where: { ScholarshipID: scholarshipIDRequested }});
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
        scholarshipDetails = await ScholarshipsAllMgmtViewTest.findAll({ where: { ScholarshipID: scholarshipIDDefault }});
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
// Get the Current User's User permissions (permissions to let the Current User manage other website Users)
//////////////////////////////////////////////////////////////////////////////////////////
async function getUserPermissionsForUser( userPermissionsActive, userIDRequested ) {

    // declare and set local variables
    let userCanReadUsers = false;
    let userCanCreateUsers = false;
    let userPermissionsUsers = [];
    let usersAllowedDDL = [];
    let userIDDefault = 0;
    let userID = 0;
    let userDetails = [];
    let doesUserExist = false;
    let userCanReadUser = false;
    let userCanUpdateUser = false;
    let userCanDeleteUser = false;

    // Get the list of user-related permissions for the current user
    const userPermissionsUserDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === '923004');

    // Can the current user view the Users DDL?  What Users can the current user see?
    if ( userPermissionsUserDDL.length > 0 && userPermissionsUserDDL[0].CanRead ) {
        userCanReadUsers = true;
        // What CRUD operations can the current user perform?
        userPermissionsUsers = userPermissionsActive.rows.filter( permission => permission.ObjectName === '923007');
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
        userDetails = await UsersTable.findAll({ where: { UserID: userIDRequested }});
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
        userDetails = await UsersTable.findAll({ where: { UserID: userIDDefault }});
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
// Send email
//////////////////////////////////////////////////////////////////////////////////////////
function sendEmail(emailRecipient, emailSubject, emailBody) {

    // create message
    var msg = {
        to: emailRecipient,
        from: process.env.EMAIL_SENDER,
        subject: emailSubject,
        text: emailBody // change to HTML once content is pre-checked
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
    getUserPermissionsForUser,
    sendEmail,
    logEvent
};