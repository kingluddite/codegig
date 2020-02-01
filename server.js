// grab the environment variables as early as possible
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const okta = require('@okta/okta-sdk-nodejs');
const session = require('express-session');
const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;

// put routes in variables for easier use
const appsRouter = require('./routes/apps');
const usersRouter = require('./routes/users');

// Sets up the Express App
const app = express();
const PORT = process.env.PORT || 5000;

// set up the okta client
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
// Views in Express.js are the equivalent of HTML templates—they’re the place you store front-end code and logic. The views you’ll use in this project will use the Handlebars templating language which is one of the most popular.
// This is a base “layout” template named "main" that all other templates will inherit from. It defines common HTML, includes the Bootstrap CSS library, and also defines a simple navigation menu.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Middleware
app.use(logger('dev'));

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const oidc = new ExpressOIDC({
  issuer: `${process.env.OKTA_URL}/oauth2/default`,
  client_id: `${OKTA_CLIENT_ID}`,
  client_secret: `${OKTA_CLIENT_SECRET}`,
  redirect_uri: `http://localhost:${PORT}/users/callback`,
  scope: 'openid profile',
  routes: {
    login: {
      path: '/users/login',
    },
    callback: {
      path: '/users/callback',
      defaultRedirect: '/dashboard',
    },
  },
});

// Session
app.use(
  session({
    // makes it impossible for bad peeps to tamper with cookies
    secret: `${process.env.SESSION_SECRET}`,
    resave: true,
    saveUnitialized: false,
  })
);

// The oidc.router middleware uses the settings you defined when creating ExpressOIDC to create routes for handling user authentication. Whenever a user visits /users/login, for instance, they’ll be taken to a login page. This line of code is what makes that possible.
app.use(oidc.router);

// custom middleware
// This middleware creates a req.user object that you will be able to use later on to more easily access a currently logged in user’s personal information.
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  client.getUser(req.userinfo.sub).then(user => {
    req.user = user;
    res.locals.user = user;
    next();
  });
});

// Routes
// The route code tells Express.js what code to run when a user visits a particular URL
// This code tells Express.js that in our app and user route files there are functions that should be executed when certain URLs are hit
// If a user visits a URL starting with /users, Express.js will look for other matching URLs in the user routes file. If a user visits any URLs starting with the / URL, Express.js will look in the blog routes file to see what to do.
app.get('/', (req, res) => res.render('index', { layout: 'landing' }));
app.use('/apps', appsRouter);
app.use('/users', usersRouter);

// Error handlers
// These middlewares will run if any 4XX or 5XX type errors occur. In both cases, they will render a simple web page to the user showing them the error.
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));
