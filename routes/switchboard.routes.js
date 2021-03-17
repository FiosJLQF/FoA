///////////////////////////////////////////////////////////////////////////////////
// Required External Modules
///////////////////////////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const { auth, requiresAuth } = require('express-openid-connect');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const { ScholarshipsTableTest, ScholarshipsActive, ScholarshipsDDL, ScholarshipsAllDDL, ScholarshipsAllDDLTest,
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

        ////////////////////////////////////////////////////
        // Validate query string values
        ////////////////////////////////////////////////////

        // If a requested "sponsorid" is blank, zero or not a number, redirect to the generic Switchboard page
        const sponsorIDRequested = Number(req.query['sponsorid']);
        if ( sponsorIDRequested == 0 || sponsorIDRequested === '' ) {
// ToDo:  Log the error
            res.redirect('/switchboard');
        };

        // If a requested "scholarshipid" is blank, zero or not a number, redirect to the generic Switchboard page
        const scholarshipIDRequested = Number(req.query['scholarshipid']);
        if ( scholarshipIDRequested == 0 || scholarshipIDRequested === '' ) {
// ToDo:  Log the error
            res.redirect('/switchboard');
        };
        
        ////////////////////////////////////////////////////
        // Get the current user's profile and permissions
        ////////////////////////////////////////////////////
        const userProfiles = await UserProfiles.findAll( { where: { Username: req.oidc.user.email }});
        if ( userProfiles.length === 0 ) {
// ToDo:  Log the error
            res.redirect(`/switchboard/newuser`);
        };

        // Get the list of active permissions for the user
        const userPermissionsActive = await UserPermissionsActive.findAndCountAll( { where: { UserID: userProfiles[0].UserID }});

        ////////////////////////////////////////////////////
        //  Sponsor Permissions / Details (DDL, Add Sponsor, Default Sponsor, etc.)
        ////////////////////////////////////////////////////
        const { userCanReadSponsors, userCanCreateSponsors, sponsorsAllowedDDL, sponsorID, sponsorDetails, doesSponsorExist,
                userCanReadSponsor, userCanUpdateSponsor, userCanDeleteSponsor
        } = await jsFx.getSponsorPermissionsForUser( userPermissionsActive, sponsorIDRequested );

        // Does the requested Sponsor exist (if requested)?
        console.log(`doesSponsorExist: (${doesSponsorExist})`);
        if ( !doesSponsorExist ) {  // Sponsor ID does not exist
// ToDo:  Log the error
            errorCode = 908;  // Unknown Sponsor
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        };

        // Does the User have permission to see/edit/delete this Sponsor?
        if ( !userCanReadSponsor ) { // User does not have permission to read Sponsor's data - trap and log error
// ToDo:  Log the error
            errorCode = 909;  // Unknown Sponsor
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        };

        ////////////////////////////////////////////////////
        //  Scholarships Information/Permissions (DDL, Add Scholarship, Default Scholarship, etc.)
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

        ////////////////////////////////////////////////////
        // Retrieve options for add/edit form DDLs
        ////////////////////////////////////////////////////
        let sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});

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
            scholarshipsAllowedDDL,
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
            scholarshipDetails,
            userCanReadScholarship, userCanUpdateScholarship, userCanDeleteScholarship
        })
    } catch(err) {
// ToDo:  Log the error
        console.log('Error:' + err);
    }
});


////////////////////////////////////////
// "POST" Routes (Add new data recordes)
////////////////////////////////////////

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