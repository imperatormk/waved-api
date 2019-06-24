'use strict'
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admin', {})

  Admin.associate = function(models) {
    Admin.belongsTo(models.user, {
      foreignKey: 'usrId',
      as: 'user'
    })
  }
  return Admin
}