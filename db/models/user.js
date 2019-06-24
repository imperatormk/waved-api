'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING
  })
  User.associate = function(models) {
    User.hasMany(models.processing, {
      foreignKey: 'usrId',
      as: 'processings'
    })
  }
  return User
}