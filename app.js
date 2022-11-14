///////////////////////////////////////////////////////////////////////////////////
// Global Variables
///////////////////////////////////////////////////////////////////////////////////
global.currentUserID = 0;


///////////////////////////////////////////////////////////////////////////////////
// Import external libraries/files/modules, and config global variables
///////////////////////////////////////////////////////////////////////////////////
const express = require('express');
//const { check, validationResult } = require('express-validator');
const path = require('path');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const methodOverride = require('method-override');  // allows PUT and other non-standard methods
const ejsMate = require('ejs-mate');  // allows use of EJS templates to compartmentalize code
const compression = require('compression');
const expressSession = require("express-session");
const { auth, requiresAuth } = require('express-openid-connect');
const port = process.env.PORT || 3000;
const cors = require('cors');
const rootRoutes = require('./routes/root.routes.js');
const switchboardRoutes = require('./routes/switchboard.routes.js');
const searchRoutes = require('./routes/search.routes.js');
const jsFx = require('./scripts/foa_fx_server');
const favicon = require('serve-favicon');


///////////////////////////////////////////////////////////////////////////////////
// Configure Express
///////////////////////////////////////////////////////////////////////////////////
const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));  // publicly-accessible files (such as images and css)
app.use(express.urlencoded( { extended: true })); // allows for parsing "body" object
app.use(express.json());
app.use(methodOverride('_method')); // allows use of the PUT/DELETE method extensions
app.use(cors({origin: '*'}));
app.use(favicon(__dirname + '/favicon.ico'));


///////////////////////////////////////////////////////////////////////////////////
// Session Configuration
///////////////////////////////////////////////////////////////////////////////////
const session = {
    secret: process.env.SESSION_SECRET,
    // genid: function(req) {
    //     return genuuid();
    // },
    name: process.env.SESSION_NAME,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 600000 // in milliseconds
    },
    resave: false,
    saveUninitialized: false
};
//if (app.get("env") === "production") {
//    // Serve secure cookies, requires HTTPS
//    session.cookie.secure = true;
//};


///////////////////////////////////////////////////////////////////////////////////
// App Configuration
///////////////////////////////////////////////////////////////////////////////////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  // Sets the EJS engine
app.engine('ejs', ejsMate);
app.use('/switchboard', switchboardRoutes);  // sets the base URL for all "switchboard" routes
app.use('/search', searchRoutes);  // sets the base URL for all "search" routes (e.g., "/sponsorsearch")
app.use('/', rootRoutes);  // sets the base URL for all "site root" routes !!!! MUST BE LISTED LAST AFTER OTHER ROUTES !!!!
app.use(expressSession(session));  // uses the Session environment create above


///////////////////////////////////////////////////////////////////////////////////
// Auth0 Configuration
///////////////////////////////////////////////////////////////////////////////////

// Configuration for the express-openid-connect route
app.use(
    auth({
      issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
      baseURL: process.env.BASE_URL,
      clientID: process.env.AUTH0_CLIENT_ID,
      secret: process.env.SESSION_SECRET,
      authRequired: false,  // set to false by default as some pages are public
      auth0Logout: true
    })
);
//// If a user is logged in, get the account information from the database
//async (req, res) => {
//    console.log(`req.oidc.user.name: ${req.oidc.user.name}`);
//    if ( req.oidc.user.name ) {
//        try {
//            currentUserID = await commonFx.getUserProfile(req.oidc.user.name);
//        } catch(e) {
//            console.log(`Current User ID lookup failed: ${e}`);
//        };
//    };
//};
//console.log(`Current User ID: ${currentUserID}`);


///////////////////////////////////////////////////////////////////////////////////
// For local testing only
///////////////////////////////////////////////////////////////////////////////////
app.listen(port, function(err) {
    console.log(`The server is running on port ${port}`);
    console.log(__dirname);
    console.log(__dirname + '/public');
});
app.use((err, req, res, next) => {
    res.json(err);
});


///////////////////////////////////////////////////////////////////////////////////
// Export to calling routines
///////////////////////////////////////////////////////////////////////////////////
module.exports = app;