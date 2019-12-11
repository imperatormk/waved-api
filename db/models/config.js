'use strict'
module.exports = (sequelize, DataTypes) => {
  const Config = sequelize.define('config', {
    key: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    value: DataTypes.STRING
  }, {
    freezeTableName: true,
    timestamps: false
  })
  return Config
}