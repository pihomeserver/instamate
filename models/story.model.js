const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let Story = sequelize.define('Story', {
    instagram_business_account: {
      type: DataTypes.STRING(20)
    },
    media_id: {
      type: DataTypes.STRING(20)
    },
    caption: {
      type: DataTypes.STRING(2200)
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
    freezeTableName: true,
    timestamps: true,
    updatedAt: false
  });

  return Story;
};