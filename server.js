const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const okta = require('@okta/okta-sdk-nodejs');
const session = require('express-session');
const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;

// put routes in variables for easier use
const appRouter = require('./routes/apps');
const usersRouter = require('./routes/apps');

// Sets up the Express App
const app = express();
const PORT = process.env.PORT || 5000;
const client = new okta.Client({
  orgUrl: process.env.ORG_URL,
  token: process.env.OKTA_TOKEN,
});

// Database
const db = require('./app/config/connection');

// Test db connection
db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.log('Unable to connect to the Database');
  });

// Adding Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set 'public' as static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Index route
app.get('/', (req, res) => res.render('index', { layout: 'landing' }));

// App routes
app.use('/apps', require('./app/routes/apps'));

app.listen(PORT, console.log(`Server started on port ${PORT}`));
