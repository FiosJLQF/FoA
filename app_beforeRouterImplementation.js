///////////////////////////////////////////////////////////////////////////////////
// Import external libraries/files/modules, and config global variables
///////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require("dotenv").config();  // load all ".env" variables into "process.env" for use
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');  // allows use of EJS templates to compartmentalize code
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
const switchboardRoutes = require('./routes/switchboard.routes.js');


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
app.use('/switchboard', switchboardRoutes);  // sets the base URL for all "switchboard" routes
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
    res.redirect('/scholarshipsearch');
});

app.get('/error', async (req, res) => {
    return res.render('error');
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

// app.get('/switchboard_newuser', async (req, res) => {
//     try {
//         return res.render('switchboard_newuser', {
//             user: req.oidc.user,
//             userName: ( req.oidc.user == null ? '' : req.oidc.user.name )
//         } )
//     } catch(err) {
//         console.log('Error:' + err);
//     }
// });

// app.get('/switchboard', requiresAuth(), async (req, res) => {
//     try {
//         let errorCode = 0;

//         // Get the current user's profile
//         const userProfiles = await UserProfiles.findAll( { where: { Username: req.oidc.user.email }});
//         if ( userProfiles.length === 0 ) {
//             res.redirect(`/switchboard_newuser`);
//         };

//         // Get the list of active permissions for the user
//         const userPermissionsActive = await UserPermissionsActive.findAndCountAll( { where: { UserID: userProfiles[0].UserID }});

//         ////////////////////////////////////////////////////
//         //  Sponsors Information (DDL, Add Sponsor, Default Sponsor, etc.)
//         ////////////////////////////////////////////////////

//         // Can the user see the sponsors select object?  If so, load the Sponsors available to the current user.
//         const userPermissionsSponsorDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-sponsors');
//         let userCanReadSponsors = false;
//         let userPermissionsSponsors = [];
//         let sponsorsDDL = [];
//         let sponsorID = '';
//         if ( userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) {
//             userCanReadSponsors = true;
//             userPermissionsSponsors = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'sponsors');
//             if ( userPermissionsSponsors.length > 0 && userPermissionsSponsors[0].CanRead ) {
//                 if ( userPermissionsSponsors[0].ObjectValues === '*' ) {
//                     sponsorsDDL = await SponsorsDDL.findAndCountAll({});
//                 } else {
//                     sponsorsDDL = await SponsorsDDL.findAndCountAll({ where: { optionid: userPermissionsSponsors[0].ObjectValues } });
//                     sponsorID = userPermissionsSponsors[0].ObjectValues; // Set the Sponsor ID to the only one Sponsor the User has permission to see
//                 };
//             } else {  // The user can see the Sponsors DDL, but has no Sponsors assigned to them - hide the DDL
//                 userCanReadSponsors = false;
//             };
//         };
//         console.log(`userCanReadSponsors: ${userCanReadSponsors}`);

//         // If a SponsorID was provided in the querystring, or the User only has access to one Sponsor, find the Sponsor's details
//         let sponsorDetails = [];
//         let userCanReadSponsor = false;
//         let userCanUpdateSponsor = false;
//         let userCanDeleteSponsor = false;
//         if ( req.query['sponsorid'] ) {  // If a Sponsor ID was provided in the query string, use that value
//             sponsorID = req.query['sponsorid'];
//         };
//         if ( sponsorID !== '' ) {
//             console.log(`Sponsor ID: ${sponsorID}`);
//             console.log(`User's Sponsor List: ${userPermissionsSponsors[0].ObjectValues}`);
//             // Does the User have permission to see/edit/delete this Sponsor?
//             if ( sponsorID === userPermissionsSponsors[0].ObjectValues || userPermissionsSponsors[0].ObjectValues === '*' ) {
//                 console.log(`User can read Sponsor ${sponsorID}`);
//                 // Retrieve the Sponsor's details from the database (i.e., does the Sponsor exist?)
//                 sponsorDetails = await Sponsors.findAll({ where: { SponsorID: sponsorID }});
//                 userCanReadSponsor = userPermissionsSponsors[0].CanRead;
//                 userCanUpdateSponsor = userPermissionsSponsors[0].CanUpdate;
//                 userCanDeleteSponsor = userPermissionsSponsors[0].CanDelete;
//             } else {  // User *CANNOT* read Sponsor's data - trap and log error
//                 errorCode = 909; // Invalid Permissions for Sponsor
//             };
//         };

//         // Can the user create new sponsors?
//         let userCanCreateSponsors = false;
//         if ( userCanReadSponsors && userPermissionsSponsorDDL[0].CanCreate ) {
//             userCanCreateSponsors = true;
//         };

//         ////////////////////////////////////////////////////
//         //  Scholarships Information (DDL, Add Scholarship, etc.)
//         ////////////////////////////////////////////////////

//         // Can the user see the scholarships select object?  If so, load the Scholarships available to the current user.
//         let userCanReadScholarships = false;
//         let userPermissionsScholarshipDDL = [];
//         let scholarshipsDDL = [];
//         if (userPermissionsSponsorDDL.length > 0 && userPermissionsSponsorDDL[0].CanRead ) { // Only load scholarships if the user can see Sponsors
//             userPermissionsScholarshipDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-scholarships');
//             if ( userPermissionsScholarshipDDL.length > 0 && userPermissionsScholarshipDDL[0].CanRead ) {  // If the User can see the Scholarships DDL, show it
//                 userCanReadScholarships = true;
//                 console.log(`sponsorID for scholarships DDL: ${sponsorID}`);
//                 if ( sponsorID !== '' ) {  // If a single Sponsor ID is assigned, load the Scholarships for that Sponsor
//                     scholarshipsDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { SponsorID: sponsorID } });
//                 } else {  // Load a blank row of data
//                     scholarshipsDDL = await ScholarshipsAllDDL.findAndCountAll({ where: { SponsorID: -1 } });
//                 };
//             };
//         };
//         console.log(`userCanReadScholarships: ${userCanReadScholarships}`);
//         console.log(`active scholarships for the Sponsor: ${scholarshipsDDL.count}`);

//         // Can the user create new scholarships?
//         let userCanCreateScholarships = false;
//         if ( userCanReadScholarships && userPermissionsScholarshipDDL[0].CanCreate ) {
//             userCanCreateScholarships = true;
//         };

//         ////////////////////////////////////////////////////
//         //  Users Information (DDL, Add User, etc.)
//         ////////////////////////////////////////////////////

//         // Can the user see the users select object?  If so, load the Users available to the current user
//         const userPermissionsUserDDL = userPermissionsActive.rows.filter( permission => permission.ObjectName === 'switchboard-users');
//         let userCanReadUsers = false;
//         let usersAllDDL = [];
//         if ( userPermissionsUserDDL.length > 0 && userPermissionsUserDDL[0].CanRead ) {
//             userCanReadUsers = true;
//             usersAllDDL = await UsersAllDDL.findAndCountAll({});
//             console.log(`usersAllDDL: ${usersAllDDL.count}`);
//         };
//         console.log(`userCanReadUsers: ${userCanReadUsers}`);

//         // Can the user create new users?
//         let userCanCreateUsers = false;
//         if ( userCanReadUsers && userPermissionsUserDDL[0].CanCreate ) {
//             userCanCreateUsers = true;
//         };

//         // If a ScholarshipID was provided in the querystring, find the Scholarship's details
//         let scholarshipDetails = [];
//         let scholarshipID = '';
//         if ( req.query['scholarshipid'] ) {
//             scholarshipID = req.query['scholarshipid'];
// //            scholarshipDetails = await ScholarshipsTable.findAll({ where: { ScholarshipID: scholarshipID }});
//         };

//         // Render the page
//         return res.render('switchboard', {
//             // Admin data
//             errorCode,
//             // User data
//             user: req.oidc.user,
//             userName: ( req.oidc.user == null ? '' : req.oidc.user.name ),
//             // Main Menu Data
//             userCanReadSponsors,
//             sponsorsDDL,
//             userCanCreateSponsors,
//             userCanReadScholarships,
//             scholarshipsDDL,
//             userCanCreateScholarships,
//             userCanReadUsers,
//             usersAllDDL,
//             userCanCreateUsers,
//             userID: '',
//             // Sponsor Details data
//             sponsorID,
//             sponsorDetails,
//             // Scholarship Details data
//             scholarshipID,
//         })
//     } catch(err) {
//         console.log('Error:' + err);
//     }
// });

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