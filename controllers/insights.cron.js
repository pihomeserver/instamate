const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const cron = require('node-cron');
const insightsUsers = require('./insights.users');
const insightsStories = require('./insights.stories');
const insightsMedia = require('./insights.media');
const insightsReels = require('./insights.reels');
const logger = require('../config/logger')

cron.schedule('*/15 * * * *', () => {
  logger.info('CRON - Insights - Updating insights for all users');
  insightsUsers.getAllUsersInsights().then(() => {
    logger.info('CRON - Insights - Success');
  }).catch( (err) => {
    logger.error('CRON - Insights - Error');
    logger.error(err)
  })
});

cron.schedule('*/5 * * * *', () => {
  logger.info('CRON - Media - Updating media for all users');
  insightsMedia.getAllUsersMedia().then(() => {
    logger.info('CRON - Media - Success');
  }).catch( (err) => {
    logger.error('CRON - Media - Error');
    logger.error(err)
  })
});

cron.schedule('*/15 * * * *', () => {
  logger.info('CRON - Stories - Updating stories for all users');
  insightsStories.getAllUsersStories().then(() => {
    logger.info('CRON - Stories - Success');
  }).catch( (err) => {
    logger.error('CRON - Stories - Error');
    logger.error(err)
  })
});

cron.schedule('0 */12 * * *', () => {
  logger.info('CRON - Insights - Updating lifetime insights for all users');
  insightsUsers.getAllUsersLifetimeInsights().then(() => {
    logger.info('CRON - Insights (lifetime) - Success');
  }).catch( (err) => {
    logger.error('CRON - Insights (lifetime) - Error');
    logger.error(err)
  })
});

cron.schedule('*/10 * * * *', () => {
  logger.info('CRON - Insights - Updating reels insights for all users');
  insightsReels.getAllUsersReels().then(() => {
    logger.info('CRON - Insights (reels) - Success');
  }).catch( (err) => {
    logger.error('CRON - Insights (reels) - Error');
    logger.error(err)
  })
});