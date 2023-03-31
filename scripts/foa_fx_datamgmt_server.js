//////////////////////////////////////////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////////////////////////////////////////

const { ScholarshipsAllDDL, ScholarshipsAllMgmtView, SponsorsAllView, SponsorsAllDDL
    } = require('../models/sequelize_foa.js');
const { UserPermissionsAllDDL, UserPermissionsAllView
    } = require('../models/sequelize_common.js');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const nodemailer = require('nodemailer');  // allows SMPT push emails to be sent
const commonFx = require('./common_fx_server');


//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Sponsor permissions
// Notes:  Input parameters are validated prior to this function call.
//////////////////////////////////////////////////////////////////////////////////////////
async function getSponsorPermissionsForCurrentUser( currentUserID, sponsorIDRequested ) {

    // declare and set local variables
    let userCanReadSponsorsDDL = false;
    let sponsorsAllowedToUser = '';
    let sponsorsAllowedToUserArray = [];
    let userCanCreateSponsors = false;
    let sponsorsAllowedDDL = [];
    let sponsorDetails = [];
    let doesSponsorExist = false;
    let userCanReadSponsor = false;
    let userCanUpdateSponsor = false;
    let userCanDeleteSponsor = false;

    // Get the generic sponsor-related permissions for the current user
    userCanReadSponsorsDDL = await commonFx.checkUserPermission( currentUserID, '923003', 'CanRead' );
    sponsorsAllowedToUser = await commonFx.checkUserPermission( currentUserID, '923006', 'ObjectValues' );
    sponsorsAllowedToUserArray = sponsorsAllowedToUser.split('|').slice(1, -1);
    userCanCreateSponsors = await commonFx.checkUserPermission( currentUserID, '923003', 'CanCreate' );

    // Can the current user view the Sponsors DDL?
    if ( userCanReadSponsorsDDL ) {

        // Find the list of Sponsors the current user is allowed to see (for loading into the DDL)
        if ( sponsorsAllowedToUser === '*' ) {
            sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll({});
        } else {  // Current user can only see specific Sponsor(s)
            sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll({ where: { optionid: sponsorsAllowedToUserArray } });
        };

        // If a querystring request was made for a specific Sponsor's data, find and validate it
        if ( sponsorIDRequested.toString().length > 0 ) {
            // Does the requested Sponsor exist? Retrieve the Sponsor's details from the database.
            sponsorDetails = await SponsorsAllView.findAll({ where: { SponsorID: sponsorIDRequested }});
            if ( typeof sponsorDetails[0] === 'undefined' ) {  // Sponsor ID does not exist
                doesSponsorExist = false;
            } else { // Sponsor ID does exist
                doesSponsorExist = true;
                // Can current user view requested sponsor?
                if ( sponsorsAllowedToUserArray.indexOf(sponsorIDRequested.toString()) > -1 || (sponsorsAllowedToUser === '*') ) {
                    userCanReadSponsor = await commonFx.checkUserPermission( currentUserID, '923006', 'CanRead' );
                    userCanUpdateSponsor = await commonFx.checkUserPermission( currentUserID, '923006', 'CanUpdate' );
                    userCanDeleteSponsor = await commonFx.checkUserPermission( currentUserID, '923006', 'CanDelete' );
                };
            };
        };

    } else { // populate a blank data set
        sponsorsAllowedDDL = await SponsorsAllDDL.findAndCountAll( { where: { optionid: 0 } } );
    }; // End: Current User can read the Website Users DDL

    return { userCanReadSponsorsDDL, userCanCreateSponsors, sponsorsAllowedDDL,
             sponsorDetails, doesSponsorExist, userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor };
};


