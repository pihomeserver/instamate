const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let Media = sequelize.define('Media', {
    instagram_business_account: {
      type: DataTypes.STRING(20)
    },
    media_id: {
      type: DataTypes.STRING(20)
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
      type: DataTypes.STRING(30)
    },
    media_url: {
      type: DataTypes.STRING(2048)
    },
    permalink: {
      type: DataTypes.STRING
    },
    shortcode: {
      type: DataTypes.STRING(50)
    },
    thumbnail_url: {
      type: DataTypes.STRING(2048)
    },
    timestamp: {
      type: DataTypes.STRING(25)
    },
    username : {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });

  return Media;
};