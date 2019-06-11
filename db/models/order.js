'use strict'
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('order', {
    status: DataTypes.STRING
  })
  Order.associate = function(models) {
    Order.belongsTo(models.user, {
      foreignKey: 'usrId',
      as: 'user'
    })
    Order.belongsTo(models.song, {
      foreignKey: 'songId',
      as: 'song'
    })
  }
  return Order
}