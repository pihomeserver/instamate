const db = require('../config/database');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const insightsReels = require('./insights.reels');
const logger = require('../config/logger')

const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Mobile Safari/537.36'
  }

exports.getAllUsersReels = () => {
  return db.User.findAll().then( (users) => {
    let promisesInsights = []
    for( let user of users) {
      // Update last posted reels (in last 12 posts)
      promisesInsights.push(insightsReels.getUserReels(user))
      // Get insights of identified reels
      promisesInsights.push(insightsReels.getUserReelsInsights(user))
    }
    return Promise.all(promisesInsights)
  })
}

exports.getUserReels = (user) => {
  return db.Page.findAll({ attributes: ['name'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesAllReels = []
      for (let igID of igIDs) {
        promisesAllReels.push(axios.get(`https://www.instagram.com/${igID.name}/channel/?__a=1`, {config: {headers: headers} }))
      }
      return Promise.all(promisesAllReels)
    })
    .then( (repliesArray) => {
      let promisesReelsUpdates = []
      for (let reply of repliesArray) {
        if (reply.data && reply.data.graphql) {
          const igBusinessAccount = reply.data.graphql.user.fbid
          const isBusinessAccount = reply.data.graphql.user.is_business_account
          for (let reels of reply.data.graphql.user.edge_owner_to_timeline_media.edges) {
            // A reels is a portrait video with a height of 1333 (?)
            if (reels.node.__typename === "GraphVideo" &&
                reels.node.is_video === true &&
                reels.node.dimensions.height === 1333 &&
                reels.node.dimensions.height > reels.node.dimensions.width) {
              let media = reels.node
              promisesReelsUpdates.push(db.Media.findOrCreate({
                where: { media_id: media.id },
                defaults: {
                  instagram_business_account: igBusinessAccount,
                  media_id: media.id,
                  media_type: 'REELS',
                  shortcode: media.shortcode,
                  valid_business_account: isBusinessAccount,
                  username: media.owner.username
                }
              }))
            }
          }
        } else {
          logger.error('Reels - Unable to retrieve JSON information of the profile');
        }
      }
      return Promise.all(promisesReelsUpdates)
    })
}

exports.getUserReelsInsights = (user) => {
  return db.Page.findAll({ attributes: ['instagram_business_account'], where:{facebookId: user.id}})
    .then( (igIDs) => {
      let promisesAllReels = []
      for (let igID of igIDs) {
        promisesAllReels.push(db.Media.findAll({ where: { instagram_business_account: igID.instagram_business_account, media_type: 'REELS' }}))
      }
      return Promise.all(promisesAllReels)
    })
    .then( (medias) => {
      let promisesReelsInsights = []
      for (let mediasPerProfile of medias) {
        for (let media of mediasPerProfile) {
          promisesReelsInsights.push(axios.get(`https://www.instagram.com/reel/${media.shortcode}?__a=1`, {config: {headers: headers} }))
        }
      }
      return Promise.all(promisesReelsInsights)
    })
    .then( (insights) => {
      // throw {response: {status: 429, message: 'Request error (429) with too many attemps'}}
      let promisesReelsUpdates = []
      for (let insight of insights) {
        if (insight.data && insight.data.graphql) {
          let media = insight.data.graphql.shortcode_media
          const timestamp = new Date(media.taken_at_timestamp * 1000)
          promisesReelsUpdates.push(db.Media.update({
            caption: media.edge_media_to_caption.edges[0].node.text,
            comments_count: media.edge_media_to_parent_comment['count'],
            is_comment_enabled: !media.comments_disabled,
            like_count: media.edge_media_preview_like.count,
            media_url: media.video_url,
            permalink: `https://www.instagram.com/p/${media.shortcode}/`,
            thumbnail_url: media.display_url,
            timestamp: timestamp.toISOString().slice(0,19)+'+0000'
          }, {
            where: { media_id: media.id }
          })
          .then( () => {
            return getReelsInsights(user, media)
          })
          )
        }
      }
      return Promise.all(promisesReelsUpdates)
    })
    .catch( error => {
      if (error.response && error.response.status) {
        if (error.response.status === 404) {
          const shortcode = error.response.config.url.split('/')[4].split('?')[0]
          logger.error(`Request error (404) for media ${shortcode}`)
          throw `Request error (404) for media ${shortcode}`
        }
        if (error.response.status === 429) {
          logger.error(`Request error (429) with too many attemps`)
          throw `Request error (429) with too many attemps`
        }
        logger.error(error)
        throw 'Request error'
      } else {
        logger.error(error)
        throw 'Request error'
      }
    })
}

function getReelsInsights(user, media) {
  return db.MediaInsight.findOne({
    where: { media_id: media.id },
    order: [ [ 'createdAt', 'DESC' ]]
  }).then( (mediaInsight) => {
    if (!mediaInsight || mediaInsight.like_count !== media.edge_media_preview_like.count || mediaInsight.comments_count !== media.edge_media_to_parent_comment['count']) {
      if ( media.valid_business_account === false ) {
        return db.MediaInsight.create({
          media_id: media.media_id,
          like_count: media.edge_media_preview_like.count,
          comments_count: media.edge_media_to_parent_comment['count']
        });
      }
      return db.MediaInsight.create({
        media_id: media.id,
        like_count: media.edge_media_preview_like.count,
        comments_count: media.edge_media_to_parent_comment['count'],
        engagement: media.edge_media_preview_like.count + media.edge_media_to_parent_comment['count'],
        impressions: media.video_play_count,
        reach: media.video_play_count,
        video_views: media.video_view_count
      })
    }
  })
}