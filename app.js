// Import and require external libraries/files
const compression = require('compression');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
//const eventRouter = express.Router();

// Set up local variables and file locations
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));  // publicly-accessible files (such as images and css)

// FINISH THIS LATER!
//app.use(bodyParser.urlencoded({extended: false}));

// A2 Config
//app.use(express.static('/test/public'));  // publicly-accessible files (such as images and css)

app.engine('handlebars', exphbs());
app.set('views', 'views');  // HTML pages and templates, using EJS for templating
app.set('view engine', 'ejs');  // Sets the EJS engine

// A2 Config
//app.use('/test', routes);  // imports the URL endpoint routes from index.js

app.use('/', routes);  // imports the URL endpoint routes from index.js

// For local testing only
const port = process.env.PORT || 3000;
app.listen(port, function(err) {
    console.log(`The server is running on port ${port}`);
    console.log(__dirname);
    console.log(__dirname + '/public');
})

app.use((err, req, res, next) => {
    res.json(err);
});

module.exports = app;