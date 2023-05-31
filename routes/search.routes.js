///////////////////////////////////////////////////////////////////////////////////
// Required External Modules
///////////////////////////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const { auth, requiresAuth } = require('express-openid-connect');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const { ScholarshipsActive, SponsorsAllView, SponsorsActiveView, SponsorsActiveDDL,
        GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
        EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
        FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL
    } = require('../models/sequelize_foa.js');
const jsSearchFx = require('../scripts/foa_fx_search_generic_server');
const commonFx = require('../scripts/common_fx_server');


///////////////////////////////////////////////////////////////////////////////////
// Auth0 Configuration
///////////////////////////////////////////////////////////////////////////////////

//Configuration for the express-openid-connect route
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

/////////////////////////////////////////////
// empty route
/////////////////////////////////////////////
router.get('/', (req, res) => {
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Search Root', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    // Redirect to scholarship search page (default)
    res.redirect('/search/scholarships');
});

/////////////////////////////////////////////
// Search Scholarships (get)
/////////////////////////////////////////////
router.get('/scholarships', async (req, res) => {

    console.log('\\search\\scholarships requested (get).');

    // local variables
    let sponsorIDRequested = '';
    let scholarshipsMatching = '';
    let sponsorsActiveView = '';
    let scholarshipsAllOrMatched = '';

    ////////////////////////////////////////////////////
    // Validate any query string parameters
    ////////////////////////////////////////////////////

    // If a requested "sponsorid" is blank, zero or not a number, log and redirect to the error screen
    if ( req.query['sponsorid'] != undefined ) {  // if the querystring variable exists, check its format
        sponsorIDRequested = Number(req.query['sponsorid']);
        if ( sponsorIDRequested == 0 || sponsorIDRequested === '' || Number.isNaN(sponsorIDRequested)) {
            errorCode = 908; // Invalid, missing or non-existent SponsorID
            // Log the event
            let logEventResult = await commonFx.logEvent('SponsorID Validation', '', 0, 'Failure',
                `SponsorID is not a valid format (${req.query['sponsorid']})`,
                0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
            // redirect the user to the error screen
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        } else { // value is in a valid format; check to see if it exists in the database
            let doesSponsorIDExist = await SponsorsAllView.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
            if ( doesSponsorIDExist.count == 0 ) {
                errorCode = 908; // Invalid, missing or non-existent SponsorID
                // Log the event
                let logEventResult = await commonFx.logEvent('SponsorID Validation', '', 0, 'Failure',
                    `SponsorID does not exist (${req.query['sponsorid']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
                });
            };
        };
    };  // End "sponsorid" validation checks

    // convert back to a string for querying compatibility
    sponsorIDRequested = sponsorIDRequested.toString();

    ////////////////////////////////////////////////////
    // Retrieve data from database
    ////////////////////////////////////////////////////

    // retrieve the scholarship and sponsor data
    if ( sponsorIDRequested !== '' ) { // retrieve active scholarships for requested sponsor
        scholarshipsMatching = await ScholarshipsActive.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
        sponsorsActiveView = await SponsorsActiveView.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
        scholarshipsAllOrMatched = 'matched';
    } else {  // retrieve all active scholarships
        scholarshipsMatching = await ScholarshipsActive.findAndCountAll({});
        sponsorsActiveView = await SponsorsActiveView.findAndCountAll({});
        scholarshipsAllOrMatched = 'all';
    }
    console.log(`active scholarships: ${scholarshipsMatching.count}`);
    console.log(`scholarshipsAllOrMatched: ${scholarshipsAllOrMatched}`);

    // get the options data for the SELECT objects
    const fieldOfStudyCategoriesDDL = await FieldOfStudyCategoriesDDL.findAndCountAll({});
    const sponsorsActiveDDL = await SponsorsActiveDDL.findAndCountAll({});
    const genderCategoriesDDL = await GenderCategoriesDDL.findAndCountAll({});
    const citizenshipCategoriesDDL = await CitizenshipCategoriesDDL.findAndCountAll({});
    const yearOfNeedCategoriesDDL = await YearOfNeedCategoriesDDL.findAndCountAll({});
    const enrollmentStatusCategoriesDDL = await EnrollmentStatusCategoriesDDL.findAndCountAll({});
    const militaryServiceCategoriesDDL = await MilitaryServiceCategoriesDDL.findAndCountAll({});
    const faaPilotCertificateCategoriesDDL = await FAAPilotCertificateCategoriesDDL.findAndCountAll({});
    const faaPilotRatingCategoriesDDL = await FAAPilotRatingCategoriesDDL.findAndCountAll({});
    const faaMechanicCertificateCategoriesDDL = await FAAMechanicCertificateCategoriesDDL.findAndCountAll({});

    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Scholarship Search', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };

    // render the page
    console.log('Rendering "scholarshipsearch".');
    res.render('scholarshipsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), 
        pageTitle: "Scholarship Search",
        scholarshipsAllOrMatched,
        scholarshipsMatching, 
        sponsorsActiveView, 
        fieldOfStudyCategoriesDDL, sponsorsActiveDDL, genderCategoriesDDL, citizenshipCategoriesDDL, yearOfNeedCategoriesDDL, 
        enrollmentStatusCategoriesDDL, militaryServiceCategoriesDDL, faaPilotCertificateCategoriesDDL,
        faaPilotRatingCategoriesDDL, faaMechanicCertificateCategoriesDDL,
        previousValues: req.body
    });

});

////////////////////////////////////////////////////
// Scholarship Search (Post)
////////////////////////////////////////////////////
router.post('/scholarships', async (req, res) => {

    console.log('\\search\\scholarships requested (post).');

    // local variables
    let scholarshipsMatching = {};
    let sponsorsActiveView = '';
    let scholarshipsAllOrMatched = 'matched';

    ////////////////////////////////////////////////////
    // If the request is to "Reset Search", redirect to the initial search GET route
    ////////////////////////////////////////////////////
    if (req.body.showAllScholarshipsFlag === 'yes') {
        // Log access
        try {
            let logEventResult = commonFx.logEvent('Page Access', 'Reset Scholarship Search', 0, 'Informational', 'User Accessed Page',
                0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
        // Redirect to scholarship search page (default)
        res.redirect('/search/scholarships');
    };

    ////////////////////////////////////////////////////
    // Format any Search Criteria
    ////////////////////////////////////////////////////
    try {
        scholarshipsMatching = await (await jsSearchFx.processScholarshipSearchCriteria(req.body)).scholarshipsMatching;
        console.log(`scholarshipsMatching.count: ${scholarshipsMatching.count}`);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Scholarship Criteria Formatting', 'processScholarshipSearchCriteria', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };

    ////////////////////////////////////////////////////
    // Get a list of all active Sponsors
    ////////////////////////////////////////////////////
    sponsorsActiveView = await SponsorsActiveView.findAndCountAll({});
    console.log(`active sponsors: ${sponsorsActiveView.count}`);

    ///////////////////////////////////////////////////
    // get the options data for the SELECT objects
    ///////////////////////////////////////////////////
    const fieldOfStudyCategoriesDDL = await FieldOfStudyCategoriesDDL.findAndCountAll({});
    const sponsorsActiveDDL = await SponsorsActiveDDL.findAndCountAll({});
    const genderCategoriesDDL = await GenderCategoriesDDL.findAndCountAll({});
    const citizenshipCategoriesDDL = await CitizenshipCategoriesDDL.findAndCountAll({});
    const yearOfNeedCategoriesDDL = await YearOfNeedCategoriesDDL.findAndCountAll({});
    const enrollmentStatusCategoriesDDL = await EnrollmentStatusCategoriesDDL.findAndCountAll({});
    const militaryServiceCategoriesDDL = await MilitaryServiceCategoriesDDL.findAndCountAll({});
    const faaPilotCertificateCategoriesDDL = await FAAPilotCertificateCategoriesDDL.findAndCountAll({});
    const faaPilotRatingCategoriesDDL = await FAAPilotRatingCategoriesDDL.findAndCountAll({});
    const faaMechanicCertificateCategoriesDDL = await FAAMechanicCertificateCategoriesDDL.findAndCountAll({});

    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Scholarship Search', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };

// Send test email to Webmaster
//let emailScholarshipSearchNoticeResult = commonFx.sendEmail('fiosjlqf@gmail.com', 'Scholarship Search Notice','');
//console.log(`Scholarship Search Notice result: ${emailScholarshipSearchNoticeResult}`);

    // render the page
    res.render('scholarshipsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), 
        pageTitle: "Scholarship Search",
        scholarshipsAllOrMatched,
        scholarshipsMatching, 
        sponsorsActiveView, 
        fieldOfStudyCategoriesDDL, sponsorsActiveDDL, genderCategoriesDDL, citizenshipCategoriesDDL, yearOfNeedCategoriesDDL, 
        enrollmentStatusCategoriesDDL, militaryServiceCategoriesDDL, faaPilotCertificateCategoriesDDL,
        faaPilotRatingCategoriesDDL, faaMechanicCertificateCategoriesDDL,
        previousValues: req.body
    });

});

////////////////////////////////////////////////////
// Scholarship Apply (Get)
////////////////////////////////////////////////////
router.get('/scholarshipapply', async (req, res) => {

    console.log('\\search\\scholarshipapply requested (get).');

    // local variables
    let scholarshipsMatching = '';
    let scholarshipIDRequested = '';

    // validate Scholarship ID
    if ( req.query['scholarshipid'] != undefined ) {  // if the querystring variable exists, check its format

        scholarshipIDRequested = Number(req.query['scholarshipid']);
        console.log(`scholarshipIDRequested: ${scholarshipIDRequested}`);

        if ( scholarshipIDRequested == 0 || scholarshipIDRequested === '' || Number.isNaN(scholarshipIDRequested)) {
            errorCode = 909; // Invalid, missing or non-existent ScholarshipID
            // Log the event
            let logEventResult = await commonFx.logEvent('ScholarshipID Validation', '', 0, 'Failure',
                `ScholarshipID is not a valid format (${req.query['scholarshipid']})`,
                0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
            // Redirect the user to the error screen
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        } else { // value is in a valid format; check to see if it exists in the database
            scholarshipsMatching = await ScholarshipsActive.findAndCountAll( { where: { ScholarshipID: scholarshipIDRequested } } );
            if ( scholarshipsMatching.count == 0 ) {
                errorCode = 909; // Invalid, missing or non-existent ScholarshipID
                // Log the event
                let logEventResult = await commonFx.logEvent('ScholarshipID Validation', '', 0, 'Failure',
                    `ScholarshipID does not exist (${req.query['scholarshipid']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
                });
            };
        };
    };  // End "scholarshipid" validation checks; scholarship id was in the proper format and exists in the database

    console.log(`scholarship Apply link: ${scholarshipsMatching.rows[0].ScholarshipLink}`);

    // log apply event
    let logEventResult = await commonFx.logEvent('Scholarship Application', 'Scholarship Search', 0, 'Success',
        `Scholarship "${scholarshipsMatching.rows[0].ScholarshipName}" apply button clicked.`, 0, 0, currentUserID,
        process.env.EMAIL_WEBMASTER_LIST, scholarshipIDRequested);

    // redirect the user to the link
    res.redirect(scholarshipsMatching.rows[0].ScholarshipLink);

});

////////////////////////////////////////////////////
// Sponsor Search (Get)
////////////////////////////////////////////////////
router.get('/sponsors', async (req, res) => {

    console.log('\\search\\sponsors requested (get).');

    // local variables
    let sponsorIDRequested = '';
    let sponsorsMatching = '';
    let sponsorsAllOrMatched = '';

    ////////////////////////////////////////////////////
    // Validate any query string parameters
    ////////////////////////////////////////////////////

    // If a requested "sponsorid" is blank, zero or not a number, log and redirect to the error screen
    if ( req.query['sponsorid'] != undefined ) {  // if the querystring variable exists, check its format
        sponsorIDRequested = Number(req.query['sponsorid']);
        if ( sponsorIDRequested == 0 || sponsorIDRequested === '' || Number.isNaN(sponsorIDRequested)) {
            errorCode = 908; // Invalid, missing or non-existent SponsorID
            // Log the event
            let logEventResult = await commonFx.logEvent('SponsorID Validation', '', 0, 'Failure',
                `SponsorID is not a valid format (${req.query['sponsorid']})`,
                0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
            // redirect the user to the error screen
            return res.render( 'error', {
                errorCode: errorCode,
                userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
            });
        } else { // value is in a valid format; check to see if it exists in the database
            let doesSponsorIDExist = await SponsorsAllView.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
            if ( doesSponsorIDExist.count == 0 ) {
                errorCode = 908; // Invalid, missing or non-existent SponsorID
                // Log the event
                let logEventResult = await commonFx.logEvent('SponsorID Validation', '', 0, 'Failure',
                    `SponsorID does not exist (${req.query['sponsorid']})`,
                    0, 0, currentUserID, process.env.EMAIL_WEBMASTER_LIST);
                // redirect the user to the error screen
                return res.render( 'error', {
                    errorCode: errorCode,
                    userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
                });
            };
        };
    };  // End "sponsorid" validation checks

    ////////////////////////////////////////////////////
    // Retrieve data from database
    ////////////////////////////////////////////////////

    // retrieve the sponsor records
    if ( sponsorIDRequested !== '' ) { // retrieve details for requested sponsor
        sponsorsMatching = await SponsorsActiveView.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
        sponsorsAllOrMatched = 'matched';
    } else {  // retrieve all active sponsors
        sponsorsMatching = await SponsorsActiveView.findAndCountAll({});
        sponsorsAllOrMatched = 'all';
    }
    console.log(`active sponsors: ${sponsorsMatching.count}`);
    console.log(`sponsorsAllOrMatched: ${sponsorsAllOrMatched}`);

    // get the options data for the SELECT objects
    const sponsorsActiveDDL = await SponsorsActiveDDL.findAndCountAll({});
    const sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});

    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Sponsor Search', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };

    // render the page
    console.log('Rendering "sponsorsearch".');
    res.render('sponsorsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), 
        pageTitle: "Sponsor Search",
        sponsorsAllOrMatched,
        sponsorsMatching,
        sponsorsActiveDDL,
        sponsorTypeCategoriesDDL,
        previousValues: req.body
    });

});


