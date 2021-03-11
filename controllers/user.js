const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const insightsUsers = require('./insights.users');
const insightsStories = require('./insights.stories');
const insightsMedia = require('./insights.media');
const insightsReels = require('./insights.reels');

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
  insightsUsers.getAllUsersInsights().then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/error', error);
  });
}

exports.getUserLifetimeInsights = (req, res) => {
  insightsUsers.getAllUsersLifetimeInsights().then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/error', error);
  });
}

exports.getUserMedias = (req, res) => {
  insightsMedia.getAllUsersMedia()
  .then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/error', error);
  });
}

exports.getStories = (req, res) => {
  insightsStories.getAllUsersStories()
  .then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/');
  });
}

exports.getReels = (req, res) => {
  insightsReels.getAllUsersReels()
  .then( () => {
    res.redirect('/');
  })
  .catch((error) => {
    req.flash('errors', error);
    return res.redirect('/');
  });
}