const db = require('../config/database');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const insightsUsers = require('./insights.users');
const _ = require('lodash')
const logger = require('../config/logger')

/**
 * Get insights for all users with a token
 */
 exports.getAllUsersInsights = () => {
  return db.User.findAll().then( (users) => {
    let promisesInsights = []
    for( let user of users) {
      promisesInsights.push(insightsUsers.getUserInsights(user))
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
  const timezone = "T08:00:00+0000"
  let todayDate = new Date()
  const offset = todayDate.getTimezoneOffset();
  todayDate = new Date(todayDate.getTime() + (offset*60*1000));
  const today = todayDate.toISOString().split('T')[0]+timezone
  todayDate.setDate(todayDate.getDate() - 1)
  const yesterday = todayDate.toISOString().split('T')[0]+timezone
  // Due to day switch and missing current day
  todayDate.setDate(todayDate.getDate() - 1)
  const beforeYesterday = todayDate.toISOString().split('T')[0]+timezone

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
            updatedData[insightDate.end_time.split('T')[0]+timezone][field.name] = insightDate.value
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
      promisesInsights.push(insightsUsers.getUserLifetimeInsights(user))
    }
    return Promise.all(promisesInsights)
  })
}

exports.getUserLifetimeInsights = (user) => {
  let actions = []
  actions.push(getUserAudienceInsights(user))
  actions.push(getUserOnlineFollowersInsights(user))
  return Promise.all(actions)
};

function getUserOnlineFollowersInsights(user) {
  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesOnlineInsights = []
      const since = Math.trunc((Date.now()-7*24*3600000)/1000)
      for (let igID of igIDs) {
        promisesOnlineInsights.push(axios.get(`${process.env.FACEBOOK_API_URL}/${igID.instagram_business_account}/insights?metric=online_followers&period=lifetime&since=${since}&access_token=${user.token}`))
      }
      return Promise.all(promisesOnlineInsights)
    })
    .then( (onlineFollowersInsights) => {
      let insightsUpdates = []
      for (let onlineFollowersInsight of onlineFollowersInsights) {
        for (let insightUser of onlineFollowersInsight.data.data) {
          let igID = insightUser.id.split('/')[0]
          let insightType = insightUser.name
          for (let insightUserPerDate in insightUser.values) {
            let insightDate = insightUser.values[insightUserPerDate].end_time
            for (let keyCode in insightUser.values[insightUserPerDate].value) {
              insightsUpdates.push(db.UserLifetimeInsight.upsert({
                instagram_business_account: igID,
                insight_date: insightDate,
                insight_type: insightType,
                key: keyCode,
                value: insightUser.values[insightUserPerDate].value[keyCode]
              }))
            }
          }
        }
      }
      return Promise.all(insightsUpdates)
    })
}

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