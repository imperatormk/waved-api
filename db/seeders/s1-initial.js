'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
  	  const users = queryInterface.bulkInsert('users', [{
      	username: 'mr.mach',
        password: '$2y$12$bJebJvoEk3YdbskBW7KuoePMgfGqQAh6TXfz1tdDamNZQLBJYxb6W',
        name: 'Martin',
        surname: 'Mrmach',
        bio: 'Coder?',
        email: 'mr.mach@gmail.com',
        phone: '069-320-420',
        createdAt: Sequelize.fn('NOW'), // temp
        updatedAt: Sequelize.fn('NOW') // temp
      }, {
      	username: 'imperatormk',
        password: '$2b$12$Q3lLMkZoMhEMg03a7deHBeksDQwB8k1rllH83zA7vyG7Ue7Y6g5ry',
        name: 'Darko',
        surname: 'Simonovski',
        bio: 'Coder?',
        email: 'darko.simonovski@hotmail.com',
        phone: '076-314-010',
        createdAt: Sequelize.fn('NOW'), // temp
        updatedAt: Sequelize.fn('NOW') // temp
      }], {})

      const songs = queryInterface.bulkInsert('songs', [{
        title: 'Creeping Death',
        artist: 'Metallica',
        price: 2.99
      }, {
        title: 'Master of Puppets',
        artist: 'Metallica',
        price: 5.49
      }], {})
  
  	  return Promise.all([users, songs]).then(() => {
        const tracks = queryInterface.bulkInsert('tracks', [{
          instrument: 'guitar',
          url: 'creepingdeath_guitartrack',
          status: 'PREPARING',
          songId: 1,
          createdAt: Sequelize.fn('NOW'), // temp
          updatedAt: Sequelize.fn('NOW') // temp
        }, {
          instrument: 'drums',
          url: 'creepingdeath_drumtrack',
          status: 'PREPARING',
          songId: 1,
          createdAt: Sequelize.fn('NOW'), // temp
          updatedAt: Sequelize.fn('NOW') // temp
        }, {
          instrument: 'guitar',
          url: 'mop_guitartrack',
          status: 'PREPARING',
          songId: 2,
          createdAt: Sequelize.fn('NOW'), // temp
          updatedAt: Sequelize.fn('NOW') // temp
        }, {
          instrument: 'drums',
          url: 'mop_drumtrack',
          status: 'ERROR',
          songId: 2,
          createdAt: Sequelize.fn('NOW'), // temp
          updatedAt: Sequelize.fn('NOW') // temp
        }], {})

      	return Promise.all([tracks])
      })
  },
  down: (queryInterface, Sequelize) => {
    const tracks = queryInterface.bulkDelete('tracks', null, {})
    return Promise.all([tracks])
      .then(() => {
        const users = queryInterface.bulkDelete('users', null, {})
        const songs = queryInterface.bulkDelete('songs', null, {})
        return Promise.all([users, songs])
      })
  }
}