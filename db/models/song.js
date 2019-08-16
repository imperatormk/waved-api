'use strict'
module.exports = (sequelize, DataTypes) => {
  const Song = sequelize.define('song', {
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    genre: DataTypes.STRING,
    price: DataTypes.FLOAT,
    duration: DataTypes.INTEGER,
  })
  Song.associate = function(models) {
    Song.hasMany(models.track, {
      foreignKey: 'songId',
      as: 'tracks'
    })
  }
  return Song
}