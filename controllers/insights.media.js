const db = require('../config/database');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const insightsMedia = require('./insights.media');
const logger = require('../config/logger')

exports.getAllUsersMedia = () => {
  return db.User.findAll().then( (users) => {
    let promisesInsights = []
    for( let user of users) {
      promisesInsights.push(insightsMedia.getUserMedia(user))
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