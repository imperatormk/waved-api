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

const genres = (Sequelize) => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tag: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
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
  thumbnail: {
    type: Sequelize.STRING
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: true
  },
  duration: {
    type: Sequelize.INTEGER,
    defaultValue: 0
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

const genresSongs = (Sequelize) => ({
  genreId: {
    type: Sequelize.INTEGER,
    onDelete: 'SET NULL',
    references: {
      model: 'genres',
      key: 'id',
      as: 'genreId'
    },
    allowNull: true
  },
  songId: {
    type: Sequelize.INTEGER,
    onDelete: 'SET NULL',
    references: {
      model: 'songs',
      key: 'id',
      as: 'songId'
    },
    allowNull: true
  }
})

const admins = (Sequelize) => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
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
    type: Sequelize.JSONB, // { type: String, name: String }
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
  txnId: {
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
  outputFilename: {
    type: Sequelize.STRING,
    allowNull: true
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
    onDelete: 'SET NULL',
    references: {
      model: 'orders',
      key: 'id',
      as: 'orderId'
    },
    allowNull: true
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

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      const usersP = queryInterface.createTable('users', users(Sequelize))
      const genresP = queryInterface.createTable('genres', genres(Sequelize))
      const songsP = queryInterface.createTable('songs', songs(Sequelize))
      return Promise.all([usersP, genresP, songsP])
        .then(() => {
          const genresSongsP = queryInterface.createTable('genresSongs', genresSongs(Sequelize))
          return Promise.all([genresSongsP])
            .then(() => {
              const adminsP = queryInterface.createTable('admins', admins(Sequelize))
              const tracksP = queryInterface.createTable('tracks', tracks(Sequelize))
              const ordersP = queryInterface.createTable('orders', orders(Sequelize))
              return Promise.all([adminsP, tracksP, ordersP])
                .then(() => {
                  const processingsP = queryInterface.createTable('processings', processings(Sequelize))
                  return Promise.all([processingsP])
                })
            })
        })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      const processingsP = queryInterface.dropTable('processings')
      return Promise.all([processingsP])
        .then(() => {
          const adminsP = queryInterface.dropTable('admins')
          const tracksP = queryInterface.dropTable('tracks')
          const ordersP = queryInterface.dropTable('orders')
          return Promise.all([adminsP, tracksP, ordersP])
            .then(() => {
              const genresSongsP = queryInterface.dropTable('genresSongs')
              return Promise.all([genresSongsP])
              .then(() => {
                const usersP = queryInterface.dropTable('users')
                const genresP = queryInterface.dropTable('genres')
                const songsP = queryInterface.dropTable('songs')
                  return Promise.all([usersP, genresP, songsP])
                })
            })
        })
    })
  }
}