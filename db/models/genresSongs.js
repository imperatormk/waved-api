'use strict'
module.exports = (sequelize, DataTypes) => {
  const GenresSongs = sequelize.define('genresSongs', {
    songId: DataTypes.INTEGER,
    genreId: DataTypes.INTEGER
  }, {
    timestamps: false
  })
  return GenresSongs
}