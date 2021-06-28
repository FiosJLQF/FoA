///////////////////////////////////////////////////////////////////////////////////
// Required External Modules
///////////////////////////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const { auth, requiresAuth } = require('express-openid-connect');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const { ScholarshipsTableTest, ScholarshipsActive, ScholarshipsActiveDDL, ScholarshipsAllDDL, ScholarshipsAllDDLTest,
        SponsorsTableTest, Sponsors, SponsorsDDL, SponsorsAllDDLTest, 
        GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
        EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
        FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
        UsersAllDDL, UsersTableTest, UserPermissionsActive, UserProfiles,
        ScholarshipRecurrenceCategoriesDDL, ScholarshipStatusCategoriesDDL
    } = require('../models/sequelize.js');
const methodOverride = require('method-override');  // allows PUT and other non-standard methods
router.use(methodOverride('_method')); // allows use of the PUT/DELETE method extensions
const jsFx = require('../scripts/foa_node_fx');
const { check, validationResult } = require('express-validator');


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
    try {

        // Log the request (10001 = "New User Page Redirect")
//        const logResult = jsFx.createLogEntry(10001, req.oidc.user.name);

        return res.render('switchboard_newuser', {
            user: req.oidc.user,
            userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
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
        let actionRequested = '';
        let statusMessage = '';


        ////////////////////////////////////////////////////
        // Get the current user's profile and permissions
        ////////////////////////////////////////////////////
        const userProfiles = await UserProfiles.findAll( { where: { Username: req.oidc.user.email }});
        if ( userProfiles.length === 0 ) {  // The new user has not yet been set up
            // Log the event
            let logEventResult = await jsFx.logEvent('User Profiles', 'Get Current User', 0, 'Failure', 'No such user',
                0, 0, 0, '');
            // Redirect the user to the "New User" screen
            res.redirect(`/switchboard/newuser`);
        };
        // Get the list of active permissions for the user
        const userPermissionsActive = await UserPermissionsActive.findAndCountAll( { where: { UserID: userProfiles[0].UserID }});


        ////////////////////////////////////////////////////
        // Validate query string values
        ////////////////////////////////////////////////////

        // If a requested "sponsorid" is blank, zero or not a number, redirect to the generic Switchboard page
        console.log(`sponsorid = ${req.query['sponsorid']}`);
        let sponsorIDRequested = '';
        if ( req.query['sponsorid'] != undefined ) {  // if the querystring variable exists, check its format
            sponsorIDRequested = Number(req.query['sponsorid']);
            console.log(`sponsorIDRequested = ${sponsorIDRequested}`);
            if ( sponsorIDRequested == 0 || sponsorIDRequested === '' || Number.isNaN(sponsorIDRequested)) {
                // Log the event
                let logEventResult = await jsFx.logEvent('SponsorID Validation', '', 0, 'Failure',
                    `SponsorID is not valid (${req.query['sponsorid']})`,
                    0, 0, userProfiles[0].UserID, process.env.EMAIL_WEBMASTER_LIST);
                // Redirect the user to the main switchboard
                res.redirect('/switchboard');
            };
        };

        // If a requested "scholarshipid" is blank, zero or not a number, redirect to the generic Switchboard page
        console.log(`scholarshipid = ${req.query['scholarshipid']}`);
        let scholarshipIDRequested = '';
        if ( req.query['scholarshipid'] != undefined ) {  // if the querystring variable exists, check its format
            scholarshipIDRequested = Number(req.query['scholarshipid']);
            console.log(`scholarshipIDRequested = ${scholarshipIDRequested}`);
            if ( scholarshipIDRequested == 0 || scholarshipIDRequested === '' || Number.isNaN(scholarshipIDRequested)) {
                // Log the event
                let logEventResult = await jsFx.logEvent('ScholarshipID Validation', '', 0, 'Failure',
                    `ScholarshipID is not valid (${req.query['scholarshipid']})`,
                    0, 0, userProfiles[0].UserID, process.env.EMAIL_WEBMASTER_LIST);
                // Redirect the user to the main switchboard
                res.redirect('/switchboard');
            };
        };
        
        // If a requested "userid" is blank, zero or not a number, redirect to the generic Switchboard page
        console.log(`userid = ${req.query['userid']}`);
        let userIDRequested = '';
        if ( req.query['userid'] != undefined ) {  // if the querystring variable exists, check its format
            userIDRequested = Number(req.query['userid']);
            console.log(`userIDRequested = ${userIDRequested}`);
            if ( userIDRequested == 0 || userIDRequested === '' || Number.isNaN(userIDRequested)) {
                // Log the event
                let logEventResult = await jsFx.logEvent('UserID Validation', '', 0, 'Failure',
                    `UserID is not valid (${req.query['userid']})`,
                    0, 0, userProfiles[0].UserID, process.env.EMAIL_WEBMASTER_LIST);
                // Redirect the user to the main switchboard
                res.redirect('/switchboard');
            };
        };
        
        ////////////////////////////////////////////////////
        //  Sponsor Permissions / Details (DDL, Add Sponsor, Default Sponsor, etc.)
        ////////////////////////////////////////////////////
        const { userCanReadSponsors, userCanCreateSponsors, sponsorsAllowedDDL, sponsorID, sponsorDetails, doesSponsorExist,
                userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor
        } = await jsFx.getSponsorPermissionsForUser( userPermissionsActive, sponsorIDRequested );

        // Does the requested Sponsor exist (if requested)?
        console.log(`doesSponsorExist: (${doesSponsorExist})`);
        if ( !doesSponsorExist ) {  // Sponsor ID does not exist
            errorCode = 908;
            // Log the event
            let logEventResult = await jsFx.logEvent('SponsorID Validation', '', 908, 'Failure',
                `SponsorID does not exist (${sponsorIDRequested})`,
                0, 0, userProfiles[0].UserID, process.env.EMAIL_WEBMASTER_LIST);
            // redirect the user to the error screen
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        };

        // Does the User have permission to see/edit/delete this Sponsor?
        if ( !userCanReadSponsor ) { // User does not have permission to read Sponsor's data - trap and log error
// ToDo:  Log the error
            errorCode = 909;
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        };

        ////////////////////////////////////////////////////
        //  Scholarships Permissions / Details (DDL, Add Scholarship, Default Scholarship, etc.)
        ////////////////////////////////////////////////////
        const { userCanReadScholarships, userCanCreateScholarships, scholarshipsAllowedDDL, scholarshipID, scholarshipDetails,
                doesScholarshipExist, userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship
        } = await jsFx.getScholarshipPermissionsForUser( userPermissionsActive, sponsorID, scholarshipIDRequested );

        // Does the requested Scholarship exist (if requested)?
        console.log(`doesScholarshipExist: (${doesScholarshipExist})`);
        if ( !doesScholarshipExist ) {  // Scholarship ID does not exist
// ToDo:  Log the error
            errorCode = 918;  // Unknown Scholarship
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        };

        // Does the User have permission to see/edit/delete this Scholarship?
        if ( !userCanReadScholarship ) { // User does not have permission to read Scholarship's data - trap and log error
// ToDo:  Log the error
            errorCode = 919;  // Unknown Scholarship
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        };


        ////////////////////////////////////////////////////
        //  Website User Permissions / Details (DDL, Add User, Default User, etc.)
        ////////////////////////////////////////////////////
        const { userCanReadUsers, userCanCreateUsers, usersAllowedDDL, userID, userDetails, doesUserExist,
                userCanReadUser, userCanUpdateUser, userCanDeleteUser
        } = await jsFx.getUserPermissionsForUser( userPermissionsActive, userIDRequested );

        // Does the User have access to the Users DDL?
        if ( userCanReadUsers ) {

            // Does the requested User exist (if requested)?  If not, skip error processing
            console.log(`doesUserExist: (${doesUserExist})`);
            if ( !doesUserExist ) {  // User ID does not exist
// ToDo:  Log the error
                errorCode = 928;  // Unknown User
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
                });
            };

            // Does the User have permission to see/edit/delete this User?
            if ( !userCanReadUser ) { // User does not have permission to read User's data - trap and log error
// ToDo:  Log the error
                errorCode = 929;  // Unknown User
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
                });
            };
        };


        ////////////////////////////////////////////////////
        // Retrieve options for add/edit form DDLs
        ////////////////////////////////////////////////////
        let scholarshipStatusCategories = await ScholarshipStatusCategoriesDDL.findAndCountAll({});
        let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
        let scholarshipRecurrenceCategories = await ScholarshipRecurrenceCategoriesDDL.findAndCountAll({});
        let criteriaFieldOfStudyCategories = await FieldOfStudyCategoriesDDL.findAndCountAll({});
        let criteriaCitizenshipCategories = await CitizenshipCategoriesDDL.findAndCountAll({});
        let criteriaYearOfNeedCategories = await YearOfNeedCategoriesDDL.findAndCountAll({});
        let criteriaGenderCategories = await GenderCategoriesDDL.findAndCountAll({});
        let criteriaEnrollmentStatusCategories = await EnrollmentStatusCategoriesDDL.findAndCountAll({});
        let criteriaMilitaryServiceCategories = await MilitaryServiceCategoriesDDL.findAndCountAll({});
        let criteriaFAAPilotCertificateCategories = await FAAPilotCertificateCategoriesDDL.findAndCountAll({});
        let criteriaFAAPilotRatingCategories = await FAAPilotRatingCategoriesDDL.findAndCountAll({});
        let criteriaFAAMechanicCertificateCategories = await FAAMechanicCertificateCategoriesDDL.findAndCountAll({});

        ////////////////////////////////////////////////////
        //  Process any querystring "actions requested" (this will tell the form how to render for the user)
        ////////////////////////////////////////////////////

        if ( req.query['actionrequested'] === 'addsponsor' ) {
            if ( userCanCreateSponsors ) {
                actionRequested = 'addsponsor';
            };
        } else if ( req.query['actionrequested'] === 'editsponsor' ) {
            if ( userCanReadSponsor ) {
                actionRequested = 'editsponsor';
            };
        } else if ( req.query['actionrequested'] === 'addscholarship' ) {
            if ( userCanCreateScholarships ) {
                actionRequested = 'addscholarship';
            };
        } else if ( req.query['actionrequested'] === 'editscholarship' ) {
            if ( userCanReadScholarship ) {
                actionRequested = 'editscholarship';
            };
        } else if ( req.query['actionrequested'] === 'adduser' ) {
            if ( userCanCreateUsers ) {
                actionRequested = 'adduser';
            };
        } else if ( req.query['actionrequested'] === 'edituser' ) {
            if ( userCanReadUser ) {
                actionRequested = 'edituser';
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
        } else{
            statusMessage = '';
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
            userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
            // Main Menu Data
            // Sponsor Information
            userCanReadSponsors,
            sponsorsAllowedDDL,
            userCanCreateSponsors,
            sponsorTypeCategoriesDDL,
            // Scholarship Information
            userCanReadScholarships,
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
            userCanReadUsers,
            usersAllowedDDL,
            userCanCreateUsers,
            // Sponsor CRUD Information
            sponsorID,
            sponsorDetails,
            userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor,
            // Scholarship CRUD Information
            scholarshipID,
            scholarshipDetails,
            userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship,
            scholarshipRecurrenceCategories,
            // Website User CRUD Information
            userID,
            userDetails,
            userCanReadUser, userCanUpdateUser, userCanDeleteUser
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
    const sponsorTypesFormatted = jsFx.convertOptionsToDelimitedString(req.body.sponsorTypes, "|", "0");

    // Validate the input
    const validationErrors = validationResult(req);

    // If invalid data, return errors to client
    if ( !validationErrors.isEmpty() ) {

// ToDo:  Replicate the GET render code above, including parameters prep work


        return res.status(400).json(validationErrors.array());







    } else {
        // Add the new data to the database in a new record, and return the newly-generated [SponsorID] value
        const newSponsor = new SponsorsTableTest( {
            SponsorName: req.body.sponsorName,
            SponsorDescription: req.body.sponsorDescription,
            SponsorWebsite: req.body.sponsorWebsite,
            SponsorLogo: req.body.sponsorLogo,
            SponsorContactFName: req.body.sponsorContactFName,
            SponsorContactLName: req.body.sponsorContactLName,
            SponsorContactEmail: req.body.sponsorContactEmail,
            SponsorContactTelephone: req.body.sponsorContactTelephone,
            SponsorType: sponsorTypesFormatted
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
    const criteriaFieldOfStudyFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFieldOfStudy, "|", "0");
    const criteriaCitizenshipFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaCitizenship, "|", "0");
    const criteriaYearOfNeedFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaYearOfNeed, "|", "0");
    const criteriaEnrollmentStatusFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaEnrollmentStatus, "|", "0");
    const criteriaMilitaryServiceFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaMilitaryService, "|", "0");
    const criteriaFAAPilotCertificateFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotCertificate, "|", "0");
    const criteriaFAAPilotRatingFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotRating, "|", "0");
    const criteriaFAAMechanicCertificateFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFAAMechanicCertificate, "|", "0");

    // Reformat blank dates and numbers to NULL values to be updated into Postgres
    let ApplListDate = (req.body.scholarshipApplListDate === "") ? null : req.body.scholarshipApplListDate;
    let ApplStartDate = (req.body.scholarshipApplStartDate === "") ? null : req.body.scholarshipApplStartDate;
    let ApplEndDate = (req.body.scholarshipApplEndDate === "") ? null : req.body.scholarshipApplEndDate;
    let MinimumAge = (req.body.criteriaMinimumAge === "") ? null : req.body.criteriaMinimumAge;
    let MaximumAge = (req.body.criteriaMaximumAge === "") ? null : req.body.criteriaMaximumAge;
    let MinimumGPA = (req.body.criteriaMinimumGPA === "") ? null : req.body.criteriaMinimumGPA;

    // Validate the input
    const validationErrors = validationResult(req);

    // If invalid data, return errors to client
    if ( !validationErrors.isEmpty() ) {

// ToDo:  Replicate the GET render code above, including parameters prep work


        return res.status(400).json(validationErrors.array());







    } else {
        // Add the new data to the database in a new record, and return the newly-generated [ScholarshipID] value
        console.log(`sponsorID to save scholarship: ${req.body.sponsorID}`);
        const newScholarship = new ScholarshipsTableTest( {
            SponsorID: req.body.sponsorID,
            ScholarshipStatus: req.body.scholarshipStatus,
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
            ScholarshipRecurrence: req.body.scholarshipRecurrence,
            ScholarshipApplListDate: ApplListDate,
            ScholarshipApplStartDate: ApplStartDate,
            ScholarshipApplEndDate: ApplEndDate,
            Criteria_FieldOfStudy: criteriaFieldOfStudyFormatted,
            Criteria_AgeMinimum: MinimumAge,
            Criteria_AgeMaximum: MaximumAge,
            Criteria_Citizenship: criteriaCitizenshipFormatted,
            Criteria_YearOfNeed: criteriaYearOfNeedFormatted,
            Criteria_FemaleApplicantsOnly: req.body.criteriaFemaleApplicantsOnly,
            Criteria_EnrollmentStatus: criteriaEnrollmentStatusFormatted,
            Criteria_GPAMinimum: MinimumGPA,
            Criteria_USMilitaryService: criteriaMilitaryServiceFormatted,
            Criteria_FAAPilotCertificate: criteriaFAAPilotCertificateFormatted,
            Criteria_FAAPilotRating: criteriaFAAPilotRatingFormatted,
            Criteria_FAAMechanicCertificate: criteriaFAAMechanicCertificateFormatted
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
        const newUser = new UsersTableTest( {
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


////////////////////////////////////////////////////////////
// "PUT" Routes (Update data)
////////////////////////////////////////////////////////////

///////////////////////////////
// Sponsor (Update)
///////////////////////////////
router.put('/sponsorupdate', requiresAuth(), async (req, res) => {

    // Reformat the SELECT options into a pipe-delimited array for storage
    const sponsorTypesFormatted = jsFx.convertOptionsToDelimitedString(req.body.sponsorTypes, "|", "0");
//    console.log(`sponsorTypesFormattedUDF: ${sponsorTypesFormatted}`);

    // Get a pointer to the current record
    const sponsorRecord = await SponsorsTableTest.findOne( {
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
        SponsorType: sponsorTypesFormatted
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

    // Reformat the multiple-option SELECT values into a pipe-delimited array for storage
    const criteriaFieldOfStudyFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFieldOfStudy, "|", "0");
    const criteriaCitizenshipFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaCitizenship, "|", "0");
    const criteriaYearOfNeedFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaYearOfNeed, "|", "0");
    const criteriaEnrollmentStatusFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaEnrollmentStatus, "|", "0");
    const criteriaMilitaryServiceFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaMilitaryService, "|", "0");
    const criteriaFAAPilotCertificateFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotCertificate, "|", "0");
    const criteriaFAAPilotRatingFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFAAPilotRating, "|", "0");
    const criteriaFAAMechanicCertificateFormatted = jsFx.convertOptionsToDelimitedString(req.body.criteriaFAAMechanicCertificate, "|", "0");

    // Reformat blank dates and numbers to NULL values to be updated into Postgres
    let ApplListDate = (req.body.scholarshipApplListDate === "") ? null : req.body.scholarshipApplListDate;
    let ApplStartDate = (req.body.scholarshipApplStartDate === "") ? null : req.body.scholarshipApplStartDate;
    let ApplEndDate = (req.body.scholarshipApplEndDate === "") ? null : req.body.scholarshipApplEndDate;
    let MinimumAge = (req.body.criteriaMinimumAge === "") ? null : req.body.criteriaMinimumAge;
    let MaximumAge = (req.body.criteriaMaximumAge === "") ? null : req.body.criteriaMaximumAge;
    let MinimumGPA = (req.body.criteriaMinimumGPA === "") ? null : req.body.criteriaMinimumGPA;

    // Get a pointer to the current record
    const scholarshipRecord = await ScholarshipsTableTest.findOne( {
        where: { ScholarshipID: req.body.scholarshipIDToUpdate }
    });

    // Update the database record with the new data
    await scholarshipRecord.update( {
        ScholarshipStatus: req.body.scholarshipStatus,
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
        ScholarshipRecurrence: req.body.scholarshipRecurrence,
        ScholarshipApplListDate: ApplListDate,
        ScholarshipApplStartDate: ApplStartDate,
        ScholarshipApplEndDate: ApplEndDate,
        Criteria_FieldOfStudy: criteriaFieldOfStudyFormatted,
        Criteria_AgeMinimum: MinimumAge,
        Criteria_AgeMaximum: MaximumAge,
        Criteria_Citizenship: criteriaCitizenshipFormatted,
        Criteria_YearOfNeed: criteriaYearOfNeedFormatted,
        Criteria_FemaleApplicantsOnly: req.body.criteriaFemaleApplicantsOnly,
        Criteria_EnrollmentStatus: criteriaEnrollmentStatusFormatted,
        Criteria_GPAMinimum: MinimumGPA,
        Criteria_USMilitaryService: criteriaMilitaryServiceFormatted,
        Criteria_FAAPilotCertificate: criteriaFAAPilotCertificateFormatted,
        Criteria_FAAPilotRating: criteriaFAAPilotRatingFormatted,
        Criteria_FAAMechanicCertificate: criteriaFAAMechanicCertificateFormatted
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

    // Get a pointer to the current record
    const userRecord = await UsersTableTest.findOne( {
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

////////////////////////////////////////////////////////////
// "DELETE" Routes (Delete data)
////////////////////////////////////////////////////////////

///////////////////////////////
// Sponsor (Delete)
///////////////////////////////
router.delete('/sponsordelete', requiresAuth(), async (req, res) => {

    // Get a pointer to the current record
//    console.log(`body.SponsorID: ${req.body.sponsorIDToDelete}`);
    const sponsorRecord = await SponsorsTableTest.findOne( {
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
    const scholarshipRecord = await ScholarshipsTableTest.findOne( {
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
    const userRecord = await UsersTableTest.findOne( {
        where: { UserID: req.body.userIDToDelete }
    });

    // Delete the record, based on the User ID
    await userRecord.destroy().then( () => {
        res.redirect(`/switchboard?status=userdeletesuccess`);
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