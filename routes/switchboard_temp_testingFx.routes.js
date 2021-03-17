///////////////////////////////////////////////////////////////////////////////////
// Required External Modules
///////////////////////////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const { auth, requiresAuth } = require('express-openid-connect');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const { ScholarshipsTable, ScholarshipsActive, ScholarshipsDDL, ScholarshipsAllDDL, ScholarshipsAllDDLTest,
        SponsorsTableTest, Sponsors, SponsorsDDL, SponsorsAllDDLTest, 
        GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
        EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
        FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
        UsersAllDDL, UserPermissionsActive, UserProfiles
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

////////////////////////////////////////
// "GET" Routes (Read data)
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

router.get('/', requiresAuth(), async (req, res) => {
    try {

        let errorCode = 0;
        let actionRequested = '';
        let statusMessage = '';

        // Create a "Current User" profile object
//        var currentUser = new jsFx.CurrentUser(req.oidc.user.email);
//        console.log(`CurrentUser.email: ${currentUser.email}`);
//        console.log(`CurrentUser.userID: ${currentUser.userID}`);

        // If a requested "sponsorid" is blank, zero or not a number, redirect to the generic Switchboard page
        const sponsorIDRequested = Number(req.query['sponsorid']);
        if ( sponsorIDRequested == 0 || sponsorIDRequested === '' ) {
            console.log('sponsorid redirected');
            res.redirect('/switchboard');
        };

        // Get the current user's profile
        const userProfiles = await UserProfiles.findAll( { where: { Username: req.oidc.user.email }});
        if ( userProfiles.length === 0 ) {
            res.redirect(`/switchboard/newuser`);
        };

        // Get the list of active permissions for the user
        const userPermissionsActive = await UserPermissionsActive.findAndCountAll( { where: { UserID: userProfiles[0].UserID }});

        ////////////////////////////////////////////////////
        //  Sponsors Information/Permissions (DDL, Add Sponsor, Default Sponsor, etc.)
        ////////////////////////////////////////////////////
        const { userPermissionsSponsorDDL, userCanReadSponsors, userCanCreateSponsors,
                userPermissionsSponsors, sponsorsAllowedDDL,
                sponsorID, sponsorDetails, doesSponsorExist,
                userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor
              } = await jsFx.getUserPermissions( userPermissionsActive, sponsorIDRequested );

        // If a SponsorID was provided in the querystring, or the User only has access to one Sponsor, find the Sponsor's details
//        let sponsorDetails = [];
//        let userCanReadSponsor = false;
//        let userCanUpdateSponsor = false;
//        let userCanDeleteSponsor = false;
//        if ( sponsorID !== '' ) {

            // Does the requested Sponsor exist? Retrieve the Sponsor's details from the database.
//            sponsorDetails = await SponsorsTableTest.findAll({ where: { SponsorID: sponsorID }});
//            if ( typeof sponsorDetails[0] === 'undefined' ) {  // Sponsor ID does not exist
//                console.log('908');
//                errorCode = 908;  // Unknown Sponsor
//                console.log(`errorcode = ${errorCode}`);
//                return res.render( 'error', {
//                    errorCode: errorCode,
//                    userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
//                });
//            };
            console.log(`doesSponsorExist: (${doesSponsorExist})`);
            if ( !doesSponsorExist ) {  // Sponsor ID does not exist
                errorCode = 908;  // Unknown Sponsor
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
                });
            };

            // Does the User have permission to see/edit/delete this Sponsor?
//            if ( sponsorID === userPermissionsSponsors[0].ObjectValues || userPermissionsSponsors[0].ObjectValues === '*' ) {
//                userCanReadSponsor = userPermissionsSponsors[0].CanRead;
//                console.log(`userCanReadSponsor: ${userCanReadSponsor}`);
//                userCanUpdateSponsor = userPermissionsSponsors[0].CanUpdate;
//                console.log(`userCanUpdateSponsor: ${userCanUpdateSponsor}`);
//                userCanDeleteSponsor = userPermissionsSponsors[0].CanDelete;
//                console.log(`userCanDeleteSponsor: ${userCanDeleteSponsor}`);
//            } else {  // User does not have permission to read Sponsor's data - trap and log error
//                console.log('909');
//                errorCode = 909;  // Unknown Sponsor
//                console.log(`errorcode = ${errorCode}`);
//                return res.render( 'error', {
//                        errorCode: errorCode,
//                        userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
//                });
//            };
            if ( !userCanReadSponsor ) { // User does not have permission to read Sponsor's data - trap and log error
                console.log('909');
                errorCode = 909;  // Unknown Sponsor
                console.log(`errorcode = ${errorCode}`);
                return res.render( 'error', {
                        errorCode: errorCode,
                        userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
                });
            };
//        };

        // Can the user create new sponsors?
//        let userCanCreateSponsors = false;
//        if ( userCanReadSponsors && userPermissionsSponsorDDL[0].CanCreate ) {
//            userCanCreateSponsors = true;
//        };

        // Retrieve options for add/edit form DDLs
       let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});

        ////////////////////////////////////////////////////
        //  Scholarships Information (DDL, Add Scholarship, etc.)
        ////////////////////////////////////////////////////

        // Can the user see the scholarships select object?  If so, load the Scholarships available to the current user.
        let userCanReadScholarships = false;
        let userPermissionsScholarshipDDL = [];
        let scholarshipsDDL = [];
        if (userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) { // Only load scholarships if the user can see Sponsors
            userPermissionsScholarshipDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-scholarships');
            if ( userPermissionsScholarshipDDL.length > 0 && userPermissionsScholarshipDDL[0].CanRead ) {  // If the User can see the Scholarships DDL, show it
                userCanReadScholarships = true;
//                console.log(`sponsorID for scholarships DDL: ${sponsorID}`);
                if ( sponsorID !== '' ) {  // If a single Sponsor ID is assigned, load the Scholarships for that Sponsor
                    scholarshipsDDL = await ScholarshipsAllDDLTest.findAndCountAll({ where: { SponsorID: sponsorID } });
                } else {  // Load a blank row of data
                    scholarshipsDDL = await ScholarshipsAllDDLTest.findAndCountAll({ where: { SponsorID: -1 } });
                };
            };
        };
