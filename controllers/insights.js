const db = require('../config/database');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const cron = require('node-cron');
const insights = require('./insights');
const _ = require('lodash')
const logger = require('../config/logger')

cron.schedule('*/15 * * * *', () => {
  logger.info('CRON - Insights - Updating insights for all users');
  insights.getAllUsersInsights().then(() => {
    logger.info('CRON - Insights - Success');
  }).catch( (err) => {
    logger.error('CRON - Insights - Error');
    logger.error(err)
  })
});

cron.schedule('*/5 * * * *', () => {
  logger.info('CRON - Media - Updating media for all users');
  insights.getAllUsersMedia().then(() => {
    logger.info('CRON - Media - Success');
  }).catch( (err) => {
    logger.error('CRON - Media - Error');
    logger.error(err)
  })
});

cron.schedule('*/15 * * * *', () => {
  logger.info('CRON - Stories - Updating stories for all users');
  insights.getAllUsersStories().then(() => {
    logger.info('CRON - Stories - Success');
  }).catch( (err) => {
    logger.error('CRON - Stories - Error');
    logger.error(err)
  })
});

cron.schedule('0 */8 * * *', () => {
  logger.info('CRON - Insights - Updating lifetime insights for all users');
  insights.getAllUsersLifetimeInsights().then(() => {
    logger.info('CRON - Insights (lifetime) - Success');
  }).catch( (err) => {
    logger.error('CRON - Insights (lifetime) - Error');
    logger.error(err)
  })
});

/**
 * Get insights for all users with a token
 */
exports.getAllUsersInsights = () => {
  return db.User.findAll().then( (users) => {
    let promisesInsights = []
    for( let user of users) {
      promisesInsights.push(insights.getUserInsights(user))
    }
    return Promise.all(promisesInsights)
  })
}

/**
 * Analyse current logged user to extract Instagram information
 */
exports.getUserInsights = (user) => {
  let actions = []
  actions.push(initUserData(user))
  actions.push(updateUserProfile(user))
  actions.push(updateUserInsights(user))
  actions.push(updateUserDetailedInsights(user))
  return Promise.all(actions)
};

function initUserData(user) {
  return axios.get(`${process.env.FACEBOOK_API_URL}/${user.id}/accounts?fields=id,category,name,instagram_business_account&access_token=${user.token}`)
    .then( response => {
      let promisesPagesCreation = []
      for (let account of response.data.data) {
        promisesPagesCreation.push(db.Page.upsert({
          id: account.id,
          category: account.category,
          name: account.name,
          instagram_business_account: account.instagram_business_account.id,
          facebookId: user.id
        }))
      }
      return Promise.all(promisesPagesCreation)
    })
}

function updateUserProfile(user) {
  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesInfoIG = []
      for (let igID of igIDs) {
        promisesInfoIG.push(axios.get(`${process.env.FACEBOOK_API_URL}/${igID.instagram_business_account}?fields=biography,profile_picture_url,name&access_token=${user.token}`))
      }
      return Promise.all(promisesInfoIG)
    })
    .then( (profiles) => {
      // Update user profile
      let userDataCreation = [];
      for (let profile of profiles) {
        userDataCreation.push(db.UserProfile.findOrCreate({ where: { instagram_business_account: profile.data.id }})
          .then( (userProfile) => {
            return userProfile[0].update({
              biography: profile.data.biography,
              name: profile.data.name,
              profile_picture_url: profile.data.profile_picture_url
            })
          })
        )
      }
      return Promise.all(userDataCreation);
    })
}