//////////////////////////////////////////////////////////////////////////////////////////
// Get the Current User's Scholarship permissions
// Notes:  Input parameters are validated prior to this function call.
//         Current User has permission to see Sponsor ID.
//////////////////////////////////////////////////////////////////////////////////////////
async function getScholarshipPermissionsForCurrentUser( currentUserID, sponsorIDRequested, scholarshipIDRequested ) {

    console.log(`sponsorIDRequested at Scholarships fx: ${sponsorIDRequested}`);
    console.log(`sponsorIDRequested.length at Scholarships fx: ${sponsorIDRequested.toString().length}`);

    // declare and set local variables
    let userCanReadScholarshipsDDL = false;
    let scholarshipsAllowedToUser = '';
    let scholarshipsAllowedToUserArray = [];
    let userCanCreateScholarships = false;
    let scholarshipsAllowedDDL = [];
    let scholarshipDetails = [];
    let doesScholarshipExist = false;
    let userCanReadScholarship = false;
    let userCanUpdateScholarship = false;
    let userCanDeleteScholarship = false;

    // Get the generic scholarship-related permissions for the current user
    userCanReadScholarshipsDDL = await commonFx.checkUserPermission( currentUserID, '923002', 'CanRead' );
    scholarshipsAllowedToUser = await commonFx.checkUserPermission( currentUserID, '923005', 'ObjectValues' );
    scholarshipsAllowedToUserArray = scholarshipsAllowedToUser.split('|').slice(1, -1);
    userCanCreateScholarships = await commonFx.checkUserPermission( currentUserID, '923002', 'CanCreate' );

    // Can the current user view the Scholarships DDL?
    if ( userCanReadScholarshipsDDL ) {

        // If a SponsorID was requested, find the list of Scholarships the current user is allowed to see (for loading into the DDL)
        // Note: If no SponsorID was requested, then the Scholarships DDL is not populated or enabled
        if ( sponsorIDRequested.toString().length > 0 ) {
            if ( scholarshipsAllowedToUser === '*' ) {
                scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
            } else {  // Current user can only see specific scholarships
                scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( {
                    where: {
                        optionid: scholarshipsAllowedToUserArray,
                        SponsorID: sponsorIDRequested
                    } } );
            };
        } else { // populate a blank data set
            scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( { where: { SponsorID: 0 } } );
        };

        // If a querystring request was made for a specific Scholarship's data, find and validate it
        if ( scholarshipIDRequested.toString().length > 0 ) {
            // Does the requested Scholarship exist? Retrieve the Scholarship's details from the database.
            scholarshipDetails = await ScholarshipsAllMgmtView.findAll({ where: { ScholarshipID: scholarshipIDRequested }});
            if ( typeof scholarshipDetails[0] === 'undefined' ) {  // Scholarship ID does not exist
                doesScholarshipExist = false;
            } else { // Scholarship ID does exist
                doesScholarshipExist = true;
                // Can current user view requested scholarship?
                if ( scholarshipsAllowedToUserArray.indexOf(scholarshipIDRequested.toString()) > -1 || (scholarshipsAllowedToUser === '*') ) {
                    userCanReadScholarship = await commonFx.checkUserPermission( currentUserID, '923005', 'CanRead' );
                    userCanUpdateScholarship = await commonFx.checkUserPermission( currentUserID, '923005', 'CanUpdate' );
                    userCanDeleteScholarship = await commonFx.checkUserPermission( currentUserID, '923005', 'CanDelete' );
                };
            };
        };

    } else { // populate a blank data set
        scholarshipsAllowedDDL = await ScholarshipsAllDDL.findAndCountAll( { where: { optionid: 0 } } );
    }; // End: User can read the Scholarships DDL (no "else" as the variable defaults above are set to this condition)

    return { userCanReadScholarshipsDDL, userCanCreateScholarships, scholarshipsAllowedDDL,
             scholarshipDetails, doesScholarshipExist,
             userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship };
};


// //////////////////////////////////////////////////////////////////////////////////////////
// // Get the Current User's Website User Profile permissions
// //   (permissions to let the Current User manage other website Users' profile)
// // Notes:  Input parameters are validated prior to this function call.
// //////////////////////////////////////////////////////////////////////////////////////////
// async function getWebsiteUserPermissionsForCurrentUser( currentUserID, userIDRequested ) {

//     // declare and set local variables
//     let userCanReadUsersDDL = false; // DDL permission
//     let usersAllowedToCurrentUser = '';
//     let usersAllowedToCurrentUserArray = [];
//     let userCanCreateUsers = false; // "Add User" link permission
//     let usersAllowedDDL = [];
//     let userDetails = []; // User Profile data
//     let doesUserExist = false;
//     let userCanReadUser = false;
//     let userCanUpdateUser = false;
//     let userCanDeleteUser = false;

