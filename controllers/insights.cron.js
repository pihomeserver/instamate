const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const cron = require('node-cron');
const insightsUsers = require('./insights.users');
const insightsStories = require('./insights.stories');
const insightsMedia = require('./insights.media');
const insightsReels = require('./insights.reels');
const logger = require('../config/logger')
const chalk = require('chalk');

const cron_processes = {
  insights: {
    label: 'user insights',
    promise: insightsUsers.getAllUsersInsights,
    enabled : process.env.CRON_INSIGHTS_ENABLED,
    sequence : process.env.CRON_INSIGHTS_SEQUENCE,
    errorTimer : process.env.CRON_INSIGHTS_ERROR_TIMER,
    errorTimerDefault : 2
  },
  media: {
    label: 'media',
    promise: insightsMedia.getAllUsersMedia,
    enabled : process.env.CRON_MEDIA_ENABLED,
    sequence : process.env.CRON_MEDIA_SEQUENCE,
    errorTimer : process.env.CRON_MEDIA_ERROR_TIMER,
    errorTimerDefault : 1
  },
  reels: {
    label: 'reels',
    promise: insightsReels.getAllUsersReels,
    enabled : process.env.CRON_REELS_ENABLED,
    sequence : process.env.CRON_REELS_SEQUENCE,
    errorTimer : process.env.CRON_REELS_ERROR_TIMER,
    errorTimerDefault : 6
  },
  lifetime: {
    label: 'lifetime',
    promise: insightsUsers.getAllUsersLifetimeInsights,
    enabled : process.env.CRON_LIFETIME_ENABLED,
    sequence : process.env.CRON_LIFETIME_SEQUENCE,
    errorTimer : process.env.CRON_LIFETIME_ERROR_TIMER,
    errorTimerDefault : 1
  },
  stories: {
    label: 'stories',
    promise: insightsStories.getAllUsersStories,
    enabled : process.env.CRON_STORIES_ENABLED,
    sequence : process.env.CRON_STORIES_SEQUENCE,
    errorTimer : process.env.CRON_STORIES_ERROR_TIMER,
    errorTimerDefault : 1
  }
}

for (cronJobEntry in cron_processes) {
  let cronJob = cron_processes[cronJobEntry]
  if (cronJob.enabled === '1') {
    if (!cron.validate(cronJob.sequence)) {
      logger.info(`${chalk.red('×')} CRON - Insights (${cronJob.label}) - Invalid sequence ${cronJob.sequence}`);
    } else {
      logger.info(`${chalk.green('✓')} CRON - Insights (${cronJob.label}) - Enabled with sequence ${cronJob.sequence}`);
      const cron_insight_error_disable = cronJob.errorTimer || cronJob.errorTimerDefault
      let cron_insights_errors = 0
      cron.schedule(cronJob.sequence, () => {
        function shouldExecute() {
          if (cron_insights_errors > 0) {
            cron_insights_errors--;
            logger.info(`${chalk.yellow('⚠')} CRON - Insights (${cronJob.label}) - Execution delayed (${cron_insights_errors} left)`);
            return false;
          }
          cron_insights_errors = 0
          return true;
        }
        if (shouldExecute()) {
          logger.info(`CRON - Insights - Updating insights for ${cronJob.label}`);
          cronJob.promise().then(() => {
            logger.info(`CRON - Insights (${cronJob.label}) - Success`);
          }).catch( (err) => {
            cron_insights_errors = cron_insight_error_disable
            logger.error(`CRON - Insights (${cronJob.label}) - Error. Will be delayed ${cron_insights_errors} times`);
            logger.error(err)
          })
        }
      });
    }
  } else {
    logger.info(`${chalk.red('×')} CRON - Insights (${cronJob.label}) - Disabled`);
  }
}