function updateUserInsights(user) {
  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesInfoIG = []
      for (let igID of igIDs) {
        promisesInfoIG.push(axios.get(`${process.env.FACEBOOK_API_URL}/${igID.instagram_business_account}?fields=media_count,followers_count,follows_count&access_token=${user.token}`))
      }
      return Promise.all(promisesInfoIG)
    })
    .then( (profiles) => {
      // Update user profile
      let userDataCreation = [];
      for (let profile of profiles) {
        userDataCreation.push(db.Media.findAll({
            attributes: [
              [db.sequelize.fn('sum', db.sequelize.col('like_count')), 'total_likes'],
              [db.sequelize.fn('sum', db.sequelize.col('comments_count')), 'total_comments']
            ],
            where: { instagram_business_account: profile.data.id }
          }).then( (totalMediaLikesComments) => {
            return db.UserInsight.findOne({
                attributes: ['media_count', 'followers_count', 'follows_count', ['instagram_business_account', 'id'], 'likes_count', 'comments_count'],
                where: { instagram_business_account: profile.data.id },
                order: [ [ 'insight_date', 'DESC' ]]
              }).then( (userInsight) => {
                profile.data.likes_count = parseInt(totalMediaLikesComments[0].dataValues.total_likes)
                profile.data.comments_count = parseInt(totalMediaLikesComments[0].dataValues.total_comments)
                if (!_.isEqual(profile.data, userInsight.dataValues)) return db.UserInsight.create({
                  instagram_business_account: profile.data.id,
                  media_count: profile.data.media_count,
                  followers_count: profile.data.followers_count,
                  follows_count: profile.data.follows_count,
                  likes_count: totalMediaLikesComments[0].dataValues.total_likes,
                  comments_count: totalMediaLikesComments[0].dataValues.total_comments
                })
                return null
              })
          })
        )
      }
      return Promise.all(userDataCreation);
    })
}

function updateUserDetailedInsights(user) {
  let todayDate = new Date()
  const offset = todayDate.getTimezoneOffset();
  todayDate = new Date(todayDate.getTime() + (offset*60*1000));
  const today = todayDate.toISOString().split('T')[0]+"T08:00:00+0000"
  todayDate.setDate(todayDate.getDate() - 1)
  const yesterday = todayDate.toISOString().split('T')[0]+"T08:00:00+0000"
  // Due to day switch and missing current day
  todayDate.setDate(todayDate.getDate() - 1)
  const beforeYesterday = todayDate.toISOString().split('T')[0]+"T08:00:00+0000"

  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (pages) => {
      let promisesInfoIG = []
      for (let page of pages) {
        promisesInfoIG.push(axios.get(`${process.env.FACEBOOK_API_URL}/${page.instagram_business_account}/insights?period=day&metric=email_contacts,follower_count,get_directions_clicks,impressions,phone_call_clicks,profile_views,reach,text_message_clicks,website_clicks&access_token=${user.token}`))
      }
      return Promise.all(promisesInfoIG)
    })
    .then( (profiles) => {
      // Each profile
      let userDataCreation = [];
      for (let profile of profiles) {
        // Update user profile
        let updatedData = []
        updatedData[beforeYesterday] = {}
        updatedData[yesterday] = {}
        updatedData[today] = {}
        let igID = 0
        for (let field of profile.data.data) {
          // All dates
          for (let insightDate of field.values) {
            updatedData[insightDate.end_time][field.name] = insightDate.value
            igID = field.id.split('/')[0]
          }
        }
        // Update or create the insight for today and yesterday
        for (let insightDate in updatedData) {
          if (Object.keys(updatedData[insightDate]).length > 0) userDataCreation.push(db.UserDetailedInsight.findOrCreate({ where: { instagram_business_account: igID, insight_date: insightDate }})
            .then( (insight) => {
              return insight[0].update(updatedData[insightDate])
            })
          )
        }
      }
      return Promise.all(userDataCreation);
    })
}

/**
 * Get lifetime insights for all users with a token
 */
exports.getAllUsersLifetimeInsights = () => {
  return db.User.findAll().then( (users) => {
    let promisesInsights = []
    for( let user of users) {
      promisesInsights.push(insights.getUserLifetimeInsights(user))
    }
    return Promise.all(promisesInsights)
  })
}

exports.getUserLifetimeInsights = (user) => {
  let actions = []
  actions.push(getUserAudienceInsights(user))
  return Promise.all(actions)
};