//     // Get the list of user-related permissions for the current user
//     userCanReadUsersDDL = await commonFx.checkUserPermission( currentUserID, '923004', 'CanRead' );
//     usersAllowedToCurrentUser = await commonFx.checkUserPermission( currentUserID, '923007', 'ObjectValues' );
//     usersAllowedToCurrentUserArray = usersAllowedToCurrentUser.split('|').slice(1, -1);
//     userCanCreateUsers = await commonFx.checkUserPermission( currentUserID, '923004', 'CanCreate' );

//     // Can the current user view the Users DDL?
//     if ( userCanReadUsersDDL ) {

//         // Find the list of Website Users that the current user is allowed to see (for loading into the DDL)
//         if ( usersAllowedToCurrentUser === '*' ) {
//             usersAllowedDDL = await UsersAllDDL.findAndCountAll({});
//         } else {  // Current user can only see specific Website User(s)
//             usersAllowedDDL = await UsersAllDDL.findAndCountAll({ where: { optionid: usersAllowedToCurrentUserArray } });
//         };

//         // If a querystring request was made for a specific website user's data, find and validate it
//         if ( userIDRequested.toString().length > 0 ) {
//             // Does the requested User exist? Retrieve the website user's details from the database.
//             userDetails = await UsersAllView.findAll({ where: { UserID: userIDRequested }});
//             if ( typeof userDetails[0] === 'undefined' ) {  // User ID does not exist
//                 doesUserExist = false;
//             } else { // User ID does exist
//                 doesUserExist = true;
//                 // Can current user view requested website user?
//                 if ( usersAllowedToCurrentUserArray.indexOf(userIDRequested.toString()) > -1 
//                      || (usersAllowedToCurrentUser === '*') ) {
//                     userCanReadUser = await commonFx.checkUserPermission( currentUserID, '923007', 'CanRead' );
//                     userCanUpdateUser = await commonFx.checkUserPermission( currentUserID, '923007', 'CanUpdate' );
//                     userCanDeleteUser = await commonFx.checkUserPermission( currentUserID, '923007', 'CanDelete' );
//                 };
//             };
//         };

//     } else { // populate a blank data set
//         usersAllowedDDL = await UsersAllDDL.findAndCountAll( { where: { optionid: 0 } } );
//     }; // End: Current User can read the Website Users DDL

//     console.log(`userIDRequested: ${userIDRequested}`);
//     console.log(`userCanReadUsersDDL: ${userCanReadUsersDDL}`);
//     console.log(`currentUserID: ${currentUserID}`);
//     console.log(`userAllowedToCurrentUser: ${usersAllowedToCurrentUser}`);
//     console.log(`usersAllowedDDL.count: ${usersAllowedDDL.count}`);

//     return { userCanReadUsersDDL, userCanCreateUsers, usersAllowedDDL,
//              userDetails, doesUserExist, userCanReadUser, userCanUpdateUser, userCanDeleteUser };
// };


// //////////////////////////////////////////////////////////////////////////////////////////
// // Get the Current User's Website User's Permission permissions
// //   (permissions to let the Current User manage other Website Users' permissions)
// // Notes:  Input parameters are validated prior to this function call.
// //////////////////////////////////////////////////////////////////////////////////////////
// async function getWebsiteUserPermissionPermissionsForCurrentUser( currentUserID, userIDRequested, userPermissionIDRequested ) {

//     // declare and set local variables
//     // User Permissions (note individual website user permissions are not separated in authority; 
//     // if the current user can see any user permission, they can see all user permissions)
//     let userCanReadUserPermissionsDDL = false;
//     let userPermissionsAllowedToCurrentUser = '';
//     let userPermissionsAllowedToCurrentUserArray = [];
//     let userCanCreateUserPermissions = false;
//     let userPermissionsAllowedDDL = [];
//     let userPermissionDetails = []; // User Permissions data
//     let doesUserPermissionExist = false;
//     let userCanReadUserPermission = false;
//     let userCanUpdateUserPermission = false;
//     let userCanDeleteUserPermission = false;

