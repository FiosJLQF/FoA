///////////////////////////////////////////////////////////////////////////////////
// Required External Modules
///////////////////////////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const { auth, requiresAuth } = require('express-openid-connect');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const { ScholarshipsTable, /* ScholarshipsTableTest, */ ScholarshipsActive, /* ScholarshipsActiveDDL, */ ScholarshipsAllDDL,
    SponsorsAllView, SponsorsAllDDL, SponsorsActiveView, SponsorsActiveDDL,
    GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
    EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
    FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
    UsersAllDDL, UserPermissionsActive, UserProfiles
    } = require('../models/sequelize.js');


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

router.get('/', (req, res) => {
    res.redirect('/search/scholarships');
});

router.get('/scholarships', async (req, res) => {

    // local variables
    let sponsorIDRequested = '';
    let scholarshipsActive = '';
    let sponsorsActiveView = '';

    ////////////////////////////////////////////////////
    // Validate any query string parameters
    ////////////////////////////////////////////////////

    // If a requested "sponsorid" is blank, zero or not a number, log and redirect to the error screen
    if ( req.query['sponsorid'] != undefined ) {  // if the querystring variable exists, check its format
        sponsorIDRequested = Number(req.query['sponsorid']);
        if ( sponsorIDRequested == 0 || sponsorIDRequested === '' || Number.isNaN(sponsorIDRequested)) {
            errorCode = 908; // Invalid, missing or non-existent SponsorID
            // Log the event
            let logEventResult = await jsFx.logEvent('SponsorID Validation', '', 0, 'Failure',
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
                let logEventResult = await jsFx.logEvent('SponsorID Validation', '', 0, 'Failure',
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

    // retrieve the scholarship and sponsor data
    if ( sponsorIDRequested !== '' ) { // retrieve active scholarships for requested sponsor
        scholarshipsActive = await ScholarshipsActive.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
        sponsorsActiveView = await SponsorsActiveView.findAndCountAll( { where: { SponsorID: sponsorIDRequested } } );
    } else {  // retrieve all active scholarships
        scholarshipsActive = await ScholarshipsActive.findAndCountAll({});
        sponsorsActiveView = await SponsorsActiveView.findAndCountAll({});
    }
    console.log(`active scholarships: ${scholarshipsActive.count}`);
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

    // render the page
    res.render('scholarshipsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), 
        pageTitle: "Scholarship Search",
        scholarshipsActive, 
        sponsorsActiveView, 
        fieldOfStudyCategoriesDDL, sponsorsActiveDDL, genderCategoriesDDL, citizenshipCategoriesDDL, yearOfNeedCategoriesDDL, 
        enrollmentStatusCategoriesDDL, militaryServiceCategoriesDDL, faaPilotCertificateCategoriesDDL,
        faaPilotRatingCategoriesDDL, faaMechanicCertificateCategoriesDDL
    });
});

router.get('/sponsors', async (req, res) => {
    const sponsorsActiveView = await SponsorsActiveView.findAndCountAll({});
    const sponsorsActiveDDL = await SponsorsActiveDDL.findAndCountAll({});
    const sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
    const scholarshipsActive = await ScholarshipsActive.findAndCountAll({});
    console.log(scholarshipsActive.count);
    res.render('sponsorsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
        pageTitle: "Sponsor Search",
        sponsorsActiveView, 
        sponsorsActiveDDL, 
        sponsorTypeCategoriesDDL, 
        scholarshipsActive });
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