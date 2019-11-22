'use strict'
module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define('track', {
    instrument: DataTypes.JSONB,
    url: DataTypes.STRING,
    status: DataTypes.STRING
  })
  Track.associate = function(models) {
    Track.belongsTo(models.song, {
      foreignKey: 'songId',
      as: 'song'
    })
  }
  return Track
}