//     // Get the generic permission-related permissions for the current user
//     userCanReadUserPermissionsDDL = await commonFx.checkUserPermission( currentUserID, '923009', 'CanRead' );
//     userPermissionsAllowedToCurrentUser = await commonFx.checkUserPermission( currentUserID, '923008', 'ObjectValues' );
//     userPermissionsAllowedToCurrentUserArray = userPermissionsAllowedToCurrentUser.split('|').slice(1, -1);
//     userCanCreateUserPermissions = await commonFx.checkUserPermission( currentUserID, '923009', 'CanCreate' );

//     // Can the Current User view the Website User Permissions DDL?
//     if ( userCanReadUserPermissionsDDL ) {

//         // If a UserID was requested, find the list of Permissions the Current User is allowed to see (for loading into the DDL)
//         // Note: If no UserID was requested, then the User Permissions DDL is not populated or enabled
//         if ( userIDRequested.toString().length > 0 ) {
//             if ( userPermissionsAllowedToCurrentUser === '*' ) {
//                 userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll( { where: { UserID: userIDRequested } } );
//             } else {  // Current user can only see specific User Permissions
//                 userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll( {
//                     where: {
//                         optionid: userPermissionsAllowedToCurrentUserArray,
//                         UserID: userIDRequested
//                     } } );
//             };
//         } else { // populate a blank data set
//             userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll( { where: { UserID: 0 } } );
//         };

//         // If a querystring request was made for a specific User Permission's data, find and validate it
//         if ( userPermissionIDRequested.toString().length > 0 ) {
//             // Does the requested User Permission exist? Retrieve the details from the database.
//             userPermissionDetails = await UserPermissionsAllView.findAll({ where: { WebsiteUserPermissionID: userPermissionIDRequested }});
//             if ( typeof userPermissionDetails[0] === 'undefined' ) {  // User Permission ID does not exist
//                 doesUserPermissionExist = false;
//             } else { // User Permission ID does exist
//                 doesUserPermissionExist = true;
//                 // Can Current User view requested user permission?
//                 if ( userPermissionsAllowedToCurrentUserArray.indexOf(userPermissionIDRequested.toString()) > -1 || (userPermissionsAllowedToCurrentUser === '*') ) {
//                     userCanReadUserPermission = await commonFx.checkUserPermission( currentUserID, '923008', 'CanRead' );
//                     userCanUpdateUserPermission = await commonFx.checkUserPermission( currentUserID, '923008', 'CanUpdate' );
//                     userCanDeleteUserPermission = await commonFx.checkUserPermission( currentUserID, '923008', 'CanDelete' );
//                 };
//             };
//         };

//     } else { // populate a blank data set
//         userPermissionsAllowedDDL = await UserPermissionsAllDDL.findAndCountAll( { where: { optionid: 0 } } );
//     }; // End: Current User can read the User Permissions DDL (no "else" as the variable defaults above are set to this condition)

//     return { userCanReadUserPermissionsDDL, userCanCreateUserPermissions, userPermissionsAllowedDDL,
//              userPermissionDetails, doesUserPermissionExist,
//              userCanReadUserPermission, userCanUpdateUserPermission, userCanDeleteUserPermission };
// };


// //////////////////////////////////////////////////////////////////////////////////////////
// // Check Current User Permission
// //////////////////////////////////////////////////////////////////////////////////////////
// async function checkUserPermission(userID, permissionCategoryID, permissionType) {

//     // default to "false"
//     var permissionStatus = 0;

//     // Get the list of active permissions for the user
//     const matchingPermissions = await UserPermissionsActive.findAndCountAll( {
//         where: { UserID: userID,
//                  PermissionCategoryID: permissionCategoryID },
//     });
// //    console.log(`matchingPermissions.count: ${matchingPermissions.count}`);

//     // Does the user have the requested permission?
//     switch ( permissionType ) {
//         case 'CanCreate':    permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanCreate : 0; break;
//         case 'CanRead':      permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanRead   : 0; break;
//         case 'CanUpdate':    permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanUpdate : 0; break;
//         case 'CanDelete':    permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].CanDelete : 0; break;
//         case 'ObjectValues': permissionStatus = ( matchingPermissions.count > 0 ) ? matchingPermissions.rows[0].ObjectValues : 'test'; break;
//     };

//     return permissionStatus;

// }; // end "checkUserPermission"