//        console.log(`userCanReadScholarships: ${userCanReadScholarships}`);
//        console.log(`active scholarships for the Sponsor: ${scholarshipsDDL.count}`);

        // Can the user create new scholarships?
        let userCanCreateScholarships = false;
        if ( userCanReadScholarships && userPermissionsScholarshipDDL[0].CanCreate ) {
            userCanCreateScholarships = true;
        };

        ////////////////////////////////////////////////////
        //  Users Information (DDL, Add User, etc.)
        ////////////////////////////////////////////////////

        // Can the user see the users select object?  If so, load the Users available to the current user
        const userPermissionsUserDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-users');
        let userCanReadUsers = false;
        let usersAllDDL = [];
        if ( userPermissionsUserDDL.length > 0 && userPermissionsUserDDL[0].CanRead ) {
            userCanReadUsers = true;
            usersAllDDL = await UsersAllDDL.findAndCountAll({});
            console.log(`usersAllDDL: ${usersAllDDL.count}`);
        };
        console.log(`userCanReadUsers: ${userCanReadUsers}`);

        // Can the user create new users?
        let userCanCreateUsers = false;
        if ( userCanReadUsers && userPermissionsUserDDL[0].CanCreate ) {
            userCanCreateUsers = true;
        };

        // If a ScholarshipID was provided in the querystring, find the Scholarship's details
        let scholarshipDetails = [];
        let scholarshipID = '';
        if ( req.query['scholarshipid'] ) {
            scholarshipID = req.query['scholarshipid'];
//            scholarshipDetails = await ScholarshipsTable.findAll({ where: { ScholarshipID: scholarshipID }});
        };

        ////////////////////////////////////////////////////
        //  Process any querystring "actions requested"
        ////////////////////////////////////////////////////

        if ( req.query['actionRequested'] === 'addsponsor' ) {
            if ( userCanCreateSponsors ) {
                actionRequested = 'addsponsor';
            };
        } else if ( req.query['actionRequested'] === 'addscholarships' ) {
            if ( userCanCreateScholarships ) {
                actionRequested = 'addscholarship';
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
        } else {
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
            userCanReadSponsors,
            sponsorsAllowedDDL,
            userCanCreateSponsors,
            sponsorTypeCategoriesDDL,
            userCanReadScholarships,
            scholarshipsDDL,
            userCanCreateScholarships,
            userCanReadUsers,
            usersAllDDL,
            userCanCreateUsers,
            userID: '',
            // Sponsor Details data
            sponsorID,
            sponsorDetails,
            userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor,
            // Scholarship Details data
            scholarshipID,
        })
    } catch(err) {
        console.log('Error:' + err);
    }
});


////////////////////////////////////////
// "POST" Routes (Add new data recordes)
////////////////////////////////////////

router.post('/sponsoradd',     requiresAuth(),

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
        res.redirect(`/switchboard?sponsorid=${newSponsor.SponsorID}&status=sponsorcreatesuccess`);
    };
});


////////////////////////////////////////
// "PUT" Routes (Update data)
////////////////////////////////////////

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
        res.redirect(`/switchboard?sponsorid=${sponsorRecord.SponsorID}&status=sponsorupdatesuccess`);
    });
});


////////////////////////////////////////
// "DELETE" Routes (Delete data)
////////////////////////////////////////

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

///////////////////////////////////////////
// Invalid Routes
///////////////////////////////////////////
router.get('*', async (req, res) => {
    return res.render('error', {
        userName: '',
        errorCode: 901  // invalid route
    });
});


////////////////////////////////////////
// Return all routes
////////////////////////////////////////

module.exports = router;