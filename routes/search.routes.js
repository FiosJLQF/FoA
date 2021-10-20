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
    const scholarshipsActive = await ScholarshipsActive.findAndCountAll({});
//    console.log(scholarshipsActive.count);
    const fieldOfStudyCategoriesDDL = await FieldOfStudyCategoriesDDL.findAndCountAll({});
//    const sponsorsAllDDL = await SponsorsAllDDL.findAndCountAll({});
    const sponsorsActiveDDL = await SponsorsActiveDDL.findAndCountAll({});
    const genderCategoriesDDL = await GenderCategoriesDDL.findAndCountAll({});
    const citizenshipCategoriesDDL = await CitizenshipCategoriesDDL.findAndCountAll({});
    const yearOfNeedCategoriesDDL = await YearOfNeedCategoriesDDL.findAndCountAll({});
    const enrollmentStatusCategoriesDDL = await EnrollmentStatusCategoriesDDL.findAndCountAll({});
    const militaryServiceCategoriesDDL = await MilitaryServiceCategoriesDDL.findAndCountAll({});
    const faaPilotCertificateCategoriesDDL = await FAAPilotCertificateCategoriesDDL.findAndCountAll({});
    const faaPilotRatingCategoriesDDL = await FAAPilotRatingCategoriesDDL.findAndCountAll({});
    const faaMechanicCertificateCategoriesDDL = await FAAMechanicCertificateCategoriesDDL.findAndCountAll({});
    res.render('scholarshipsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), pageTitle: "Scholarship Search",
        scholarshipsActive, fieldOfStudyCategoriesDDL, sponsorsActiveDDL, genderCategoriesDDL, citizenshipCategoriesDDL,
        yearOfNeedCategoriesDDL, enrollmentStatusCategoriesDDL, militaryServiceCategoriesDDL, faaPilotCertificateCategoriesDDL,
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
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ), pageTitle: "Sponsor Search",
        sponsorsActiveView, sponsorsActiveDDL, sponsorTypeCategoriesDDL, scholarshipsActive });
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