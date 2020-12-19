const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let UserProfile = sequelize.define('UserProfile', {
    instagram_business_account: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    biography: {
      type: DataTypes.STRING
    },
    profile_picture_url: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true,
    updatedAt: false,
    createdAt: 'profile_date'
  });

  return UserProfile;
};