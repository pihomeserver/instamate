const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let StoryInsight = sequelize.define('StoryInsight', {
    media_id: {
      type: DataTypes.STRING(20)
    },
    exits: {
      type: DataTypes.INTEGER
    },
    impressions: {
      type: DataTypes.INTEGER
    },
    reach: {
      type: DataTypes.INTEGER
    },
    replies: {
      type: DataTypes.INTEGER
    },
    taps_forward: {
      type: DataTypes.INTEGER
    },
    taps_back: {
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: true,
    updatedAt: false
  });

  return StoryInsight;
};