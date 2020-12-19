const db = require('../config/database');
const { QueryTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  // Get pages
  db.Page.findAll({}).then((results) => {
    let promisesInfoIG = []
    for (result of results) {
      promisesInfoIG.push(db.sequelize.query(
        'SELECT "UserProfiles".name, "UserProfiles".biography, "UserProfiles".profile_picture_url, "UserInsights".insight_date, "UserInsights".media_count, "UserInsights".followers_count, "UserInsights".follows_count \
        FROM "UserProfiles", "UserInsights" \
        WHERE "UserProfiles".instagram_business_account = :instagram_business_account \
        AND "UserInsights".id = ( \
          SELECT "UserInsights".id \
          FROM "UserInsights" \
          WHERE "UserInsights".instagram_business_account = :instagram_business_account \
          ORDER BY "UserInsights".insight_date DESC \
          LIMIT 1) \
        ORDER BY "UserProfiles".profile_date DESC \
        LIMIT 1',
        {
          replacements: { instagram_business_account: result.instagram_business_account },
          type: QueryTypes.SELECT
        }
      ))
    }
    return Promise.all(promisesInfoIG)
  })
  .then( (results) => {
    res.render('home', {
      title: 'Home',
      accounts: results[0] || []
    });
  })
  .catch((err) => {
    console.log(err)
  })
};

/**
 * GET /error
 * Error page.
 */
exports.error = (req, res) => {
  res.render('error', {
    title : 'Error',
    error : req.error
  });
};