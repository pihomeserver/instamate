const db = require('../config/database');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const insightsController = require('./insights');

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};

exports.getUserInsights = (req, res) => {
  insightsController.getAllUsersInsights().then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/error', error);
  });
}

exports.getUserLifetimeInsights = (req, res) => {
  insightsController.getAllUsersLifetimeInsights().then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/error', error);
  });
}

exports.getUserMedias = (req, res) => {
  insightsController.getAllUsersMedia()
  .then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/error', error);
  });
}

exports.getStories = (req, res) => {
  insightsController.getAllUsersStories()
  .then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    // return res.redirect('/error', error);
    return res.redirect('/');
  });
}