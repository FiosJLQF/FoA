///////////////////////////////////////////////////////////////////////////////////
// Import external libraries/files/modules, and config global variables
///////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const compression = require('compression');
const expressSession = require("express-session");
const { auth, requiresAuth } = require('express-openid-connect');
const port = process.env.PORT || 3000;
const { ScholarshipsTable, ScholarshipsActive, ScholarshipsDDL, ScholarshipsAllDDL,
        Sponsors, SponsorsDDL,
        GenderCategoriesDDL, FieldOfStudyCategoriesDDL, CitizenshipCategoriesDDL, YearOfNeedCategoriesDDL,
        EnrollmentStatusCategoriesDDL, MilitaryServiceCategoriesDDL, FAAPilotCertificateCategoriesDDL,
        FAAPilotRatingCategoriesDDL, FAAMechanicCertificateCategoriesDDL, SponsorTypeCategoriesDDL,
        UsersAllDDL, UserPermissionsActive, UserProfiles
    } = require('./models/sequelize.js');
const cors = require('cors');


///////////////////////////////////////////////////////////////////////////////////
// Configure Express
///////////////////////////////////////////////////////////////////////////////////
const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));  // publicly-accessible files (such as images and css)
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(express.urlencoded( { extended: true })); // allows for parsing "body" object
app.use(methodOverride('_method'));
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
//app.use('/sponsorsearch', require('./routes/sponsorRoutes'));  // imports the "sponsors" URL endpoint routes from sponsorRoutes.js
//app.use('/scholarshipsearch', require('./routes/scholarshipRoutes'));  // imports the "scholarships" URL endpoint routes from scholarshipRoutes.js
//app.use('/portal', require('./routes/portalRoutes'));  // imports the "sponsors" URL endpoint routes from sponsorRoutes.js
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
//app.get('/', (req, res) => { // req.isAuthenticated is provided from the auth router
//    // the object "user" will be available on the destination page with user metadata
//    res.redirect(req.oidc.isAuthenticated() ? '/portal/switchboard' : '/portal');
//});


///////////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////
// "GET" Routes (retrieve data)
///////////////////////////////////////////

app.get('/', (req, res) => {
    res.redirect('/scholarshipsearch');
});

app.get('/scholarshipsearch', async (req, res) => {
    const scholarshipsActive = await ScholarshipsActive.findAndCountAll({});
    console.log(scholarshipsActive.count);
    const fieldOfStudyCategoriesDDL = await FieldOfStudyCategoriesDDL.findAndCountAll({});
    const sponsorsDDL = await SponsorsDDL.findAndCountAll({});
    const genderCategoriesDDL = await GenderCategoriesDDL.findAndCountAll({});
    const citizenshipCategoriesDDL = await CitizenshipCategoriesDDL.findAndCountAll({});
    const yearOfNeedCategoriesDDL = await YearOfNeedCategoriesDDL.findAndCountAll({});
    const enrollmentStatusCategoriesDDL = await EnrollmentStatusCategoriesDDL.findAndCountAll({});
    const militaryServiceCategoriesDDL = await MilitaryServiceCategoriesDDL.findAndCountAll({});
    const faaPilotCertificateCategoriesDDL = await FAAPilotCertificateCategoriesDDL.findAndCountAll({});
    const faaPilotRatingCategoriesDDL = await FAAPilotRatingCategoriesDDL.findAndCountAll({});
    const faaMechanicCertificateCategoriesDDL = await FAAMechanicCertificateCategoriesDDL.findAndCountAll({});
    res.render('scholarshipsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
        scholarshipsActive, fieldOfStudyCategoriesDDL, sponsorsDDL, genderCategoriesDDL, citizenshipCategoriesDDL,
        yearOfNeedCategoriesDDL, enrollmentStatusCategoriesDDL, militaryServiceCategoriesDDL, faaPilotCertificateCategoriesDDL,
        faaPilotRatingCategoriesDDL, faaMechanicCertificateCategoriesDDL
    });
});

