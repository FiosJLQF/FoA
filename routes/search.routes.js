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
const { UsersTable, UsersAllView, UsersAllDDL, 
        UserPermissionsActive, UserPermissionsAllDDL, UserPermissionsAllView, UserPermissionsTable,
        UserPermissionCategoriesAllDDL
    } = require('../models/sequelize_common.js');
//const jsFx = require('../scripts/foa_fx_server');
const jsSearchFx = require('../scripts/foa_search_scripts');
const commonFx = require('../scripts/common_fx_server');
const { Op } = require('sequelize');  // enables WHERE clause operators


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

router.get('/scholarships', async (req, res) => {

    console.log('\search\scholarships requested.');
    console.log(`req.query.filterFieldOfStudyInput: ${req.query.filterFieldOfStudyInput}`);

    // local variables
    let previousValues = '';    // added for compatibility with reload after POST
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
    // Transform submitted data for search logic
    ////////////////////////////////////////////////////
    const criteriaFieldOfStudyFormatted = commonFx.convertOptionsToDelimitedString(req.body.filterFieldOfStudyInput, "|", "0", "false");
console.log(`criteriaFieldOfStudy string: ${criteriaFieldOfStudyFormatted}`);


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

    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Scholarship Search', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };

    // render the page
    res.render('scholarshipsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), 
        pageTitle: "Scholarship Search",
        scholarshipsActive, 
        sponsorsActiveView, 
        fieldOfStudyCategoriesDDL, sponsorsActiveDDL, genderCategoriesDDL, citizenshipCategoriesDDL, yearOfNeedCategoriesDDL, 
        enrollmentStatusCategoriesDDL, militaryServiceCategoriesDDL, faaPilotCertificateCategoriesDDL,
        faaPilotRatingCategoriesDDL, faaMechanicCertificateCategoriesDDL,
        previousValues: previousValues
    });
});

////////////////////////////////////////////////////
// Scholarship Search POST Response
////////////////////////////////////////////////////
router.post('/scholarships', async (req, res) => {

    // local variables
    let scholarshipsActive = '';
    let sponsorsActiveView = '';
    let criteriaFieldOfStudyFormatted = [];
    let criteriaSponsorFormatted = [];

    ////////////////////////////////////////////////////
    // Transform submitted data for search logic
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    // Retrieve data from database
    ////////////////////////////////////////////////////

    //////////////////////////////////////
    // Field(s) of Study
    //////////////////////////////////////
        try {
            criteriaFieldOfStudyFormatted = await jsSearchFx.formatSearchCriteriaArray(req.body.filterFieldOfStudyInput)
        }
        catch(e) {
            let logEventResult = commonFx.logEvent('Scholarship Search Criteria Formatting', 'Field of Study', 0, 'Error',
            e.message, 0, 0, currentUserID, '');
        };
    console.log(`criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat: ${criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Field of Study', 0, 'Informational',
            criteriaFieldOfStudyFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };
    //////////////////////////////////////
    // Sponsor(s)
    //////////////////////////////////////
    try {
        criteriaSponsorFormatted = await jsSearchFx.formatSearchCriteriaArray(req.body.filterSponsorNamesInput);
    }
    catch(e) {
        let logEventResult = commonFx.logEvent('Sponsor Search Criteria Formatting', 'Sponsor', 0, 'Error',
        e.message, 0, 0, currentUserID, '');
    };
    console.log(`criteriaSponsorFormatted.searchCriteriaSearchFormat: ${criteriaSponsorFormatted.searchCriteriaSearchFormat}`);
    // Log search criteria
    if ( criteriaSponsorFormatted.searchCriteriaSearchFormat !== '{}' ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Sponsor', 0, 'Informational',
            criteriaSponsorFormatted.searchCriteriaLogFormat, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };
    //////////////////////////////////////
    // Age
    //////////////////////////////////////
    criteriaAge = req.body.filterAgeInput;
    console.log(`criteriaAge: ${criteriaAge}`);
    // Log search criteria
    if ( criteriaAge.length > 0 ) {
        try {
            let logEventResult = commonFx.logEvent('Scholarship Search', 'Age', 0, 'Informational',
            criteriaAge, 0, 0, currentUserID, '');
        } catch(e) {
            console.log(`Log event failed: ${e}`);
        };
    };

    // add the search parameters, and find the resultant records
    try {
        scholarshipsActive = await ScholarshipsActive.findAndCountAll( {
            where: {
                [Op.or]: {
                    Criteria_FieldOfStudy: {
                        [Op.like]: {    
                            [Op.any]: criteriaFieldOfStudyFormatted.searchCriteriaSearchFormat } },
                    SponsorID: {
                        [Op.like]: {    
                            [Op.any]: criteriaSponsorFormatted.searchCriteriaSearchFormat } },
                    // [Op.and]: {
                    //     Criteria_AgeMinimum: {
                    //         [Op.lt]: criteriaAge },
                    //     Criteria_AgeMaximum: {
                    //         [Op.gt]: criteriaAge }
                    // },
                            


// TODO:  Add remaining criteria





                } } } );
    } catch(e) {
        console.log(e);
    };

    // Get a list of all active Sponsors
    sponsorsActiveView = await SponsorsActiveView.findAndCountAll({});
    console.log(`active scholarships: ${scholarshipsActive.count}`);

    // Get the ranking for each matching scholarship
    for (let matchingScholarship of scholarshipsActive.rows) {
        console.log(`matchingScholarship[name]: ${matchingScholarship['ScholarshipName']}`);

// TODO: create function scholarshipSearchResultRank(matchingScholarship, req.body)









    };

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

    // render the page
    res.render('scholarshipsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), 
        pageTitle: "Scholarship Search",
        scholarshipsActive, 
        sponsorsActiveView, 
        fieldOfStudyCategoriesDDL, sponsorsActiveDDL, genderCategoriesDDL, citizenshipCategoriesDDL, yearOfNeedCategoriesDDL, 
        enrollmentStatusCategoriesDDL, militaryServiceCategoriesDDL, faaPilotCertificateCategoriesDDL,
        faaPilotRatingCategoriesDDL, faaMechanicCertificateCategoriesDDL,
        previousValues: req.body
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