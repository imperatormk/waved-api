'use strict'
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('order', {
    status: DataTypes.STRING
  })
  Order.associate = function(models) {
    Order.hasOne(models.processing, {
      foreignKey: 'orderId',
      as: 'processing'
    })
  }
  return Order
}