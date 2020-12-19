const passport = require('passport');
const refresh = require('passport-oauth2-refresh');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const moment = require('moment');

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

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/')[2];
  if (!req.user.tokens) res.redirect(`/auth/${provider}`);
  const token = req.user.tokens.find((token) => token.kind === provider);
  if (token) {
    // Is there an access token expiration and access token expired?
    // Yes: Is there a refresh token?
    //     Yes: Does it have expiration and if so is it expired?
    //       Yes, Quickbooks - We got nothing, redirect to res.redirect(`/auth/${provider}`);
    //       No, Quickbooks and Google- refresh token and save, and then go to next();
    //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);
    // No: we are good, go to next():
    if (token.accessTokenExpires && moment(token.accessTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
      if (token.refreshToken) {
        if (token.refreshTokenExpires && moment(token.refreshTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
          res.redirect(`/auth/${provider}`);
        } else {
          refresh.requestNewAccessToken(`${provider}`, token.refreshToken, (err, accessToken, refreshToken, params) => {
            User.findById(req.user.id, (err, user) => {
              user.tokens.some((tokenObject) => {
                if (tokenObject.kind === provider) {
                  tokenObject.accessToken = accessToken;
                  if (params.expires_in) tokenObject.accessTokenExpires = moment().add(params.expires_in, 'seconds').format();
                  return true;
                }
                return false;
              });
              req.user = user;
              user.markModified('tokens');
              user.save((err) => {
                if (err) console.log(err);
                next();
              });
            });
          });
        }
      } else {
        res.redirect(`/auth/${provider}`);
      }
    } else {
      next();
    }
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
