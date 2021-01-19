const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let UserLifetimeInsight = sequelize.define('UserLifetimeInsight', {
    instagram_business_account: {
      type: DataTypes.STRING(20),
      primaryKey: true
    },
    insight_date: {
      type: DataTypes.DATE,
      primaryKey: true
    },
    insight_type: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    value: {
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: false
  });

  return UserLifetimeInsight;
};