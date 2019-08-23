'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'orders',
        'txnId',
        {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        }
      )
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('orders', 'txnId')
    ])
  }
}