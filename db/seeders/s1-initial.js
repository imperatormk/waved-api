'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    const users = queryInterface.bulkInsert('users', [{
      username: 'mr.mach',
      password: '$2b$12$Q3lLMkZoMhEMg03a7deHBeksDQwB8k1rllH83zA7vyG7Ue7Y6g5ry',
      email: 'mr.mach@gmail.com',
      createdAt: Sequelize.fn('NOW'), // temp
      updatedAt: Sequelize.fn('NOW') // temp
    }, {
      username: 'imperatormk',
      password: '$2b$12$Q3lLMkZoMhEMg03a7deHBeksDQwB8k1rllH83zA7vyG7Ue7Y6g5ry',
      email: 'darko.simonovski@hotmail.com',
      createdAt: Sequelize.fn('NOW'), // temp
      updatedAt: Sequelize.fn('NOW') // temp
    }], {})
    return Promise.all([users])
      .then(() => {
        const admins = queryInterface.bulkInsert('admins', [{
          usrId: 2
        }], {})
        return Promise.all([admins])
      })
  },
  down: (queryInterface, Sequelize) => {
    const admins = queryInterface.bulkDelete('admins', null, {})
    return Promise.all([admins])
      .then(() => {
        const users = queryInterface.bulkDelete('users', null, {})
        return Promise.all([users])
      })
  }
}