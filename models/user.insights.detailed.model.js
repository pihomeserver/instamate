const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let UserDetailedInsight = sequelize.define('UserDetailedInsight', {
    instagram_business_account: {
      type: DataTypes.STRING
    },
    insight_date: {
      type: DataTypes.DATE
    },
    email_contacts: {
      type: DataTypes.INTEGER
    },
    follower_count: {
      type: DataTypes.INTEGER
    },
    get_directions_clicks: {
      type: DataTypes.INTEGER
    },
    impressions: {
      type: DataTypes.INTEGER
    },
    phone_call_clicks: {
      type: DataTypes.INTEGER
    },
    profile_views: {
      type: DataTypes.INTEGER
    },
    reach: {
      type: DataTypes.INTEGER
    },
    text_message_clicks: {
      type: DataTypes.INTEGER
    },
    website_clicks: {
      type: DataTypes.INTEGER
    },
    online_followers: {
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: false
  });

  return UserDetailedInsight;
};