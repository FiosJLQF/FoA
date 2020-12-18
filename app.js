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
//const Auth0Strategy = require("passport-auth0");
const expressSession = require("express-session");
//const passport = require("passport");
//const authRouter = require("./routes/auth");  // routes used by Auth0 services
const { auth, requiresAuth } = require('express-openid-connect');

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
// Passport Configuration
///////////////////////////////////////////////////////////////////////////////////

//const strategy = new Auth0Strategy(
//    {
//      domain: process.env.AUTH0_DOMAIN,
//      clientID: process.env.AUTH0_CLIENT_ID,
//      clientSecret: process.env.AUTH0_CLIENT_SECRET,
//      callbackURL: process.env.AUTH0_CALLBACK_URL
//    },
//    function(accessToken, refreshToken, extraParams, profile, done) {
//      /**
//       * Access tokens are used to authorize users to an API
//       * (resource server)
//       * accessToken is the token to call the Auth0 API or a secured third-party API
//       * extraParams.id_token has the JSON Web Token
//       * profile has all the information from the user
//       */
//      return done(null, profile);
//    }
//);


///////////////////////////////////////////////////////////////////////////////////
// App Configuration
///////////////////////////////////////////////////////////////////////////////////
app.set('views', 'views');  // HTML pages and templates, using EJS for templating
app.set('view engine', 'ejs');  // Sets the EJS engine
//app.use('/', routes);  // imports the root folder URL endpoint routes from index.js
app.use('/sponsorsearch', require('./routes/sponsorRoutes'));  // imports the "sponsors" URL endpoint routes from sponsorRoutes.js
app.use('/scholarshipsearch', require('./routes/scholarshipRoutes'));  // imports the "scholarships" URL endpoint routes from scholarshipRoutes.js
app.use('/portal', require('./routes/portalRoutes'));  // imports the "sponsors" URL endpoint routes from sponsorRoutes.js
app.use(expressSession(session));  // uses the Session environment create above
//passport.use(strategy);
//app.use(passport.initialize());
//app.use(passport.session());
//passport.serializeUser((user, done) => {
//    done(null, user);
//});
//passport.deserializeUser((user, done) => {
//    done(null, user);
//});
// Creating custom middleware with Express
//app.use((req, res, next) => {
//    res.locals.isAuthenticated = req.isAuthenticated();
//    next();
//});
//app.use("/", authRouter);
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
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.oidc.isAuthenticated();
    next();
});


///////////////////////////////////////////////////////////////////////////////////
// Auth0 Configuration
///////////////////////////////////////////////////////////////////////////////////
/*
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET, // a long, randomly-generated string stored in env
  baseURL: process.env.APP_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_BASE_URL
};
app.use(auth(config)); // auth router attaches /login, /logout, and /callback routes to the baseURL
app.get('/', (req, res) => { // req.isAuthenticated is provided from the auth router
    res.redirect(req.oidc.isAuthenticated() ? '/portal/switchboard' : '/portal');
  });
*/


///////////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////////
app.get('/switchboard', async (req, res) => {
    try {
        return res.render('switchboard', {
            user: req.oidc.user,
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
//app.get("/profile", (req, res) => {
//    res.render("profile", {
//      user: req.oidc.user,
//    });
//});
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
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