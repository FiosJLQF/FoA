///////////////////////////////////////////////////////////////////////////////////
// Required External Modules
///////////////////////////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const { auth, requiresAuth } = require('express-openid-connect');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const { sequelize, Op } = require('sequelize');  // Sequelize "Operators" functions for querying
const methodOverride = require('method-override');  // allows PUT and other non-standard methods
router.use(methodOverride('_method')); // allows use of the PUT/DELETE method extensions
const foaFx = require('../scripts/foa_fx_datamgmt_server');
const commonFx = require('../scripts/common_fx_server');
const { check, validationResult } = require('express-validator');
//const htmlEntities = require('html-entities');


///////////////////////////////////////////////////////////////////////////////////
// Data Models
///////////////////////////////////////////////////////////////////////////////////
const { ScholarshipsTable, ScholarshipsAllMgmtView,
    ScholarshipRecurrenceCategoriesDDL, ScholarshipStatusCategoriesDDL,
    SponsorsTable, SponsorsAllView,
    SponsorTypeCategoriesDDL, SponsorStatusCategoriesDDL,
    GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
    EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
    FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL
    } = require('../models/sequelize_foa.js');
const { UsersTable, UsersAllView, UserPermissionsAllView, UserPermissionsTable, UserPermissionCategoriesAllDDL
    } = require('../models/sequelize_common.js');

///////////////////////////////////////////////////////////////////////////////////
// Auth0 Configuration
///////////////////////////////////////////////////////////////////////////////////

// Configuration for the express-openid-connect route
router.use(
    auth({
      issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
      baseURL: process.env.BASE_URL,
      clientID: process.env.AUTH0_CLIENT_ID,
      secret: process.env.SESSION_SECRET,
      authRequired: false,  // set to false by default as some pages are public
      auth0Logout: true,
    })
);


///////////////////////////////////////////////////////////////////////////////////
// Routes Definitions
///////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
// "GET" Routes (Read data)
////////////////////////////////////////////////////////////

////////////////////////////////////////
// If the user has not yet been granted any permissions
////////////////////////////////////////
router.get('/newuser', requiresAuth(), async (req, res) => {

    let currentUserProfile = '';

    try {

        // Retrieve the user's ID
        currentUserProfile = await UsersAllView.findAndCountAll( { where: { Username: req.oidc.user.email }});

        // Log the request (10001 = "New User Page Redirect")
        console.log('New User!');
        console.log(`UserID: ${currentUserProfile.rows[0].UserID}`);
        return res.render('switchboard_newuser', {
            user: req.oidc.user,
            userID: currentUserProfile.rows[0].UserID,
            userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
        } )
    } catch(err) {
        console.log('Error:' + err);
    }
});