function getUserAudienceInsights(user) {
  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesLifetimeInsights = []
      for (let igID of igIDs) {
        promisesLifetimeInsights.push(axios.get(`${process.env.FACEBOOK_API_URL}/${igID.instagram_business_account}/insights?metric=audience_gender_age,audience_country,audience_city,audience_locale&period=lifetime&access_token=${user.token}`))
      }
      return Promise.all(promisesLifetimeInsights)
    })
    .then( (lifetimeInsights) => {
      let insightsUpdates = []
      for (let lifetimeInsightsUser of lifetimeInsights) {
        for (let insightUser of lifetimeInsightsUser.data.data) {
          const igID = insightUser.id.split('/')[0]
          const insightDate = insightUser.values[0].end_time
          const insightType = insightUser.name
          for (let keyCode in insightUser.values[0].value) {
            insightsUpdates.push(db.UserLifetimeInsight.upsert({
              instagram_business_account: igID,
              insight_date: insightDate,
              insight_type: insightType,
              key: keyCode,
              value: insightUser.values[0].value[keyCode]
            }))
          }
        }
      }
      return Promise.all(insightsUpdates)
    })
}

/**
 * Get stories for all users with a token
 */
exports.getAllUsersStories = () => {
  return db.User.findAll().then( (users) => {
    let promisesStoriesInsights = []
    for( let user of users) {
      promisesStoriesInsights.push(insights.getUserStories(user))
    }
    return Promise.all(promisesStoriesInsights)
  })
}

exports.getUserStories = (user) => {
  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesAllStories = []
      for (let igID of igIDs) {
        promisesAllStories.push(axios.get(`${process.env.FACEBOOK_API_URL}/${igID.instagram_business_account}/stories?access_token=${user.token}`))
      }
      return Promise.all(promisesAllStories)
    })
    .then( (storiesPerUser) => {
      let storiesDataRequests = []
      for (let userStorries of storiesPerUser) {
        for (let storie of userStorries.data.data) {
          storiesDataRequests.push(axios.get(`${process.env.FACEBOOK_API_URL}/${storie.id}?fields=caption,ig_id,media_type,media_url,owner,permalink,shortcode,thumbnail_url,timestamp,username&access_token=${user.token}`))
        }
      }
      return Promise.all(storiesDataRequests)
    })
    .then( (storiesData) => {
      let storiesUpdate = []
      for (let storyData of storiesData) {
        let story = storyData.data
        storiesUpdate.push(db.Story.findOrCreate({ where: { media_id: story.id }})
          .then( (storyCreated) => {
            return storyCreated[0].update({
              instagram_business_account: story.owner.id,
              caption: story.caption,
              media_type: story.media_type,
              media_url: story.media_url,
              permalink: story.permalink,
              shortcode: story.shortcode,
              timestamp: story.timestamp,
              username: story.username,
              thumbnail_url: story.thumbnail_url
            }, {returning: true})
          })
          .then( (updatedStory) => {
            return getStoryInsights(user, updatedStory)
          })
        )
      }
    })
}

function getStoryInsights(user, updatedStory) {
  let request = `${process.env.FACEBOOK_API_URL}/${updatedStory.media_id}/insights?metric=exits,impressions,reach,replies,taps_forward,taps_back&access_token=${user.token}`
  return axios.get(request).then( (insights) => {
    if (!insights.data || !insights.data.data) {
      return null
    }
    return db.StoryInsight.create({
      media_id: updatedStory.media_id,
      exits: insights.data.data[0] ? insights.data.data[0].values[0].value : 0,
      impressions: insights.data.data[1] ? insights.data.data[1].values[0].value : 0,
      reach: insights.data.data[2] ? insights.data.data[2].values[0].value : 0,
      replies: insights.data.data[3] ? insights.data.data[3].values[0].value : 0,
      taps_forward: insights.data.data[4] ? insights.data.data[4].values[0].value : 0,
      taps_back: insights.data.data[5] ? insights.data.data[5].values[0].value : 0
    })
  })
  .catch( err => {
    if (err.response && err.response.status === 400 && err.response.data.error.code === 10) {
      logger.error('Not enought story views to collect insights')
      logger.error(err.response.data.error.message)
    }
  })
}

/**
 * Get insights for all users with a token
 */
