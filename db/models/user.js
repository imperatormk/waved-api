'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    bio: DataTypes.TEXT,
    email: DataTypes.STRING,
    phone: DataTypes.STRING
  })
  User.associate = function(models) {
    User.hasMany(models.order, {
      foreignKey: 'usrId',
      as: 'orders'
    })
  }
  return User
}