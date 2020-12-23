const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let MediaInsight = sequelize.define('MediaInsight', {
    media_id: {
      type: DataTypes.STRING(20)
    },
    comments_count: {
      type: DataTypes.INTEGER
    },
    like_count: {
      type: DataTypes.INTEGER
    },
    engagement: {
      type: DataTypes.INTEGER
    },
    impressions: {
      type: DataTypes.INTEGER
    },
    reach: {
      type: DataTypes.INTEGER
    },
    saved: {
      type: DataTypes.INTEGER
    },
    video_views: {
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: true,
    updatedAt: false
  });

  return MediaInsight;
};