////////////////////////////////////////
// The main switchboard
////////////////////////////////////////
router.get('/', requiresAuth(), async (req, res) => {
    try {

        ////////////////////////////////////////////////////
        // Set local variables
        ////////////////////////////////////////////////////
        let errorCode = 0;
        const actionRequestedValues = [
            'addsponsor', 'editsponsor', 'addscholarship', 'editscholarship',
            'adduser', 'edituser', 'adduserpermission', 'edituserpermission'
        ];
        let statusMessage = '';
        let logEventResult = '';
        // Current User variables
        let currentUserProfile = [];
        let currentUserID = 0;
        let userIsDataAdmin = 0;
        // Querystring parameters
        let actionRequested = '';
        let sponsorIDRequested = '';
        let scholarshipIDRequested = '';
        let userIDRequested = '';
        let userPermissionIDRequested = '';
        // SELECT object options
        let sponsorStatusCategories = [];
        let sponsorTypeCategoriesDDL = [];
        let scholarshipStatusCategories = [];
        let scholarshipRecurrenceCategories = [];
        let criteriaFieldOfStudyCategories = [];
        let criteriaCitizenshipCategories = [];
        let criteriaYearOfNeedCategories = [];
        let criteriaGenderCategories = [];
        let criteriaEnrollmentStatusCategories = [];
        let criteriaMilitaryServiceCategories = [];
        let criteriaFAAPilotCertificateCategories = [];
        let criteriaFAAPilotRatingCategories = [];
        let criteriaFAAMechanicCertificateCategories = [];
        let userPermissionsCategoriesAllDLL = [];

        ////////////////////////////////////////////////////
        // Get the current user's profile and permissions
        ////////////////////////////////////////////////////
        currentUserProfile = await UsersAllView.findAndCountAll( { where: { Username: req.oidc.user.email }});

        // Does the user profile exist?  If not, add the basic account information.
        if ( currentUserProfile.count == 0 ) {  // The new user has not yet been set up
            const { errorCode, newUserID } = await commonFx.checkForNewUser( req.oidc.user.email );
            console.log(`newUserID from CheckForNewUser: ${newUserID}`);
            if ( errorCode !== 0 ) { // If an error was raised during the New User configuration, redirect the user
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            } else { // New User was successfully created, so redirect to the New User Data Mgmt screen
                res.redirect(`/switchboard?userid=${newUserID}` +
                    `&status=usercreatesuccess` +
                    `&actionrequested=edituser`);
            };
        }; // END: Does the User Profile exist?

        // Current User exists and is configured; continue processing
        currentUserID = currentUserProfile.rows[0].UserID;
        // Log the access by the Current User
        logEventResult = await commonFx.logEvent('Page Access', 'Switchboard', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
        // Check to see if the current User is a "Data Admin" (FoA or AMCG web manager)
        userIsDataAdmin = await commonFx.checkUserPermission(currentUserID, '923010', 'CanRead');

        ////////////////////////////////////////////////////
        // Validate any query string parameters
        //   - client-side validation already occurred before form submittal
        //   - this step only validates value formats for changes post-submittal
        //   - authorization verification and domain checking will occur in a subsequent step
        ////////////////////////////////////////////////////

        // Validate the "action requested", if present
        if ( req.query['actionrequested'] != undefined ) {
            if ( actionRequestedValues.indexOf(req.query['actionrequested']) > -1 ) {
                actionRequested = req.query['actionrequested'];
            } else {
                errorCode = 948; // Invalid, missing or non-existant "action requested"
                // Log the event
                logEventResult = await commonFx.logEvent('Action Requested Validation', '', 0, 'Failure',
                    `Action Requested is not valid (${req.query['actionrequested']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            };
        };

        // If a requested "sponsorid" is blank, zero or not a number, redirect to the generic Switchboard page
        if ( req.query['sponsorid'] != undefined ) {  // if the querystring variable exists, check its format
            sponsorIDRequested = Number(req.query['sponsorid']);
            if ( sponsorIDRequested == 0 || sponsorIDRequested === '' || Number.isNaN(sponsorIDRequested)) {
                errorCode = 908; // Invalid, missing or non-existent SponsorID
                // Log the event
                logEventResult = await commonFx.logEvent('SponsorID Validation', '', 0, 'Failure',
                    `SponsorID is not a valid format (${req.query['sponsorid']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            } else { // value is in a valid format; check to see if it exists in the database
                let doesSponsorIDExist = await SponsorsAllView.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
                if ( doesSponsorIDExist.count == 0 ) {
                    errorCode = 908; // Invalid, missing or non-existent SponsorID
                    // Log the event
                    logEventResult = await commonFx.logEvent('SponsorID Validation', '', 0, 'Failure',
                        `SponsorID does not exist (${req.query['sponsorid']})`,
                        0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                    // redirect the user to the error screen
                    return res.render( 'error', {
                        errorCode: errorCode,
                        userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                    });
                };
            };
        };

        // If a requested "scholarshipid" is blank, zero or not a number, redirect to the generic Switchboard page
        if ( req.query['scholarshipid'] != undefined ) {  // If the querystring variable exists, check its format
            scholarshipIDRequested = Number(req.query['scholarshipid']);
            if ( scholarshipIDRequested == 0 || scholarshipIDRequested === '' || Number.isNaN(scholarshipIDRequested)) {
                errorCode = 909; // Invalid, missing or non-existent ScholarshipID
                // Log the event
                logEventResult = await commonFx.logEvent('ScholarshipID Validation', '', 0, 'Failure',
                    `ScholarshipID is not a valid format (${req.query['scholarshipid']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // Redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            } else {  // Value is in a valid format; check to see if it exists in the database
                let doesScholarshipIDExist = await ScholarshipsAllMgmtView.findAndCountAll( { where: { ScholarshipID: scholarshipIDRequested } } );
                if ( doesScholarshipIDExist.count == 0 ) {
                    errorCode = 909; // Non-existant ScholarshipID
                    // Log the event
                    logEventResult = await commonFx.logEvent('ScholarshipID Validation', '', 0, 'Failure',
                        `ScholarshipID does not exist (${req.query['scholarshipid']})`,
                        0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                    // Redirect the user to the error screen
                    return res.render( 'error', {
                        errorCode: errorCode,
                        userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                    });
                };
            };
        };
        
        // Validate the "Requested Website User ID" parameter, if present
        if ( req.query['userid'] != undefined ) {
            userIDRequested = Number(req.query['userid']);
            if ( userIDRequested == 0 || userIDRequested === '' || Number.isNaN(userIDRequested)) {
                errorCode = 910; // Invalid, missing or non-existent UserID
                // Log the event
                logEventResult = await commonFx.logEvent('UserID Validation', '', 0, 'Failure',
                    `UserID is not a valid format (${req.query['userid']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // Redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            } else {  // Value is in a valid format; check to see if it exists in the database
                let doesUserIDExist = await UsersAllView.findAndCountAll( { where: { UserID: userIDRequested } } );
                if ( doesUserIDExist.count == 0 ) {
                    errorCode = 910; // Non-existant UserID
                    // Log the event
                    logEventResult = await commonFx.logEvent('UserID Validation', '', 0, 'Failure',
                        `UserID does not exist (${req.query['userid']})`,
                        0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                    // Redirect the user to the error screen
                    return res.render( 'error', {
                        errorCode: errorCode,
                        userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                    });
                };
            };
        };

        // If a requested "userpermissionid" is blank, zero or not a number, redirect to the generic Switchboard page
        if ( req.query['userpermissionid'] != undefined ) {  // If the querystring variable exists, check its format
            userPermissionIDRequested = Number(req.query['userpermissionid']);
            if ( userPermissionIDRequested == 0 || userPermissionIDRequested === '' || Number.isNaN(userPermissionIDRequested)) {
                errorCode = 911; // Invalid, missing or non-existent UserPermissionID
                // Log the event
                logEventResult = await commonFx.logEvent('UserPermissionID Validation', '', 0, 'Failure',
                    `UserPermissionID is not a valid format (${req.query['userpermissionid']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // Redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            } else {  // Value is in a valid format; check to see if it exists in the database
                let doesUserPermissionIDExist = await UserPermissionsAllView.findAndCountAll( { where: { WebsiteUserPermissionID: userPermissionIDRequested } } );
                if ( doesUserPermissionIDExist.count == 0 ) {
                    errorCode = 911; // Non-existant UserPermissionID
                    // Log the event
                    logEventResult = await commonFx.logEvent('UserPermissionID Validation', '', 0, 'Failure',
                        `UserPermissionID does not exist (${req.query['userpermissionid']})`,
                        0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                    // Redirect the user to the error screen
                    return res.render( 'error', {
                        errorCode: errorCode,
                        userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                    });
                };
            };
        };
                        
        ////////////////////////////////////////////////////
        // Process any querystring "status message"
        ////////////////////////////////////////////////////
        if ( req.query['status'] === 'sponsorupdatesuccess' ) {
            statusMessage = 'Sponsor was updated.';
        } else if ( req.query['status'] === 'sponsordeletesuccess' ) {
            statusMessage = 'Sponsor was deleted.';
        } else if ( req.query['status'] === 'sponsorcreatesuccess' ) {
            statusMessage = 'Sponsor was added.';
        } else if ( req.query['status'] === 'scholarshipupdatesuccess' ) {
            statusMessage = 'Scholarship was updated.';
        } else if ( req.query['status'] === 'scholarshipdeletesuccess' ) {
            statusMessage = 'Scholarship was deleted.';
        } else if ( req.query['status'] === 'scholarshipcreatesuccess' ) {
            statusMessage = 'Scholarship was added.';
        } else if ( req.query['status'] === 'userupdatesuccess' ) {
            statusMessage = 'User was updated.';
        } else if ( req.query['status'] === 'userdeletesuccess' ) {
            statusMessage = 'User was deleted.';
        } else if ( req.query['status'] === 'usercreatesuccess' ) {
            statusMessage = 'User was added.';
        } else if ( req.query['status'] === 'userpermissionupdatesuccess' ) {
            statusMessage = 'User Permission was updated.';
        } else if ( req.query['status'] === 'userpermissiondeletesuccess' ) {
            statusMessage = 'User Permission was deleted.';
        } else if ( req.query['status'] === 'userpermissioncreatesuccess' ) {
            statusMessage = 'User Permission was added.';
        } else{
            statusMessage = '';
        };


        ////////////////////////////////////////////////////
        //  Sponsor Data Permissions / Details (DDL, Add Sponsor, Default Sponsor, etc.)
        ////////////////////////////////////////////////////
        console.log(`Checking Sponsor Permissions for Current User (${currentUserID})`);
        const { userCanReadSponsorsDDL, userCanCreateSponsors, sponsorsAllowedDDL, sponsorDetails, doesSponsorExist,
                userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor
        } = await foaFx.getSponsorPermissionsForCurrentUser( currentUserID, sponsorIDRequested );

        // If the current User can see the Sponsors DDL, validate the requested Sponsor (if one was requested)
        if ( userCanReadSponsorsDDL && sponsorIDRequested.length > 0 ) {

            // Does the requested Sponsor exist (if requested)?
            console.log(`doesSponsorExist: (${doesSponsorExist})`);
            if ( !doesSponsorExist ) {  // Sponsor ID does not exist
                errorCode = 908;
                // Log the event
                logEventResult = await commonFx.logEvent('SponsorID Validation', '', errorCode, 'Failure',
                    `SponsorID does not exist (${sponsorIDRequested})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            };

            // Does the User have permission to see/edit/delete this Sponsor?
            if ( !userCanReadSponsor ) { // User does not have permission to read Sponsor's data - trap and log error
                errorCode = 909;
                // Log the event
                logEventResult = await commonFx.logEvent('SponsorID Authorization', '', errorCode, 'Failure',
                    `User does not have permission to view SponsorID (${sponsorIDRequested})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            };
        }; // END: Can the current User see the Sponsors' DDL?


        ////////////////////////////////////////////////////
        //  Scholarship Data Permissions / Details (DDL, Add Scholarship, Default Scholarship, etc.)
        ////////////////////////////////////////////////////
        console.log(`Checking Scholarship Permissions for Current User (${currentUserID})`);
        const { userCanReadScholarshipsDDL, userCanCreateScholarships, scholarshipsAllowedDDL, scholarshipDetails,
                doesScholarshipExist, userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship
        } = await foaFx.getScholarshipPermissionsForCurrentUser( currentUserID, sponsorIDRequested, scholarshipIDRequested );

        // If the current User can see the Scholarships DDL, validate the requested Scholarship (if one was requested)
        if ( userCanReadScholarshipsDDL && scholarshipIDRequested.length > 0 ) {

            // Does the requested Scholarship exist (if requested)?
            console.log(`doesScholarshipExist: (${doesScholarshipExist})`);
            if ( !doesScholarshipExist ) {  // Scholarship ID does not exist
                errorCode = 918;  // Unknown Scholarship
                // Log the event
                logEventResult = await commonFx.logEvent('ScholarshipID Validation', '', errorCode, 'Failure',
                    `ScholarshipID does not exist (${scholarshipIDRequested})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            };

            // Does the User have permission to see/edit/delete this Scholarship?
            if ( !userCanReadScholarship ) { // User does not have permission to read Scholarship's data - trap and log error
                errorCode = 919;  // Invalid Access to Scholarship
                // Log the event
                logEventResult = await commonFx.logEvent('ScholarshipID Authorization', '', errorCode, 'Failure',
                    `User does not have permission to view ScholarshipID (${scholarshipIDRequested})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            };
        }; // END: Can the current User see the Scholarships' DDL?


        ////////////////////////////////////////////////////
        //  Website User Data Permissions / Details (DDL, Add User, Default User, etc.)
        ////////////////////////////////////////////////////
        console.log(`Checking Website User Permissions for Current User (${currentUserID})`);
        const { userCanReadUsersDDL, userCanCreateUsers, usersAllowedDDL,
                userDetails, doesUserExist,
                userCanReadUser, userCanUpdateUser, userCanDeleteUser
        } = await commonFx.getWebsiteUserPermissionsForCurrentUser( currentUserID, userIDRequested );

        // If the current User can see the Website User DDL, validate the requested Website User (if one was requested)
        if ( userCanReadUsersDDL && userIDRequested.length > 0 ) {

            // Does the requested User exist (if requested)?
            console.log(`doesUserExist: (${doesUserExist})`);
            if ( !doesUserExist ) {  // User ID does not exist
                errorCode = 928;  // Unknown User
                // Log the event
                logEventResult = await commonFx.logEvent('UserID Validation', `Website User: ${ userIDRequested }`, errorCode,
                    'Failure', `UserID does not exist`, 0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            };

            // Does the Current User have permission to see/edit/delete this Website User?
            if ( !userCanReadUser ) { // Current User does not have permission to read Website User's data - trap and log error
                errorCode = 929;  // Invalid Access to Website User
                // Log the event
                logEventResult = await commonFx.logEvent('Website User Access', `Website User: ${ userIDRequested }`, errorCode,
                   'Failure', 'User not authorized to view website user data', 0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            } else {
                // Log the access
                logEventResult = await commonFx.logEvent('Content Access', `Website User: ${ userIDRequested }`, 930,
                    'Success', '', 0, 0, currentUserID, '');
            };
        }; // END: Can the Current User see the Website Users' DDL?

        
        ////////////////////////////////////////////////////
        //  Website User Permission Permissions / Details (DDL, Add Permission, Default Permission, etc.)
        ////////////////////////////////////////////////////
        console.log(`Checking Website User Permission Permissions for Current User (${currentUserID})`);
        const { userCanReadUserPermissionsDDL, userCanCreateUserPermissions, userPermissionsAllowedDDL,
                userPermissionDetails, doesUserPermissionExist,
                userCanReadUserPermission, userCanUpdateUserPermission, userCanDeleteUserPermission
        } = await commonFx.getWebsiteUserPermissionPermissionsForCurrentUser( currentUserID, userPermissionIDRequested );

        // If the Current User can see the User Permissions DDL, validate the requested User Permission (if one was requested)
        if ( userCanReadUserPermissionsDDL && userPermissionIDRequested.length > 0 ) {

            // Does the requested User Permission exist (if requested)?
            console.log(`doesUserPermissionExist: (${doesUserPermissionExist})`);
            if ( !doesUserPermissionExist ) {  // User Permission ID does not exist
                errorCode = 938;  // Unknown User Permission
                // Log the event
                logEventResult = await commonFx.logEvent('User Permission Access', `Website User Permission: ${ userPermissionIDRequested }`,
                     errorCode, 'Failure', 'UserPermissionID does not exist', 0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            };

            // Does the Current User have permission to see/edit/delete this User Permission?
            if ( !userCanReadUserPermission ) { // Current User does not have permission to read User Permission's data - trap and log error
                errorCode = 939;  // Invalid Access to User Permission
                // Log the event
                logEventResult = await commonFx.logEvent('Website User Permission Access', `Website User Permission: ${ userPermissionIDRequested }`, errorCode,
                   'Failure', 'User not authorized to view website user permission data', 0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.email )
                });
            } else {
                // Log the access
                logEventResult = await commonFx.logEvent('Content Access', `Website User Permission: ${ userPermissionIDRequested }`, 931,
                    'Success', '', 0, 0, currentUserID, '');
            };
        }; // END: Can the Current User see the User Permissions' DDL?


        ////////////////////////////////////////////////////
        // Retrieve options lists for data mgmt form DDLs
        ////////////////////////////////////////////////////
        switch (actionRequested) {
            case 'addsponsor': // "OR" the next condition
            case 'editsponsor':
                sponsorStatusCategories = await SponsorStatusCategoriesDDL.findAndCountAll({});
                sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
                break;
            case 'addscholarship': // "OR" the next condition
            case 'editscholarship':
                scholarshipStatusCategories = await ScholarshipStatusCategoriesDDL.findAndCountAll({});
                sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
                scholarshipRecurrenceCategories = await ScholarshipRecurrenceCategoriesDDL.findAndCountAll({});
                criteriaFieldOfStudyCategories = await FieldOfStudyCategoriesDDL.findAndCountAll({});
                criteriaCitizenshipCategories = await CitizenshipCategoriesDDL.findAndCountAll({});
                criteriaYearOfNeedCategories = await YearOfNeedCategoriesDDL.findAndCountAll({});
                criteriaGenderCategories = await GenderCategoriesDDL.findAndCountAll({});
                criteriaEnrollmentStatusCategories = await EnrollmentStatusCategoriesDDL.findAndCountAll({});
                criteriaMilitaryServiceCategories = await MilitaryServiceCategoriesDDL.findAndCountAll({});
                criteriaFAAPilotCertificateCategories = await FAAPilotCertificateCategoriesDDL.findAndCountAll({});
                criteriaFAAPilotRatingCategories = await FAAPilotRatingCategoriesDDL.findAndCountAll({});
                criteriaFAAMechanicCertificateCategories = await FAAMechanicCertificateCategoriesDDL.findAndCountAll({});
                break;
            case 'adduserpermission': // "OR" the next condition
            case 'edituserpermission':
                userPermissionsCategoriesAllDLL = await UserPermissionCategoriesAllDDL.findAndCountAll({});
                break;
        };


        ////////////////////////////////////////////////////
        // Render the page
        ////////////////////////////////////////////////////
        console.log('Render Switchboard');
        return res.render('switchboard', {
            // Admin data
            errorCode,
            actionRequested,
            statusMessage,
            // User data
            user: req.oidc.user,
            userName: ( req.oidc.user == null ? '' : req.oidc.user.email ),
            currentUserID,
            userIDRequested,
            userIsDataAdmin,
            // Main Menu Data
            // Sponsor Information
            userCanReadSponsorsDDL,
            sponsorsAllowedDDL,
            userCanCreateSponsors,
            sponsorTypeCategoriesDDL,
            sponsorStatusCategories,
            // Scholarship Information
            userCanReadScholarshipsDDL,
            scholarshipsAllowedDDL,
            userCanCreateScholarships,
            scholarshipStatusCategories,
            criteriaFieldOfStudyCategories,
            criteriaCitizenshipCategories,
            criteriaYearOfNeedCategories,
            criteriaGenderCategories,
            criteriaEnrollmentStatusCategories,
            criteriaMilitaryServiceCategories,
            criteriaFAAPilotCertificateCategories,
            criteriaFAAPilotRatingCategories,
            criteriaFAAMechanicCertificateCategories,
            // User Information
            userCanReadUsersDDL,
            usersAllowedDDL,
            userCanCreateUsers,
            // User Permission Information
//            userPermissionID,
            userPermissionIDRequested,
            userCanReadUserPermissionsDDL,
            userPermissionsAllowedDDL,
            userCanCreateUserPermissions,
            // Sponsor CRUD Information
            sponsorID: sponsorIDRequested.toString(),
            sponsorDetails,
            userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor,
            // Scholarship CRUD Information
            scholarshipID: scholarshipIDRequested.toString(),
            scholarshipDetails,
            userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship,
            scholarshipRecurrenceCategories,
            // Website User CRUD Information
            userID: userIDRequested.toString(),
            userIDRequested,
            userDetails,
            userCanReadUser,
            userCanUpdateUser,
            userCanDeleteUser,
            // Website User Permission CRUD Information
            userPermissionDetails,
            userPermissionsCategoriesAllDLL,
            userCanReadUserPermission, userCanUpdateUserPermission, userCanDeleteUserPermission
        })
    } catch(err) {
// ToDo:  Log the error
        console.log('Error:' + err);
    }
});


////////////////////////////////////////////////////////////
// "POST" Routes (Add new data records)
////////////////////////////////////////////////////////////

///////////////////////////////
// Sponsor (Insert)
///////////////////////////////
router.post('/sponsoradd', requiresAuth(),
    [
        check('sponsorName')
            .isLength( { min: 3, max: 100 } ).withMessage('Sponsor Name should be 3 to 100 characters.')
    ],

    async (req, res) => {

    // Reformat the SELECT options into a pipe-delimited array for storage
    const sponsorStatusFormatted = commonFx.convertOptionsToDelimitedString(req.body.sponsorStatus, "|", "0", "false");
    const sponsorTypesFormatted = commonFx.convertOptionsToDelimitedString(req.body.sponsorTypes, "|", "0", "false");

    // Reformat checkboxes to boolean values to be updated into Postgres
    let SponsorIsFeatured = (req.body.sponsorIsFeatured === "SponsorIsFeatured") ? true : false;

    // Validate the input
    const validationErrors = validationResult(req);

    // If invalid data, return errors to client
    if ( !validationErrors.isEmpty() ) {

// ToDo:  Replicate the GET render code above, including parameters prep work


        return res.status(400).json(validationErrors.array());







    } else {
        // Add the new data to the database in a new record, and return the newly-generated [SponsorID] value
        const newSponsor = new SponsorsTable( {
            SponsorName: req.body.sponsorName,
            SponsorDescription: req.body.sponsorDescription,
            SponsorWebsite: req.body.sponsorWebsite,
            SponsorLogo: req.body.sponsorLogo,
            SponsorContactFName: req.body.sponsorContactFName,
            SponsorContactLName: req.body.sponsorContactLName,
            SponsorContactEmail: req.body.sponsorContactEmail,
            SponsorContactTelephone: req.body.sponsorContactTelephone,
            SponsorType: sponsorTypesFormatted,
            SponsorStatusID: sponsorStatusFormatted,
            SponsorIsFeatured: SponsorIsFeatured
        });
        await newSponsor.save();

// ToDo:  If insert successful, add permission for Current User to new Sponsor

        res.redirect(`/switchboard?sponsorid=${newSponsor.SponsorID}` +
                     `&status=sponsorcreatesuccess` +
                     `&actionrequested=editsponsor`);
    };
});

///////////////////////////////
// Scholarship (Insert)
///////////////////////////////
router.post('/scholarshipadd', requiresAuth(),
    [
        check('scholarshipName')
            .isLength( { min: 3, max: 100 } ).withMessage('Scholarship Name should be 3 to 100 characters.')
    ],

    async (req, res) => {

    // Reformat the multiple-option SELECT values into a pipe-delimited array for storage
    const scholarshipStatusFormatted = commonFx.convertOptionsToDelimitedString(req.body.scholarshipStatus, "|", "0", "false");
    const scholarshipRecurrenceFormatted = commonFx.convertOptionsToDelimitedString(req.body.scholarshipRecurrence, "|", "0", "false");
    const criteriaFieldOfStudyFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFieldOfStudy, "|", "0", "false");
    const criteriaCitizenshipFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaCitizenship, "|", "0", "false");
    const criteriaYearOfNeedFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaYearOfNeed, "|", "0", "false");
    const criteriaFemaleApplicantsOnlyFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFemaleApplicantsOnly, "|", "0", "false");
    const criteriaEnrollmentStatusFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaEnrollmentStatus, "|", "0", "false");
    const criteriaMilitaryServiceFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaMilitaryService, "|", "0", "false");
    const criteriaFAAPilotCertificateFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotCertificate, "|", "0", "false");
    const criteriaFAAPilotRatingFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotRating, "|", "0", "false");
    const criteriaFAAMechanicCertificateFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFAAMechanicCertificate, "|", "0", "false");

    // Reformat blank dates and numbers to NULL values to be updated into Postgres
    let ApplListDate = (req.body.scholarshipApplListDate === "") ? null : req.body.scholarshipApplListDate;
    let ApplStartDate = (req.body.scholarshipApplStartDate === "") ? null : req.body.scholarshipApplStartDate;
    let ApplEndDate = (req.body.scholarshipApplEndDate === "") ? null : req.body.scholarshipApplEndDate;
    let MinimumAge = (req.body.criteriaMinimumAge === "") ? null : req.body.criteriaMinimumAge;
    let MaximumAge = (req.body.criteriaMaximumAge === "") ? null : req.body.criteriaMaximumAge;
    let MinimumGPA = (req.body.criteriaMinimumGPA === "") ? null : req.body.criteriaMinimumGPA;

    // Reformat checkboxes to boolean values to be updated into Postgres
    let ScholarshipIsFeatured = (req.body.scholarshipIsFeatured === "ScholarshipIsFeatured") ? true : false;

    // Validate the input
    const validationErrors = validationResult(req);

    // If invalid data, return errors to client
    if ( !validationErrors.isEmpty() ) {

// ToDo:  Replicate the GET render code above, including parameters prep work


        return res.status(400).json(validationErrors.array());







    } else {
        // Add the new data to the database in a new record, and return the newly-generated [ScholarshipID] value
        console.log(`sponsorID to save scholarship: ${req.body.sponsorID}`);
        const newScholarship = new ScholarshipsTable( {
            SponsorID: req.body.sponsorID,
            ScholarshipStatus: scholarshipStatusFormatted,
            ScholarshipName: req.body.scholarshipName,
            ScholarshipDescription: req.body.scholarshipDescription,
            ScholarshipLink: req.body.scholarshipLink,
            ScholarshipAward: req.body.scholarshipAward,
            ScholarshipContactFName: req.body.scholarshipContactFName,
            ScholarshipContactLName: req.body.scholarshipContactLName,
            ScholarshipContactEmail: req.body.scholarshipContactEmail,
            ScholarshipContactTelephone: req.body.scholarshipContactTelephone,
            Notes_Admin: req.body.notesAdmin,
            ScholarshipEligibilityReqs: req.body.scholarshipEligReqsPrimary,
            ScholarshipEligibilityReqsOther: req.body.scholarshipEligReqsOther,
            ScholarshipRecurrence: scholarshipRecurrenceFormatted,
            ScholarshipApplListDate: ApplListDate,
            ScholarshipApplStartDate: ApplStartDate,
            ScholarshipApplEndDate: ApplEndDate,
            Criteria_FieldOfStudy: criteriaFieldOfStudyFormatted,
            Criteria_AgeMinimum: MinimumAge,
            Criteria_AgeMaximum: MaximumAge,
            Criteria_Citizenship: criteriaCitizenshipFormatted,
            Criteria_YearOfNeed: criteriaYearOfNeedFormatted,
            Criteria_FemaleApplicantsOnly: criteriaFemaleApplicantsOnlyFormatted,
            Criteria_EnrollmentStatus: criteriaEnrollmentStatusFormatted,
            Criteria_GPAMinimum: MinimumGPA,
            Criteria_USMilitaryService: criteriaMilitaryServiceFormatted,
            Criteria_FAAPilotCertificate: criteriaFAAPilotCertificateFormatted,
            Criteria_FAAPilotRating: criteriaFAAPilotRatingFormatted,
            Criteria_FAAMechanicCertificate: criteriaFAAMechanicCertificateFormatted,
            ScholarshipIsFeatured: ScholarshipIsFeatured
            });
        await newScholarship.save();

// ToDo:  If insert successful, add permission for Current User to new Scholarship

        res.redirect(`/switchboard?scholarshipid=${newScholarship.ScholarshipID}` +
                     `&status=scholarshipcreatesuccess` +
                     `&actionrequested=editscholarship` +
                     `&sponsorid=${req.body.sponsorID}`);
    };
});

///////////////////////////////
// User (Insert)
///////////////////////////////
router.post('/useradd', requiresAuth(),
    [
        check('userLoginName')
            .isLength( { min: 3, max: 100 } ).withMessage('User Login Name should be 3 to 100 characters.')
    ],

    async (req, res) => {

    // Validate the input
    const validationErrors = validationResult(req);

    // If invalid data, return errors to client
    if ( !validationErrors.isEmpty() ) {

// ToDo:  Replicate the GET render code above, including parameters prep work

        return res.status(400).json(validationErrors.array());







    } else {
        // Add the new data to the database in a new record, and return the newly-generated [UserID] value
        const newUser = new UsersTable( {
            Username: req.body.userLoginName,
            UserFName: req.body.userFName,
            UserLName: req.body.userLName,
            UserTelephone: req.body.userTelephone
        });
        await newUser.save();

// ToDo:  If insert successful, add basic permissions for new User

        res.redirect(`/switchboard?userid=${newUser.UserID}` +
                     `&status=usercreatesuccess` +
                     `&actionrequested=edituser`);
    };
});

///////////////////////////////
// User Permission (Insert)
///////////////////////////////
router.post('/userpermissionadd', requiresAuth(),
[
    check('permissionValues')
        .isLength( { min: 1, max: 100 } ).withMessage('Limiting Values should be 1 to 100 characters.')
],

    async (req, res) => {

    // Reformat checkboxes to boolean values to be updated into Postgres
    let CanRead = (req.body.canRead === "CanRead") ? true : false;
    let CanUpdate = (req.body.canUpdate === "CanUpdate") ? true : false;
    let CanDelete = (req.body.canDelete === "CanDelete") ? true : false;
    let CanCreate = (req.body.canCreate === "CanCreate") ? true : false;

    // Reformat blank dates and numbers to NULL values to be updated into Postgres
    let EffectiveDate = (req.body.effectiveDate === "") ? null : req.body.effectiveDate;
    let ExpirationDate = (req.body.expirationDate === "") ? null : req.body.expirationDate;

    // Validate the input
    const validationErrors = validationResult(req);

    // If invalid data, return errors to client
    if ( !validationErrors.isEmpty() ) {

// ToDo:  Replicate the GET render code above, including parameters prep work


        return res.status(400).json(validationErrors.array());







    } else {
        // Add the new data to the database in a new record, and return the newly-generated [WebsiteUserPermissionID] value
        console.log(`userID to save user permission: ${req.body.userID}`);
        const newUserPermission = new UserPermissionsTable( {
            UserID: req.body.userID,
            PermissionCategoryID: req.body.permissionCategory,
            ObjectValues: req.body.permissionValues,
            CanCreate: CanCreate,
            CanRead: CanRead,
            CanUpdate: CanUpdate,
            CanDelete: CanDelete,
            EffectiveDate: EffectiveDate,
            ExpirationDate: ExpirationDate,
            });
        await newUserPermission.save();

// ToDo:  Error Checking
        res.redirect(`/switchboard?userpermissionid=${newUserPermission.WebsiteUserPermissionID}` +
                     `&status=userpermissioncreatesuccess` +
                     `&actionrequested=edituserpermission` +
                     `&userid=${req.body.userID}`);
    };
});


////////////////////////////////////////////////////////////
// "PUT" Routes (Update data)
////////////////////////////////////////////////////////////

///////////////////////////////
// Sponsor (Update)
///////////////////////////////
router.put('/sponsorupdate', requiresAuth(), async (req, res) => {

    // Reformat the SELECT options into a pipe-delimited array for storage
    const sponsorStatusFormatted = commonFx.convertOptionsToDelimitedString(req.body.sponsorStatus, "|", "0", "false");
    const sponsorTypesFormatted = commonFx.convertOptionsToDelimitedString(req.body.sponsorTypes, "|", "0", "false");

    // Reformat checkboxes to boolean values to be updated into Postgres
    let SponsorIsFeatured = (req.body.sponsorIsFeatured === "SponsorIsFeatured") ? true : false;

    // Get a pointer to the current record
    const sponsorRecord = await SponsorsTable.findOne( {
        where: { SponsorID: req.body.sponsorIDToUpdate }
    });
//    console.log(`sponsorRecordToUpdate: ${sponsorRecord.SponsorID}`);

    // Update the database record with the new data
    await sponsorRecord.update( {
        SponsorName: req.body.sponsorName,
        SponsorDescription: req.body.sponsorDescription,
        SponsorWebsite: req.body.sponsorWebsite,
        SponsorLogo: req.body.sponsorLogo,
        SponsorContactFName: req.body.sponsorContactFName,
        SponsorContactLName: req.body.sponsorContactLName,
        SponsorContactEmail: req.body.sponsorContactEmail,
        SponsorContactTelephone: req.body.sponsorContactTelephone,
        SponsorType: sponsorTypesFormatted,
        SponsorStatusID: sponsorStatusFormatted,
        SponsorIsFeatured: SponsorIsFeatured
    }).then( () => {
        res.redirect(`/switchboard?sponsorid=${sponsorRecord.SponsorID}` +
                     `&status=sponsorupdatesuccess` +
                     `&actionrequested=editsponsor`);
    });
});

///////////////////////////////
// Scholarship (Update)
///////////////////////////////
router.put('/scholarshipupdate', requiresAuth(), async (req, res) => {

    console.log(`ScholarshipDescription (unformatted): ${req.body.scholarshipDescription}`);

    // Reformat the multiple-option SELECT values into a pipe-delimited array for storage
    const scholarshipStatusFormatted = commonFx.convertOptionsToDelimitedString(req.body.scholarshipStatus, "|", "0", "false");
    const scholarshipRecurrenceFormatted = commonFx.convertOptionsToDelimitedString(req.body.scholarshipRecurrence, "|", "0", "false");
    const criteriaFieldOfStudyFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFieldOfStudy, "|", "0", "false");
    const criteriaCitizenshipFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaCitizenship, "|", "0", "false");
    const criteriaYearOfNeedFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaYearOfNeed, "|", "0", "false");
    const criteriaFemaleApplicantsOnlyFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFemaleApplicantsOnly, "|", "0", "false");
    const criteriaEnrollmentStatusFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaEnrollmentStatus, "|", "0", "false");
    const criteriaMilitaryServiceFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaMilitaryService, "|", "0", "false");
    const criteriaFAAPilotCertificateFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotCertificate, "|", "0", "false");
    const criteriaFAAPilotRatingFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotRating, "|", "0", "false");
    const criteriaFAAMechanicCertificateFormatted = commonFx.convertOptionsToDelimitedString(req.body.criteriaFAAMechanicCertificate, "|", "0", "false");

    // Reformat blank dates and numbers to NULL values to be updated into Postgres
    let ApplListDate = (req.body.scholarshipApplListDate === "") ? null : req.body.scholarshipApplListDate;
    let ApplStartDate = (req.body.scholarshipApplStartDate === "") ? null : req.body.scholarshipApplStartDate;
    let ApplEndDate = (req.body.scholarshipApplEndDate === "") ? null : req.body.scholarshipApplEndDate;
    let MinimumAge = (req.body.criteriaMinimumAge === "") ? null : req.body.criteriaMinimumAge;
    let MaximumAge = (req.body.criteriaMaximumAge === "") ? null : req.body.criteriaMaximumAge;
    let MinimumGPA = (req.body.criteriaMinimumGPA === "") ? null : req.body.criteriaMinimumGPA;

    // Reformat checkboxes to boolean values to be updated into Postgres
    let ScholarshipIsFeatured = (req.body.scholarshipIsFeatured === "ScholarshipIsFeatured") ? true : false;

    // Get a pointer to the current record
    const scholarshipRecord = await ScholarshipsTable.findOne( {
        where: { ScholarshipID: req.body.scholarshipIDToUpdate }
    });

    // Update the database record with the new data
    await scholarshipRecord.update( {
        ScholarshipStatus: scholarshipStatusFormatted,
        ScholarshipName: req.body.scholarshipName,
        ScholarshipDescription: req.body.scholarshipDescription,
        ScholarshipLink: req.body.scholarshipLink,
        ScholarshipAward: req.body.scholarshipAward,
        ScholarshipContactFName: req.body.scholarshipContactFName,
        ScholarshipContactLName: req.body.scholarshipContactLName,
        ScholarshipContactEmail: req.body.scholarshipContactEmail,
        ScholarshipContactTelephone: req.body.scholarshipContactTelephone,
        Notes_Admin: req.body.notesAdmin,
        ScholarshipEligibilityReqs: req.body.scholarshipEligReqsPrimary,
        ScholarshipEligibilityReqsOther: req.body.scholarshipEligReqsOther,
        ScholarshipRecurrence: scholarshipRecurrenceFormatted,
        ScholarshipApplListDate: ApplListDate,
        ScholarshipApplStartDate: ApplStartDate,
        ScholarshipApplEndDate: ApplEndDate,
        Criteria_FieldOfStudy: criteriaFieldOfStudyFormatted,
        Criteria_AgeMinimum: MinimumAge,
        Criteria_AgeMaximum: MaximumAge,
        Criteria_Citizenship: criteriaCitizenshipFormatted,
        Criteria_YearOfNeed: criteriaYearOfNeedFormatted,
        Criteria_FemaleApplicantsOnly: criteriaFemaleApplicantsOnlyFormatted,
        Criteria_EnrollmentStatus: criteriaEnrollmentStatusFormatted,
        Criteria_GPAMinimum: MinimumGPA,
        Criteria_USMilitaryService: criteriaMilitaryServiceFormatted,
        Criteria_FAAPilotCertificate: criteriaFAAPilotCertificateFormatted,
        Criteria_FAAPilotRating: criteriaFAAPilotRatingFormatted,
        Criteria_FAAMechanicCertificate: criteriaFAAMechanicCertificateFormatted,
        ScholarshipIsFeatured: ScholarshipIsFeatured
    }).then( () => {
        res.redirect(`/switchboard?scholarshipid=${scholarshipRecord.ScholarshipID}` +
                     `&status=scholarshipupdatesuccess` +
                     `&actionrequested=editscholarship` +
                     `&sponsorid=${req.body.sponsorID}`);
    });
});

///////////////////////////////
// User (Update)
///////////////////////////////
router.put('/userupdate', requiresAuth(), async (req, res) => {

//ToDo: Add server-side verification

    // Get a pointer to the current record
    const userRecord = await UsersTable.findOne( {
        where: { UserID: req.body.userIDToUpdate }
    });

    // Update the database record with the new data
    await userRecord.update( {
        Username: req.body.userLoginName,
        UserFName: req.body.userFName,
        UserLName: req.body.userLName,
        UserTelephone: req.body.userTelephone
    }).then( () => {
        res.redirect(`/switchboard?userid=${userRecord.UserID}` +
                     `&status=userupdatesuccess` +
                     `&actionrequested=edituser`);
    });
});

///////////////////////////////
// User Permission (Update)
///////////////////////////////
router.put('/userpermissionupdate', requiresAuth(), async (req, res) => {

//ToDo: Add server-side verification

    // Reformat checkboxes to boolean values to be updated into Postgres
    let CanRead = (req.body.canRead === "CanRead") ? true : false;
    let CanUpdate = (req.body.canUpdate === "CanUpdate") ? true : false;
    let CanDelete = (req.body.canDelete === "CanDelete") ? true : false;
    let CanCreate = (req.body.canCreate === "CanCreate") ? true : false;

    // Reformat blank dates and numbers to NULL values to be updated into Postgres
    let EffectiveDate = (req.body.effectiveDate === "") ? null : req.body.effectiveDate;
    let ExpirationDate = (req.body.expirationDate === "") ? null : req.body.expirationDate;

    // Validate the input
//    const validationErrors = validationResult(req);

    // If invalid data, return errors to client
//    if ( !validationErrors.isEmpty() ) {

// ToDo:  Replicate the GET render code above, including parameters prep work


//        return res.status(400).json(validationErrors.array());

//    } else {

        // Get a pointer to the current record
        const userPermissionRecord = await UserPermissionsTable.findOne( {
            where: { WebsiteUserPermissionID: req.body.userPermissionIDToUpdate }
        });

        // Update the database record with the new data
        await userPermissionRecord.update( {
            ObjectValues: req.body.permissionValues,
            CanCreate: CanCreate,
            CanRead: CanRead,
            CanUpdate: CanUpdate,
            CanDelete: CanDelete,
            EffectiveDate: EffectiveDate,
            ExpirationDate: ExpirationDate,
        }).then( () => {
            res.redirect(`/switchboard?userpermissionid=${userPermissionRecord.WebsiteUserPermissionID}` +
                         `&userid=${userPermissionRecord.UserID}` +
                         `&status=userpermissionupdatesuccess` +
                         `&actionrequested=edituserpermission`);
        });
//    };
});


////////////////////////////////////////////////////////////
// "DELETE" Routes (Delete data)
////////////////////////////////////////////////////////////

///////////////////////////////
// Sponsor (Delete)
///////////////////////////////
router.delete('/sponsordelete', requiresAuth(), async (req, res) => {

    // Get a pointer to the current record
//    console.log(`body.SponsorID: ${req.body.sponsorIDToDelete}`);
    const sponsorRecord = await SponsorsTable.findOne( {
        where: { SponsorID: req.body.sponsorIDToDelete }
    });
//    console.log(`sponsorRecord: ${sponsorRecord.SponsorID}`);

    // Delete the record, based on the Sponsor ID
    await sponsorRecord.destroy().then( () => {
        res.redirect(`/switchboard?status=sponsordeletesuccess`);
    });
});

///////////////////////////////
// Scholarship (Delete)
///////////////////////////////
router.delete('/scholarshipdelete', requiresAuth(), async (req, res) => {

    // Get a pointer to the current record
    console.log(`body.ScholarshipIDToDelete: ${req.body.scholarshipIDToDelete}`);
    const scholarshipRecord = await ScholarshipsTable.findOne( {
        where: { ScholarshipID: req.body.scholarshipIDToDelete }
    });
    console.log(`scholarshipRecord: ${scholarshipRecord.ScholarshipID}`);

    // Delete the record, based on the Sponsor ID
    await scholarshipRecord.destroy().then( () => {
        res.redirect(`/switchboard?status=scholarshipdeletesuccess&sponsorid=${req.body.sponsorIDOfScholarship}`);
    });
});

///////////////////////////////
// User (Delete)
///////////////////////////////
router.delete('/userdelete', requiresAuth(), async (req, res) => {

    // Get a pointer to the current record
    const userRecord = await UsersTable.findOne( {
        where: { UserID: req.body.userIDToDelete }
    });

    // Delete the record, based on the User ID
    await userRecord.destroy().then( () => {
        res.redirect(`/switchboard?status=userdeletesuccess`);
    });
});

///////////////////////////////
// User Permission (Delete)
///////////////////////////////
router.delete('/userpermissiondelete', requiresAuth(), async (req, res) => {

    // Get a pointer to the current record
    console.log(`body.userPermissionIDToDelete: ${req.body.userPermissionIDToDelete}`);
    const userPermissionRecord = await UserPermissionsTable.findOne( {
        where: { WebsiteUserPermissionID: req.body.userPermissionIDToDelete }
    });
    console.log(`userPermissionRecord: ${userPermissionRecord.WebsiteUserPermissionID}`);

    // Delete the record
    console.log(`userID to redirect to after user permission deletion: ${req.body.userIDOfPermission}`)
    await userPermissionRecord.destroy().then( () => {
        res.redirect(`/switchboard?status=userpermissiondeletesuccess` +
                     `&userid=${req.body.userIDOfPermission}`);
    });
});


////////////////////////////////////////////////////////////
// Invalid Routes
////////////////////////////////////////////////////////////
router.get('*', async (req, res) => {
    return res.render('error', {
        userName: '',
        errorCode: 901  // invalid route
    });
});


///////////////////////////////////////////////////////////////////////////////////
// Return all routes
///////////////////////////////////////////////////////////////////////////////////
module.exports = router;