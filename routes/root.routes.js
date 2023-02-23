///////////////////////////////////////////////////////////////////////////////////
// Required External Modules
///////////////////////////////////////////////////////////////////////////////////
const express = require("express");
const router = express.Router();
const { auth, requiresAuth } = require('express-openid-connect');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
//const jsFx = require('../scripts/foa_fx_datamgmt_server');
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

///////////////////////////////////////////////////////////////
// "GET" Routes (retrieve data)
///////////////////////////////////////////////////////////////

///////////////////////////////////////////
// Root (redirect to scholarship search)
///////////////////////////////////////////
router.get('/', (req, res) => {
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Root', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    // Redirect the user to the Scholarship Search Page as the default
    res.redirect('../search/scholarships');
});

///////////////////////////////////////////
// Error processing
///////////////////////////////////////////
router.get('/error', (req, res) => {
//    console.log(`Accessing error page`);
    return res.render('error');
});

///////////////////////////////////////////
// Portal splash page
///////////////////////////////////////////
router.get('/portal', (req, res) => {
//    console.log(`Accessing portal page`);
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Portal', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    // Render the page
    try {
        return res.render('portal', {
            user: req.oidc.user,
            userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
        } )
    } catch(err) {
        console.log('Error:' + err);
    }
});

///////////////////////////////////////////
// Sign-up for new account (handled by Auth0)
///////////////////////////////////////////
router.get("/sign-up", (req, res) => {
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Sign-up', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    // Redirect to the Auth0 signup page
    const { page } = req.params;
    res.oidc.login({
        returnTo: 'switchboard/newuser',
        authorizationParams: {
            screen_hint: "signup",
        },
    });
});

/*
router.get("/login/:page", (req, res) => {
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Log-in', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    // Redirect to the Auth0 login page
    const { page } = req.params;
    res.oidc.login({
      returnTo: page,
    });
});
*/

/*
router.get("/logout/:page", (req, res) => {
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Log-out', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    // Redirect to the Auth0 logout page
    const { page } = req.params;
    res.oidc.logout({
      returnTo: page,
    });
});
*/

/*
    router.get('/profile', requiresAuth(), (req, res) => {
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', 'Profile', 0, 'Informational', 'User Accessed Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    // Redirect to the profile (aka the "User Data Mgmt" page for this user)

// TODO: Add redirect



  });
*/

///////////////////////////////////////////
// Invalid Routes
///////////////////////////////////////////
router.get('*', (req, res) => {
//    console.log(`Invalid route: ${req.url}`);
    // Log access
    try {
        let logEventResult = commonFx.logEvent('Page Access', req.url, 0, 'Error', 'Attempted Access to Invalid Page',
            0, 0, currentUserID, '');
    } catch(e) {
        console.log(`Log event failed: ${e}`);
    };
    return res.render('error', {
        userName: '',
        errorCode: 901  // invalid route
    });
});


///////////////////////////////////////////////////////////////////////////////////
// Module Exports
///////////////////////////////////////////////////////////////////////////////////
module.exports = router;