exports.getAllUsersMedia = () => {
  return db.User.findAll().then( (users) => {
    let promisesInsights = []
    for( let user of users) {
      promisesInsights.push(insights.getUserMedia(user))
    }
    return Promise.all(promisesInsights)
  })
}

exports.getUserMedia = (user) => {
  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesAllMedia = []
      for (let igID of igIDs) {
        promisesAllMedia.push(axios.get(`${process.env.FACEBOOK_API_URL}/${igID.instagram_business_account}/media?fields=caption,comments_count,is_comment_enabled,ig_id,like_count,media_type,media_url,owner,permalink,shortcode,thumbnail_url,timestamp,username&limit=1000&access_token=${user.token}`))
      }
      return Promise.all(promisesAllMedia)
    })
    .then( (medias) => {
      let promisesMediaUpdates = []
      for (let mediasPerProfile of medias) {
        for (let media of mediasPerProfile.data.data) {
          promisesMediaUpdates.push(db.Media.findOrCreate({ where: { media_id: media.id }})
            .then( (mediaCreated) => {
              return mediaCreated[0].update({
                instagram_business_account: media.owner.id,
                caption: media.caption,
                comments_count: media.comments_count,
                ig_id: media.id,
                is_comment_enabled: media.is_comment_enabled,
                like_count: media.like_count,
                media_type: media.media_type,
                media_url: media.media_url,
                permalink: media.permalink,
                shortcode: media.shortcode,
                thumbnail_url: media.thumbnail_url,
                timestamp: media.timestamp,
                username: media.username
              }, {returning: true})
            })
            .then( (updatedMedia) => {
              return getMediaInsights(user, updatedMedia)
            })
          )
        }
      }
      return Promise.all(promisesMediaUpdates)
    })
}

function getMediaInsights(user, media) {
  return db.MediaInsight.findOne({
    where: { media_id: media.media_id },
    order: [ [ 'createdAt', 'DESC' ]]
  }).then( (mediaInsight) => {
    if (!mediaInsight || mediaInsight.like_count !== media.like_count || mediaInsight.comments_count !== media.comments_count) {
      if ( media.valid_business_account === false ) {
        return db.MediaInsight.create({
          media_id: media.media_id,
          like_count: media.like_count,
          comments_count: media.comments_count
        });
      }
      let request = `${process.env.FACEBOOK_API_URL}/${media.media_id}/insights?metric=engagement,impressions,reach,saved,video_views&access_token=${user.token}`
      if (media.media_type === 'IMAGE') request = `${process.env.FACEBOOK_API_URL}/${media.media_id}/insights?metric=engagement,impressions,reach,saved&access_token=${user.token}`
      if (media.media_type === 'CAROUSEL_ALBUM') request = `${process.env.FACEBOOK_API_URL}/${media.media_id}/insights?metric=carousel_album_engagement,carousel_album_impressions,carousel_album_reach,carousel_album_saved,carousel_album_video_views&access_token=${user.token}`
      return axios.get(request).then( (insights) => {
        if (!insights.data || !insights.data.data) {
          return null
        }
        return db.MediaInsight.create({
          media_id: media.media_id,
          like_count: media.like_count,
          comments_count: media.comments_count,
          engagement: insights.data.data[0] ? insights.data.data[0].values[0].value : 0,
          impressions: insights.data.data[1] ? insights.data.data[1].values[0].value : 0,
          reach: insights.data.data[2] ? insights.data.data[2].values[0].value : 0,
          saved: insights.data.data[3] ? insights.data.data[3].values[0].value : 0,
          video_views: insights.data.data[4] ? insights.data.data[4].values[0].value : 0
        })
      })
      .catch( err => {
        if (err.response && err.response.status === 400 && err.response.data.error.code === 100 && err.response.data.error.error_subcode === 2108006) {
          logger.error('User account was not a business account when the media was posted')
          logger.error(err.response.data.error)
          return db.Media.update({
            valid_business_account: false
          },
          {
            where: { media_id: media.media_id }
          })
        } else {
          throw new Error(err)
        }
      })
    }
    return null
  })
}