app.get('/sponsorsearch', async (req, res) => {
    const sponsors = await Sponsors.findAndCountAll({});
//    console.log(sponsors.count);
    const sponsorsDDL = await SponsorsDDL.findAndCountAll({});
    const sponsorTypeCategoriesDDL = await SponsorTypeCategoriesDDL.findAndCountAll({});
    const scholarshipsActive = await ScholarshipsActive.findAndCountAll({});
    console.log(scholarshipsActive.count);
    res.render('sponsorsearch', {
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
        sponsors, sponsorsDDL, sponsorTypeCategoriesDDL, scholarshipsActive });
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

app.get('/switchboard', requiresAuth(), async (req, res) => {
    try {

        // Get the current user's profile
        const userProfiles = await UserProfiles.findAll( { where: { Username: req.oidc.user.email }});

        // Get the list of Permissions for the user
        const userPermissionsActive = await UserPermissionsActive.findAndCountAll( { where: { UserID: userProfiles[0].UserID }});

        // Can the user see the sponsors select object?  If so, load the Sponsors available to the current user.
        const userPermissionsSponsorDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-sponsors');
        let userCanReadSponsors = false;
        let userPermissionsSponsors = [];
        let sponsorsDDL = [];
        if ( userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) {
            userCanReadSponsors = true;
//            console.log('User can read Sponsors DDL');
            userPermissionsSponsors = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'sponsors');
//            console.log(`User has sponsors permissions: ${userPermissionsSponsors.length}`);
            if ( userPermissionsSponsors.length > 0 && userPermissionsSponsors[0].CanRead ) {
                if ( userPermissionsSponsors[0].ObjectValues === '*' ) {
                    sponsorsDDL = await SponsorsDDL.findAndCountAll({});
                } else {
                    sponsorsDDL = await SponsorsDDL.findAndCountAll({ where: { optionid: userPermissionsSponsors[0].ObjectValues } });
                };
            } else {  // The user can see the Sponsors DDL, but has no Sponsors assigned to them - hide the DDL
                userCanReadSponsors = false;
            };
        };
        console.log(`userCanReadSponsors: ${userCanReadSponsors}`);

        // Can the user see the scholarships select object?  If so, load the Scholarships available to the current user.
        let userCanReadScholarships = false;
        let userPermissionsScholarshipDDL = [];
        let scholarshipsDDL = [];
        if (userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) { // Only load scholarships if the user can see Sponsors
            userPermissionsScholarshipDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-scholarships');
            if ( userPermissionsScholarshipDDL.length > 0 && userPermissionsScholarshipDDL[0].CanRead ) {
                userCanReadScholarships = true;
                if ( userPermissionsSponsors.length > 0 ) {  // if a Sponsor permission was listed at all (i.e., what Sponsors can be viewed)
                    if ( userPermissionsSponsors[0].ObjectValues === '*') {  // If the user can see all Sponsors, show all Scholarships
                        scholarshipsDDL = await ScholarshipsDDL.findAndCountAll({});
                    } else {  // Only show scholarships for the allowed sponsors
                        scholarshipsDDL = await ScholarshipsDDL.findAndCountAll({ where: { SponsorID: userPermissionsSponsors[0].ObjectValues } });
                    };
                };
            };
        };
        console.log(`userCanReadScholarships: ${userCanReadScholarships}`);

        // Can the user see the users select object?  If so, load the Users available to the current user
        const userPermissionsUserDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-users');
        let userCanReadUsers = false;
        let usersAllDDL = [];
//        console.log(userPermissionsUserDDL.length);
//        console.log(userPermissionsUserDDL[0].CanRead);
        if ( userPermissionsUserDDL.length > 0 && userPermissionsUserDDL[0].CanRead ) {
            userCanReadUsers = true;
            usersAllDDL = await UsersAllDDL.findAndCountAll({});
            console.log(`usersAllDDL: ${usersAllDDL.length}`);
        };
        console.log(`userCanReadUsers: ${userCanReadUsers}`);

    return res.render('switchboard', {
            user: req.oidc.user,
            userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
            userCanReadSponsors,
            sponsorsDDL,
            userCanReadScholarships,
            scholarshipsDDL,
            SponsorID: '',
            ScholarshipID: '',
            userCanReadUsers,
            usersAllDDL,
            UserID: ''
        })
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
app.get('/sponsordetails/:id', requiresAuth(), async (req, res) => {
    const sponsorsDDL = await SponsorsDDL.findAndCountAll({});
    const scholarshipsAllDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { SponsorID: req.params.id }});
    console.log(scholarshipsAllDDL.count);
    const sponsorDetails = await Sponsors.findAll({ where: { SponsorID: req.params.id }});
    res.render('sponsordetails', {
        user: req.oidc.user,
        userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
        sponsorsDDL,
        scholarshipsAllDDL,
        sponsorDetails,
        SponsorID: req.params.id,
        ScholarshipID: ''
     } );
});
app.get('/scholarshipadd/:id', requiresAuth(), async (req, res) => {
    const sponsorsDDL = await SponsorsDDL.findAndCountAll({});
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
    const sponsorsDDL = await SponsorsDDL.findAndCountAll({});
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
/*
console.log(req.body.ScholarshipName);
    await ScholarshipsTable.create( {
        ScholarshipName: req.body.ScholarshipName,
        ScholarshipDescription: req.body.ScholarshipDescription,
        ScholarshipLink: req.body.ScholarshipLink
    });
    res.redirect(`scholarshipdetails/${scholarship.ScholarshipID}`);
*/
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