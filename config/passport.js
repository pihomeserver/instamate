const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const db = require('../config/database');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.User.findByPk(id).then((user) => {
    done(null, user);
  }).catch((err) => {
    done(null, false);
  });
});

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APPLICATIONID,
  clientSecret: process.env.FACEBOOK_APPLICATIONSECRET,
  callbackURL: `${process.env.FACEBOOK_CALLBACK_URL}`,
  profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  db.User.findOrCreate({ where: { id: profile.id }}).then((currentUser, created) => {
    db.User.update({
      token : accessToken,
      email : profile.emails[0].value || null,
      firstName : profile.name.givenName || null,
      lastName : profile.name.familyName || null,
    }, { where: { id: profile.id }, returning: true}).then((user) => {
      if (user[0] !== 1 || user[1].length !== 1) {
        throw new Error(`Update error for id ${profile.id}`)
      }
      req.flash('info', { msg: 'Facebook account has been linked.' });
      done(null, user[1][0]);
    }).catch((err) => {
      req.flash('errors', { msg: 'Failed to save the user.' });
      done(err);
    })
  }).catch((err) => {
    req.flash('errors', { msg: 'Failed to create the user.' });
    done(err);
  })
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};