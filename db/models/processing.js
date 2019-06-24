'use strict'
module.exports = (sequelize, DataTypes) => {
  const Processing = sequelize.define('processing', {
    config: DataTypes.JSON,
    status: DataTypes.STRING,
    outputFilename: DataTypes.STRING
  })
  Processing.associate = function(models) {
    Processing.belongsTo(models.song, {
      foreignKey: 'songId',
      as: 'song'
    })
    Processing.belongsTo(models.user, {
      foreignKey: 'usrId',
      as: 'buyer'
    })
    Processing.belongsTo(models.order, {
      foreignKey: 'orderId',
      as: 'order'
    })
  }
  return Processing
}