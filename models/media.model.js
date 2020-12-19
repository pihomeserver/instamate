const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let Media = sequelize.define('Media', {
    instagram_business_account: {
      type: DataTypes.STRING
    },
    media_id: {
      type: DataTypes.STRING
    },
    valid_business_account: {
      type: DataTypes.BOOLEAN
    },
    caption: {
      type: DataTypes.STRING(2200)
    },
    comments_count: {
      type: DataTypes.INTEGER
    },
    is_comment_enabled: {
      type: DataTypes.BOOLEAN
    },
    like_count: {
      type: DataTypes.INTEGER
    },
    media_type: {
      type: DataTypes.STRING
    },
    media_url: {
      type: DataTypes.STRING(2048)
    },
    owner: {
      type: DataTypes.STRING
    },
    permalink: {
      type: DataTypes.STRING
    },
    shortcode: {
      type: DataTypes.STRING
    },
    thumbnail_url: {
      type: DataTypes.STRING(2048)
    },
    timestamp: {
      type: DataTypes.STRING
    },
    username : {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });

  return Media;
};