////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Common scripts for all pages (server-side scripts)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   logEvent
//   checkForNewUser
//   checkUserPermission
//   convertOptionsToDelimitedString
//   getWebsiteUserPermissionsForCurrentUser
//   getWebsiteUserPermissionPermissionsForCurrentUser
//   sendEmail
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////
const { EventLogsTable, UsersAllView, UsersAllDDL, UsersTable,
        UserPermissionsActive, UserPermissionsAllDDL, UserPermissionsAllView,
        UserPermissionsTable
    } = require('../models/sequelize_common.js');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const nodemailer = require('nodemailer');  // allows SMPT push emails to be sent
    

//////////////////////////////////////////////////////////////////////////////////////////
// Create a log entry
//////////////////////////////////////////////////////////////////////////////////////////
async function logEvent(processName, eventObject, eventCode, eventStatus, eventDescription, eventDuration,
    eventRows, eventUserID, sendEmailTo, eventObjectID) {

    let logEventResult = false;
    console.log('Logging event now...');

    //    async (req, res) => {
    try {
        console.log('Writing event to log...');
        const newEventLog = new EventLogsTable( {
            EventDate: Date().toString(),
            ProcessName: processName,
            EventObject: eventObject,
            EventObjectID: eventObjectID,
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

    return logEventResult;

};


//////////////////////////////////////////////////////////////////////////////////////////
// If the Current User is not configured for access (i.e., a New User),
// create an entry in the User Profiles table, and create their default User Permissions
//////////////////////////////////////////////////////////////////////////////////////////
async function checkForNewUser( usernameToCheck ) {

    // Local variables
    let errorCode = 0;
    let newUserID = 0;
    let today = new Date();
    let permissionExpirationDate = new Date();
    permissionExpirationDate.setFullYear(today.getFullYear() + 5);

    // Log the event
    let logEventResult = await logEvent('User Profiles', 'Get Current User', 0, 'Failure',
        'User not yet configured.', 0, 0, 0, '');

    // Add the new data to the database in a new record, and return the newly-generated [UserID] value
    const newUser = new UsersTable( { Username: usernameToCheck });
    await newUser.save()
        .then( async function() {
            newUserID = newUser.UserID;

            // Add New User Permission (Switchboard)
            const newUserPermissionSwitchboard = new UserPermissionsTable( {
                UserID: newUserID,
                PermissionCategoryID: '923001',
                ObjectValues: '*',
                EffectiveDate: today,
                ExpirationDate: permissionExpirationDate,
                CanCreate: false,
                CanRead: true,
                CanUpdate: false,
                CanDelete: false
            });
            await newUserPermissionSwitchboard.save()
                .then()
                .catch( async function(errorSwitchboard) {
                    errorCode = 902;
                    // Log the error
                    let logEventResult = logEvent('Error', 'New Permission', errorCode, 'Failure',
                        'Could not create new User Permission for Switchboard (' + errorSwitchboard + ').',
                        0, 0, newUserID, '');
                }); // END: Create new User Permission (Switchboard)

            // Add New User Permission (User Data Mgmt - allows user to manage their "profile" information)
            const newUserPermissionUserMgmt = new UserPermissionsTable( {
                UserID: newUserID,
                PermissionCategoryID: '923007',
                ObjectValues: '|' + newUserID + '|',
                EffectiveDate: today,
                ExpirationDate: permissionExpirationDate,
                CanCreate: false,
                CanRead: true,
                CanUpdate: true,
                CanDelete: false
            });
            await newUserPermissionUserMgmt.save()
                .then()
                .catch( async function(errorUserMgmt) {
                    errorCode = 902;
                    // Log the error
                    let logEventResult = logEvent('Error', 'New Permission', errorCode, 'Failure',
                        'Could not create new User Permission for User Data Mgmt (' + errorUserMgmt + ').',
                        0, 0, newUserID, '');
                }); // END: Create new User Permission (User Data Mgmt)

        }).catch( function(errorUserProfile) { // Could not create new User Profile
            errorCode = 901;
            // Log the error
            let logEventResult = logEvent('Error', 'New User', errorCode, 'Failure',
                'Could not create new User Profile (' + errorUserProfile + ').',
                0, 0, newUserID, '');
        }); // END: Create new User Profile

    let emailResultError = sendEmail(
        process.env.EMAIL_WEBMASTER_LIST,
        `New User Account Created`,
        `A New User Account was successfully created for ${usernameToCheck}.`,
        '');

    // New User successfully configured
    
    return { errorCode, newUserID };
       
}; // END: checkForNewUser()


//////////////////////////////////////////////////////////////////////////////////////////
// Check Current User Permission
//////////////////////////////////////////////////////////////////////////////////////////
async function checkUserPermission(userID, permissionCategoryID, permissionType) {

    // default to "false"
    var permissionStatus = 0;

    // Get the list of active permissions for the user
    const matchingPermissions = await UserPermissionsActive.findAndCountAll( {
        where: { UserID: userID,
                 PermissionCategoryID: permissionCategoryID },
    });

    // Does the user have the requested permission?
    switch ( permissionType ) {
        case 'CanCreate':    permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanCreate : 0; break;
        case 'CanRead':      permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanRead   : 0; break;
        case 'CanUpdate':    permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanUpdate : 0; break;
        case 'CanDelete':    permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanDelete : 0; break;
        case 'ObjectValues': permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].ObjectValues : 'test'; break;
    };

    return permissionStatus;

}; // end "checkUserPermission"


//////////////////////////////////////////////////////////////////////////////////////////
// Format selected options in a SELECT control into a delimited string for database storage
// => server-side version (see public/js/foa_fx.js for client-side version)
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
// Get the Current User's Website User Profile permissions
//   (permissions to let the Current User manage other website Users' profile)
// Notes:  Input parameters are validated prior to this function call.
//////////////////////////////////////////////////////////////////////////////////////////
async function getWebsiteUserPermissionsForCurrentUser( currentUserID, userIDRequested ) {

    // declare and set local variables
    let userCanReadUsersDDL = false; // DDL permission
    let userCanCreateUsers = false; // "Add User" link permission
    let usersAllowedToCurrentUser = '';
    let usersAllowedToCurrentUserArray = [];
    let usersAllowedDDL = [];
    let userDetails = []; // User Profile data
    let doesUserExist = false;
    let userCanReadUser = false;
    let userCanUpdateUser = false;
    let userCanDeleteUser = false;

    ////////////////////////////////////////////////////////////////////
    // Get the list of general user-related permissions for the current user
    ////////////////////////////////////////////////////////////////////

    // "Website Users" DDL on Main Menu
    userCanReadUsersDDL = await checkUserPermission( currentUserID, '923004', 'CanRead' );
    userCanCreateUsers = await checkUserPermission( currentUserID, '923004', 'CanCreate' );

    // "Website Users" allowed to the Current User
    usersAllowedToCurrentUser = await checkUserPermission( currentUserID, '923007', 'ObjectValues' );
    usersAllowedToCurrentUserArray = usersAllowedToCurrentUser.split('|').slice(1, -1);
    if ( usersAllowedToCurrentUser === '*' ) {
        usersAllowedDDL = await UsersAllDDL.findAndCountAll({});
    } else {  // Current user can only see specific Website User(s)
        usersAllowedDDL = await UsersAllDDL.findAndCountAll({ where: { optionid: usersAllowedToCurrentUserArray } });
    };

    ////////////////////////////////////////////////////////////////////
    // If a querystring request was made for a specific User, retrieve the profile and associated permissions
    ////////////////////////////////////////////////////////////////////
    if ( userIDRequested.toString().length > 0 ) {
        // Does the requested User exist? Retrieve the User's details from the database.
        userDetails = await UsersAllView.findAll({ where: { UserID: userIDRequested }});
        if ( typeof userDetails[0] === 'undefined' ) {  // User ID does not exist
            doesUserExist = false;
        } else { // User ID does exist
            doesUserExist = true;
            // Can current user view requested website user?
            if ( usersAllowedToCurrentUserArray.indexOf(userIDRequested.toString()) > -1
                 || (usersAllowedToCurrentUser === '*') ) {
                userCanReadUser = await checkUserPermission( currentUserID, '923007', 'CanRead' );
                userCanUpdateUser = await checkUserPermission( currentUserID, '923007', 'CanUpdate' );
                userCanDeleteUser = await checkUserPermission( currentUserID, '923007', 'CanDelete' );
            };
        };
    }; // End: Retrieve Requested Website User profile
/*
    console.log(`currentUserID: ${currentUserID}`);
    console.log(`userIDRequested: ${userIDRequested}`);
    console.log(`userCanReadUsersDDL: ${userCanReadUsersDDL}`);
    console.log(`usersAllowedToCurrentUser: ${usersAllowedToCurrentUser}`);
    console.log(`usersAllowedDDL.count: ${usersAllowedDDL.count}`);
    console.log(`userCanReadUser: ${userCanReadUser}`);
    console.log(`userCanUpdateUser: ${userCanUpdateUser}`);
    console.log(`userCanDeleteUser: ${userCanDeleteUser}`);
*/
    return { userCanReadUsersDDL, userCanCreateUsers, usersAllowedDDL,
             userDetails, doesUserExist, userCanReadUser, userCanUpdateUser, userCanDeleteUser };
};


//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Website "User Permission" permissions
//   (permissions to let the Current User manage other Website Users' permissions)
//////////////////////////////////////////////////////////////////////////////////////////
async function getWebsiteUserPermissionPermissionsForCurrentUser( currentUserID, userIDRequested, userPermissionIDRequested ) {

    console.log(`userIDRequested at Permissions fx: ${userIDRequested}`);
    console.log(`userPermissionIDRequested at Permissions fx: ${userPermissionIDRequested}`);

    // declare and set local variables
    // User Permissions
    //    (note individual website user permissions are not separated in authority; 
    //     if the current user can see any user permission, they can see all user permissions)
    let userCanReadUserPermissionsDDL = false; // DDL permissions
    let userPermissionsAllowedToCurrentUser = '';
    let userPermissionsAllowedToCurrentUserArray = [];
    let userPermissionsAllowedDDL = [];
    let userPermissionDetails = []; // User Permissions data
    let doesUserPermissionExist = false;
    let userCanCreateUserPermissions = false;
    let userCanReadUserPermission = false;
    let userCanUpdateUserPermission = false;
    let userCanDeleteUserPermission = false;

    // Get the generic "user permission" permissions for the current user
    userCanReadUserPermissionsDDL = await checkUserPermission( currentUserID, '923009', 'CanRead' );
    userCanCreateUserPermissions = await checkUserPermission( currentUserID, '923009', 'CanCreate' );
    userPermissionsAllowedToCurrentUser = await checkUserPermission( currentUserID, '923008', 'ObjectValues' );
    userPermissionsAllowedToCurrentUserArray = userPermissionsAllowedToCurrentUser.split('|').slice(1, -1);

    // Can the current user view the User Permissions DDL?
    if ( userCanReadUserPermissionsDDL && userIDRequested.toString().length > 0 ) {

        // "Website User Permissions" allowed to the Current User for the requested UserID
        // (same across all users - not differentiated by user)
        if ( userPermissionsAllowedToCurrentUser === '*' ) {
            userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll({ where: {UserID: userIDRequested}});
        } else {  // Current user can only see specific Website User Permission(s) -- not current used!
/*
            userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll({
                where: { 
                    optionid: userPermissionsAllowedToCurrentUserArray,
                    UserID: userIDRequested
                }
            });
*/
        };
    
        // If a querystring request was made for a specific User's Permission data, find and validate it
        if ( userPermissionIDRequested.toString().length > 0 ) {
            // Does the requested User Permission exist? Retrieve the User Permissions's details from the database.
            userPermissionDetails = await UserPermissionsAllView.findAll({
                where: { UserID: userIDRequested,
                         WebsiteUserPermissionID: userPermissionIDRequested }});
            if ( typeof userPermissionDetails[0] === 'undefined' ) {  // User Permission does not exist
                doesUserPermissionExist = false;
            } else { // User Permission does exist
                doesUserPermissionExist = true;
                // Current User has already been validated to *view* any permissions via the "View DDL" check above
                // so just check on the Current User's ability to make updates, etc.
                userCanReadUserPermission = await checkUserPermission( currentUserID, '923008', 'CanRead' );
                userCanUpdateUserPermission = await checkUserPermission( currentUserID, '923008', 'CanUpdate' );
                userCanDeleteUserPermission = await checkUserPermission( currentUserID, '923008', 'CanDelete' );
            };
        }; // End: Retrieve Requested Website User Permission details

    } else { // populate a blank data set
        userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll( { where: { optionid: 0 } } );
    }; // End: User can read the User Permissions DDL (no "else" as the variable defaults above are set to this condition)

    console.log(`currentUserID: ${currentUserID}`);
    console.log(`userIDRequested: ${userIDRequested}`);
    console.log(`userPermissionIDRequested: ${userPermissionIDRequested}`);
    console.log(`userCanReadUserPermissionsDDL: ${userCanReadUserPermissionsDDL}`);
    console.log(`userPermissionsAllowedToCurrentUser: ${userPermissionsAllowedToCurrentUser}`);
    console.log(`userPermissionsAllowedDDL.count: ${userPermissionsAllowedDDL.count}`);
    console.log(`userCanReadUserPermission: ${userCanReadUserPermission}`);
    console.log(`userCanUpdateUserPermission: ${userCanUpdateUserPermission}`);
    console.log(`userCanDeleteUserPermission: ${userCanDeleteUserPermission}`);
    console.log(`doesUserPermissionExist: ${doesUserPermissionExist}`)
    console.log(`userPermissionDetails[0]: ${userPermissionDetails[0]}`)

    return { userCanReadUserPermissionsDDL, userCanCreateUserPermissions, userPermissionsAllowedDDL,
             userPermissionDetails, doesUserPermissionExist,
             userCanReadUserPermission, userCanUpdateUserPermission, userCanDeleteUserPermission
    };
};


//////////////////////////////////////////////////////////////////////////////////////////
// Send email
//////////////////////////////////////////////////////////////////////////////////////////
function sendEmail(emailRecipient, emailSubject, emailBody, emailBodyHTML) {

    let result = '';

    // create message
    var msg = {
        to: emailRecipient,
        from: process.env.EMAIL_SENDER_FOA,  // Fatcow
        replyTo: process.env.EMAIL_REPLY_TO,
        subject: emailSubject,
        text: emailBody,
        html: emailBodyHTML
    };

    // create the transport object (Fatcow)
    var transporter = nodemailer.createTransport( {  // the email account to send SMTP emails
        host: 'smtp.fatcow.com',
        port: 465, // 587 without SSL
        secure: true,
        auth: {
            user: process.env.EMAIL_SENDER_FOA,
            pass: process.env.EMAIL_PWD_FOA
          }
    });

    // send the email
    transporter.sendMail( msg, function (error, info) {
        if (error) {
            console.log(error);
            // ToDo: log error in "events" table


        } else {
            console.log('Email sent: ' + info.response);

            // ToDo: log event in "events" table


        }
    });

    return result;
    
}; // end "sendEmail"


module.exports = {
    logEvent,
    checkUserPermission,
    checkForNewUser,
    convertOptionsToDelimitedString,
    getWebsiteUserPermissionsForCurrentUser,
    getWebsiteUserPermissionPermissionsForCurrentUser,
    sendEmail
};