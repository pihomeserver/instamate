const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let Story = sequelize.define('Story', {
    instagram_business_account: {
      type: DataTypes.STRING
    },
    media_id: {
      type: DataTypes.STRING
    },
    caption: {
      type: DataTypes.STRING(2200)
    },
    media_type: {
      type: DataTypes.STRING
    },
    media_url: {
      type: DataTypes.STRING(2048)
    },
    permalink: {
      type: DataTypes.STRING
    },
    shortcode: {
      type: DataTypes.STRING
    },
    timestamp: {
      type: DataTypes.STRING
    },
    username : {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true,
    timestamps: true,
    updatedAt: false
  });

  return Story;
};