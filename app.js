///////////////////////////////////////////////////////////////////////////////////
// Import and require external libraries/files
///////////////////////////////////////////////////////////////////////////////////
const compression = require('compression');
const express = require('express');
//const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const pg = require('pg');
require("dotenv").config();

///////////////////////////////////////////////////////////////////////////////////
// Set up local variables and file locations
///////////////////////////////////////////////////////////////////////////////////
const app = express();
const port = process.env.PORT || 3000;
//const eventRouter = express.Router();
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));  // publicly-accessible files (such as images and css)

// FINISH THIS LATER!
//app.use(bodyParser.urlencoded({extended: false}));


///////////////////////////////////////////////////////////////////////////////////
// App Configuration
///////////////////////////////////////////////////////////////////////////////////
app.set('views', 'views');  // HTML pages and templates, using EJS for templating
app.set('view engine', 'ejs');  // Sets the EJS engine
//app.use('/', routes);  // imports the root folder URL endpoint routes from index.js
app.use('/sponsorsearch', require('./routes/sponsorRoutes'));  // imports the "sponsors" URL endpoint routes from sponsorRoutes.js
app.use('/scholarshipsearch', require('./routes/scholarshipRoutes'));  // imports the "scholarships" URL endpoint routes from scholarshipRoutes.js
app.use('/portal', require('./routes/portalRoutes'));  // imports the "sponsors" URL endpoint routes from sponsorRoutes.js


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
// Auth0 Configuration
///////////////////////////////////////////////////////////////////////////////////
const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const { auth, requiresAuth } = require('express-openid-connect');
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET, // a long, randomly-generated string stored in env
  baseURL: process.env.APP_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_BASE_URL
};
app.use(auth(config)); // auth router attaches /login, /logout, and /callback routes to the baseURL
app.get('/', (req, res) => { // req.isAuthenticated is provided from the auth router
    res.redirect(req.oidc.isAuthenticated() ? '/portal/switchboard' : '/portal');
  });
//var session = require('express-session');
//var sess = {
//    secret: process.env.AUTH0_CLIENT_SECRET,
//    cookie: {},
//    resave: false,
//    saveUninitialized: true
//};
//if (app.get('env') === 'production') {
//    // Use secure cookies in production (requires SSL/TLS)
//    sess.cookie.secure = true;
//    // Uncomment the line below if your application is behind a proxy (like on Heroku)
//    // or if you're encountering the error message:
//    // "Unable to verify authorization request state"
//    // app.set('trust proxy', 1);
//}
//app.use(session(sess));




app.get('/switchboard', requiresAuth(), async (request, response) => {

    try {
        return response.render('switchboard', {
        })
    } catch(err) {
        console.log('Error:' + err);
    }
});





///////////////////////////////////////////////////////////////////////////////////
// For local testing only
///////////////////////////////////////////////////////////////////////////////////
app.listen(port, function(err) {
    console.log(`The server is running on port ${port}`);
    console.log(__dirname);
    console.log(__dirname + '/public');
})
app.use((err, req, res, next) => {
    res.json(err);
});


///////////////////////////////////////////////////////////////////////////////////
// Export to calling routines
///////////////////////////////////////////////////////////////////////////////////
module.exports = app;