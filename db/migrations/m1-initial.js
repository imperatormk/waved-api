'use strict'

const users = (Sequelize) => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  }
})

const songs = (Sequelize) => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  artist: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  }
})

const tracks = (Sequelize) => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  songId: {
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'songs',
      key: 'id',
      as: 'songId'
    },
    allowNull: false
  },
  instrument: {
    type: Sequelize.STRING,
    allowNull: false
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  }
})

const orders = (Sequelize) => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW // bad
  }
})

const processings = (Sequelize) => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  config: {
    type: Sequelize.JSON,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false
  },
  usrId: {
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id',
      as: 'usrId'
    },
    allowNull: false
  },
  songId: {
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'songs',
      key: 'id',
      as: 'songId'
    },
    allowNull: false
  },
  orderId: {
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'orders',
      key: 'id',
      as: 'orderId'
    },
    allowNull: false
  }
})

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      const usersP = queryInterface.createTable('users', users(Sequelize))
      const songsP = queryInterface.createTable('songs', songs(Sequelize))
      return Promise.all([usersP, songsP])
        .then(() => {
          const tracksP = queryInterface.createTable('tracks', tracks(Sequelize))
          const ordersP = queryInterface.createTable('orders', orders(Sequelize))
          return Promise.all([tracksP, ordersP])
            .then(() => {
              const processingsP = queryInterface.createTable('processings', processings(Sequelize))
              return Promise.all([processingsP])
            })
        })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      const processingsP = queryInterface.dropTable('processings')
      return Promise.all([processingsP])
        .then(() => {
          const tracksP = queryInterface.dropTable('tracks')
          const ordersP = queryInterface.dropTable('orders')
          return Promise.all([tracksP, ordersP])
            .then(() => {
              const usersP = queryInterface.dropTable('users')
              const songsP = queryInterface.dropTable('songs')
              return Promise.all([usersP, songsP])
            })
        })
    })
  }
}