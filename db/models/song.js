'use strict'
module.exports = (sequelize, DataTypes) => {
  const Song = sequelize.define('song', {
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    price: DataTypes.FLOAT,
    slug: DataTypes.STRING,
    bpm: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    demoArea: DataTypes.JSONB,
    published: DataTypes.BOOLEAN,
    archived: DataTypes.BOOLEAN
  })
  Song.associate = function(models) {
    Song.hasMany(models.track, {
      foreignKey: 'songId',
      as: 'tracks'
    })
    Song.belongsToMany(models.genre, {
      through: 'genresSongs',
      as: 'genres'
    })
  }
  return Song
}