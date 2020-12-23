const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let Page = sequelize.define('Page', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(20)
    },
    name: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING(50)
    },
    facebookId: {
      type: DataTypes.STRING(20)
    },
    instagram_business_account: {
      type: DataTypes.STRING(20)
    }
  });

  return Page;
};