// //////////////////////////////////////////////////////////////////////////////////////////
// // If the Current User is not configured for access (i.e., a New User),
// // create an entry in the User Profiles table, and create their default User Permissions
// //////////////////////////////////////////////////////////////////////////////////////////
// async function checkForNewUser( usernameToCheck ) {

//     // Local variables
//     let errorCode = 0;
//     let newUserID = 0;
//     let today = new Date();
//     let permissionExpirationDate = new Date();
//     permissionExpirationDate.setFullYear(today.getFullYear() + 5);

//     // Log the event
//     let logEventResult = await commonFx.logEvent('User Profiles', 'Get Current User', 0, 'Failure',
//         'User not yet configured.', 0, 0, 0, '');

//     // Add the new data to the database in a new record, and return the newly-generated [UserID] value
//     const newUser = new UsersTable( { Username: usernameToCheck });
// console.log(`Before newuser.save`);
//     await newUser.save()
//         .then( async function() {
//             newUserID = newUser.UserID;
// console.log(`newUser.UserID: ${newUserID}`);

//             // Add New User Permission (Switchboard)
//             const newUserPermissionSwitchboard = new UserPermissionsTable( {
//                 UserID: newUserID,
//                 PermissionCategoryID: '923001',
//                 ObjectValues: '*',
//                 EffectiveDate: today,
//                 ExpirationDate: permissionExpirationDate,
//                 CanCreate: false,
//                 CanRead: true,
//                 CanUpdate: false,
//                 CanDelete: false
//             });
//             await newUserPermissionSwitchboard.save()
//                 .then()
//                 .catch( async function(errorSwitchboard) {
// console.log(`newUser Switchboard Permission error: ${errorSwitchboard}`);
//                     errorCode = 902;
//                     // Log the error
//                     let logEventResult = commonFx.logEvent('Error', 'New Permission', errorCode, 'Failure',
//                         'Could not create new User Permission for Switchboard (' + errorSwitchboard + ').',
//                         0, 0, newUserID, '');
//                 }); // END: Create new User Permission (Switchboard)

//             // Add New User Permission (User Data Mgmt - allows user to manage their "profile" information)
//             const newUserPermissionUserMgmt = new UserPermissionsTable( {
//                 UserID: newUserID,
//                 PermissionCategoryID: '923007',
//                 ObjectValues: newUserID,
//                 EffectiveDate: today,
//                 ExpirationDate: permissionExpirationDate,
//                 CanCreate: false,
//                 CanRead: true,
//                 CanUpdate: true,
//                 CanDelete: false
//             });
//             await newUserPermissionUserMgmt.save()
//                 .then()
//                 .catch( async function(errorUserMgmt) {
//  console.log(`newUser User Data Mgmt Permission error: ${errorUserMgmt}`);
//                     errorCode = 902;
//                     // Log the error
//                     let logEventResult = commonFx.logEvent('Error', 'New Permission', errorCode, 'Failure',
//                         'Could not create new User Permission for User Data Mgmt (' + errorUserMgmt + ').',
//                         0, 0, newUserID, '');
//                 }); // END: Create new User Permission (User Data Mgmt)

//         }).catch( function(errorUserProfile) { // Could not create new User Profile
// console.log(`newUser error: ${errorUserProfile}`);
//             errorCode = 901;
//             // Log the error
//             let logEventResult = commonFx.logEvent('Error', 'New User', errorCode, 'Failure',
//                 'Could not create new User Profile (' + errorUserProfile + ').',
//                 0, 0, newUserID, '');
//         }); // END: Create new User Profile

// console.log(`After newuser.save`);

//     // ToDo: Send email notification
//     let emailResultError = sendEmail(
//         'fiosjlqf@gmail.com',
//         `New User Account Created`,
//         `A New User Account was successfully created for ${usernameToCheck}.`,
//         '');

//     // New User successfully configured
    
//     return { errorCode, newUserID };
       
// }; // END: checkForNewUser()


module.exports = {
    getSponsorPermissionsForCurrentUser,
    getScholarshipPermissionsForCurrentUser,
//    getWebsiteUserPermissionsForCurrentUser,
//    getWebsiteUserPermissionPermissionsForCurrentUser
//    checkUserPermission
//    checkForNewUser
};