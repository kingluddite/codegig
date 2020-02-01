// This may be confusing but Sequelize (capital) references the standard library
const Sequelize = require('sequelize');
// sequelize (lowercase) references our connection to the Database
const sequelize = require('../config/connection');

// Creates an "App" model that matches up with our Database
const App = sequelize.define('app', {
  title: {
    type: Sequelize.STRING,
  },
  author: {
    type: Sequelize.STRING,
  },
  terms: {
    type: Sequelize.STRING,
  },
  budget: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  contact_email: {
    type: Sequelize.STRING,
  },
  created_at: Sequelize.DATE,
});

// Syncs with Database
// App.sync() will create all of the tables in the specified database
//  If you pass {force: true} as a parameter to sync method, it will remove tables on every startup and create new ones. (Needless to say, this is a viable option only for development)
App.sync({ force: true });

// Makes the App Model available for other files (will also create a table)
module.exports = App;
