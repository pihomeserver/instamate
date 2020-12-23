const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let UserInsight = sequelize.define('UserInsight', {
    instagram_business_account: {
      type: DataTypes.STRING(20)
    },
    media_count: {
      type: DataTypes.INTEGER
    },
    followers_count: {
      type: DataTypes.INTEGER
    },
    follows_count: {
      type: DataTypes.INTEGER
    },
    likes_count: {
      type: DataTypes.INTEGER
    },
    comments_count: {
      type: DataTypes.INTEGER
    },
  }, {
    timestamps: true,
    updatedAt: false,
    createdAt: 'insight_date'
  });

  return UserInsight;
};