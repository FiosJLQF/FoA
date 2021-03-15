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
const { ScholarshipsTable, ScholarshipsActive, ScholarshipsDDL, ScholarshipsAllDDL, ScholarshipsAllDDTest,
        Sponsors, SponsorsDDL, SponsorsAllDDLTest,
        GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
        EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
        FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
        UsersAllDDL, UserPermissionsActive, UserProfiles
    } = require('./models/sequelize.js');
const cors = require('cors');
const switchboardRoutes = require('./routes/switchboard.routes.js');
const searchRoutes = require('./routes/search.routes.js');


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



///////////////////////////////////////////////////////////////////////////////////
// Session Configuration
///////////////////////////////////////////////////////////////////////////////////
const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};
if (app.get("env") === "production") {
    // Serve secure cookies, requires HTTPS
    session.cookie.secure = true;
}


///////////////////////////////////////////////////////////////////////////////////
// App Configuration
///////////////////////////////////////////////////////////////////////////////////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  // Sets the EJS engine
app.engine('ejs', ejsMate);
app.use('/switchboard', switchboardRoutes);  // sets the base URL for all "switchboard" routes
app.use('/search', searchRoutes);  // sets the base URL for all "search" routes (e.g., "/sponsorsearch")
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
      auth0Logout: true,
    })
);


///////////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////
// "GET" Routes (retrieve data)
///////////////////////////////////////////

app.get('/', (req, res) => {
    res.redirect('/search/scholarships');
});

app.get('/error', async (req, res) => {
    return res.render('error');
});

app.get('/portal', async (req, res) => {
    try {
        return res.render('portal', {
            user: req.oidc.user,
            userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
        } )
    } catch(err) {
        console.log('Error:' + err);
    }
});

app.get("/sign-up/:page", (req, res) => {
    const { page } = req.params;
    res.oidc.login({
        returnTo: page,
        authorizationParams: {
            screen_hint: "signup",
        },
    });
});
app.get("/login/:page", (req, res) => {
    const { page } = req.params;
    res.oidc.login({
      returnTo: page,
    });
});
app.get("/logout/:page", (req, res) => {
    const { page } = req.params;
    res.oidc.logout({
      returnTo: page,
    });
});
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
  });

app.get('/scholarshipadd/:id', requiresAuth(), async (req, res) => {
    const sponsorsDDL = await SponsorsAllDDL.findAndCountAll({});
    const scholarshipsAllDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { SponsorID: req.params.id }});
    res.render('scholarshipadd', {
        user: req.oidc.user,
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
        sponsorsDDL,
        scholarshipsAllDDL,
        SponsorID: req.params.id,
        ScholarshipID: ""
     } );
});
app.get('/scholarshipedit/:id', requiresAuth(), async (req, res) => {
    const scholarshipDetails = await ScholarshipsTable.findAll({ where: { ScholarshipID: req.params.id }});
    const sponsorsDDL = await SponsorsAllDDL.findAndCountAll({});
    const scholarshipsAllDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { SponsorID: scholarshipDetails[0].SponsorID }});
    res.render('scholarshipedit', {
        user: req.oidc.user,
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
        sponsorsDDL,
        scholarshipsAllDDL,
        SponsorID: scholarshipDetails[0].SponsorID,
        scholarshipDetails,
        ScholarshipID: req.params.id

// how to pass querystring values into the render ("Scholarship Saved!")?

     } );
});

///////////////////////////////////////////
// "POST" Routes (insert new data)
///////////////////////////////////////////
app.post('/scholarshipadd', async (req, res) => {
    const scholarship = new ScholarshipsTable( {
        ScholarshipName: req.body.ScholarshipName,
        ScholarshipDescription: req.body.ScholarshipDescription,
        ScholarshipLink: req.body.ScholarshipLink
    });
    await scholarship.save();
    res.redirect(`scholarshipedit/${scholarship.ScholarshipID}?mode=newscholarship`);
});

///////////////////////////////////////////
// Invalid Routes
///////////////////////////////////////////
app.get('*', async (req, res) => {
    return res.render('error', {
        userName: '',
        errorCode: 901  // invalid route
    });
});


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