const db = require('../config/database');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const insightsStories = require('./insights.stories');
const logger = require('../config/logger')


exports.getAllUsersStories = () => {
  return db.User.findAll().then( (users) => {
    let promisesStoriesInsights = []
    for( let user of users) {
      promisesStoriesInsights.push(insightsStories.getUserStories(user))
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
      for (let userStories of storiesPerUser) {
        for (let storie of userStories.data.data) {
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