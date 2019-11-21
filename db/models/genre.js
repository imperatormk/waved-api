'use strict'
module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('genre', {
    name: DataTypes.STRING,
    tag: DataTypes.STRING
  }, {
    timestamps: false
  })
  Genre.associate = function(models) {
    Genre.belongsToMany(models.song, {
      through: 'genresSongs'
    })
  }
  return Genre
}