const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let Page = sequelize.define('Page', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING
    },
    facebookId: {
      type: DataTypes.STRING
    },
    instagram_business_account: {
      type: DataTypes.STRING
    }
  });

  return Page;
};