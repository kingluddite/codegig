const express = require('express');
const router = express.Router();
const db = require('../config/connection');
const App = require('../models/App');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.get('/', (req, res) =>
  App.findAll()
    .then(apps => {
      res.render('apps', {
        apps
      })
    })
    .catch(err => console.log(err))
);

// Show the add app form
router.get('/add', (req, res) => {
  res.render('add');
})

// Add an app
router.post('/add', (req, res) => {

  // pull out the variables for easy access using desctructuring
  let = { title, terms, budget, description, contact_email } = req.body;

  // set up errors array
  let errors = [];

  // Simple Validate Fields
  if(!title) {
   errors.push({ text: 'Please add a title' });
  }
  if(!terms) {
   errors.push({ text: 'Please add a term' });
  }
  if(!description) {
   errors.push({ text: 'Please add a description' });
  }
  if(!contact_email) {
   errors.push({ text: 'Please add a contact email' });
  }

  // Check for errors
  if (errors.length > 0) {
    res.render('add', {
      errors, title, technologies, budget, description, contact_email 
    })
  } else {
    if (!budget) {
      budget = 'Unknown';
    } else {
      budget = `$${budget}`;
    }

    // make lowercase and remove space after comma
    // regEx .replace(/, /g, ',') --> for every space globally replace with a comma
    terms = terms.toLowerCase().replace(/, /g, ',');

    App.create({
      title,
      terms,
      budget,
      description,
      contact_email
    }).then((app) => {
      res.redirect('/apps')
    }).catch((err) => {
        console.log(err)
    })
  }

});

// Search for apps
// note: we are already in the "apps" route by being in the apps file so we just use /search
// note: To use the SQL "like" operator in sequelize you need to use and import the OP object
router.get('/search', (req, res) => {
  let { term } = req.query;

  // Make lowercase for case insensitive search
  term = term.toLowerCase();

  App.findAll({ where: { terms: { [Op.like]: `%${term}%` } } })
    .then(apps => res.render('apps', { apps}))
    .catch(err => console.log(err));
});

module.exports = router;