////////////////////////////////////////////////////
// Sponsor Search (Post)
////////////////////////////////////////////////////
router.post('/sponsors', async (req, res) => {

    console.log('\\search\\sponsors requested (post).');

    // local variables
    let sponsorsMatching = {};
    let sponsorsActiveView = '';
    let sponsorsAllOrMatched = 'matched';

    ////////////////////////////////////////////////////
    // If the request is to "Reset Search", redirect to the initial search GET route
    ////////////////////////////////////////////////////
    if (req.body.showAllSponsorsFlag === 'yes') {
        // Log access
        try {
            let logEventResult = commonFx.logEvent('Page Access', 'Reset Sponsor Search', 0, 'Informational', 'User Accessed Page',
                0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
        // Redirect to sponsor search page
        res.redirect('/search/sponsors');
    };

    ////////////////////////////////////////////////////
    // Format any Search Criteria
    ////////////////////////////////////////////////////
    try {
        sponsorsMatching = await (await jsSearchFx.processSponsorSearchCriteria(req.body)).sponsorsMatching;
        console.log(`sponsorsMatching.count: ${sponsorsMatching.count}`);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Sponsor Criteria Formatting', 'processSponsorSearchCriteria', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };

    ////////////////////////////////////////////////////
    // Get a list of all active Sponsors
    ////////////////////////////////////////////////////
    sponsorsActiveView = await SponsorsActiveView.findAndCountAll({});
    console.log(`active sponsors: ${sponsorsActiveView.count}`);

    ///////////////////////////////////////////////////
    // get the options data for the SELECT objects
    ///////////////////////////////////////////////////
    const sponsorsActiveDDL = await SponsorsActiveDDL.findAndCountAll({});
    const sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});

    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Sponsor Search', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };

    // render the page
    console.log('Rendering "sponsorsearch".');
    res.render('sponsorsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), 
        pageTitle: "Sponsor Search",
        sponsorsAllOrMatched,
        sponsorsMatching,
        sponsorsActiveDDL,
        sponsorTypeCategoriesDDL,
        previousValues: req.body
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

module.exports = router;