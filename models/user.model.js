const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  let User = sequelize.define('User', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING
    },
    token: {
      type: DataTypes.STRING
    },
    analysed: {
      type: DataTypes.STRING
    }
  });

  return User;
};