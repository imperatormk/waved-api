'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'songs',
        'genre',
        {
          type: Sequelize.STRING,
          allowNull: false
        }
      )
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('songs', 'genre')
    ])
  }
}